#!/usr/bin/env python3
"""HTTP server with NetEase audio proxy for direct <audio> playback."""
import http.server
import urllib.request
import urllib.parse
import json
import re
import sys
import os
import time
import threading

PORT = int(os.environ.get('PORT', 8767))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# In-memory cache: { song_id -> (url, expiry_timestamp) }
_url_cache = {}
_cache_lock = threading.Lock()
CACHE_TTL = 3600

# Pre-generated CDN cache from China IP (loaded from netease_cache.json)
_song_cache = {}
_cache_file = os.path.join(BASE_DIR, 'netease_cache.json')

# Local MP3 cache directory — once downloaded, served directly without CDN dependency
AUDIO_CACHE_DIR = os.path.join(BASE_DIR, 'audio_cache')
os.makedirs(AUDIO_CACHE_DIR, exist_ok=True)
try:
    with open(_cache_file, 'r') as f:
        data = json.load(f)
        _song_cache = data.get('songs', {})
    ct = len([s for s in _song_cache.values() if s.get('url')])
    print(f'[cache] Loaded {ct} cached song URLs from {_cache_file}')
except Exception as e:
    print(f'[cache] WARNING: Failed to load cache: {e}', file=sys.stderr)

UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
      'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
REFERER = 'https://music.163.com/'

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_POST(self):
        if urllib.parse.urlparse(self.path).path == '/api/error':
            self._handle_error_report()
        else:
            self.send_error(404)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        clean_path = parsed.path  # path without query string

        if clean_path == '/' or clean_path == '/index.html':
            clean_path = '/preview.html'
        if clean_path.startswith('/audio/'):
            self.handle_audio()
        elif clean_path.startswith('/api/stream'):
            self.handle_stream()
        elif clean_path == '/api/aqi':
            self.handle_aqi()
        elif clean_path == '/api/ping':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            cache_count = len([s for s in _song_cache.values() if s.get('url')])
            self.wfile.write(json.dumps({
                'ok': True,
                'cache_songs': cache_count,
                'cache_file': os.path.basename(_cache_file),
            }).encode())
        elif clean_path == '/api/error':
            self._handle_error_report()
        elif clean_path.endswith('.html'):
            # HTML files — serve with no-cache for instant updates
            fs_path = self.translate_path(clean_path)
            if os.path.isfile(fs_path):
                self.send_response(200)
                self.send_header('Content-type', 'text/html; charset=utf-8')
                self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
                self.send_header('Pragma', 'no-cache')
                self.send_header('Expires', '0')
                self.end_headers()
                with open(fs_path, 'rb') as f:
                    self.wfile.write(f.read())
            else:
                self.send_error(404)
        else:
            super().do_GET()

    def _handle_error_report(self):
        length = int(self.headers.get('Content-Length', 0))
        if length > 0 and length < 4096:
            body = json.loads(self.rfile.read(length))
            print(f'[client-error] {body.get("msg","?")} | line {body.get("line","?")} | url {body.get("url","?")}', file=sys.stderr, flush=True)
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b'{"ok":true}')

    def handle_audio(self):
        """Serve cached MP3 files directly from audio_cache/."""
        filename = self.path.split('/')[-1].split('?')[0]  # e.g. "s001.mp3"
        if not re.match(r'^[a-zA-Z0-9._-]+\.mp3$', filename):
            self.send_error(404)
            return
        filepath = os.path.join(AUDIO_CACHE_DIR, filename)
        if os.path.isfile(filepath) and os.path.getsize(filepath) > 0:
            self._serve_file(filepath)
        else:
            self.send_error(404)

    def handle_aqi(self):
        try:
            req = urllib.request.Request(
                'https://api.waqi.info/feed/here/?token=demo',
                headers={'User-Agent': UA}
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read())
            aqi_data = data.get('data', {})
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Cache-Control', 'public, max-age=1800')
            self.end_headers()
            self.wfile.write(json.dumps({
                'city': aqi_data.get('city', {}).get('name', 'Unknown'),
                'aqi': aqi_data.get('aqi', 'N/A'),
                'level': aqi_data.get('dominentpol', ''),
                'ts': time.time(),
            }).encode())
        except Exception as e:
            print(f'[aqi] fetch error: {e}', file=sys.stderr)
            self.send_error(502, 'AQI unavailable')

    def handle_stream(self):
        qs = urllib.parse.urlparse(self.path).query
        params = urllib.parse.parse_qs(qs)
        song_key = params.get('id', [None])[0]  # e.g. "s001"
        title = params.get('title', [None])[0]
        ne_id = params.get('neid', [None])[0]

        if not song_key:
            self.send_error(400, 'Missing id parameter')
            return

        try:
            url = get_netease_url(song_key, title, ne_id)
            if not url:
                self.send_response(451)
                self.send_header('Content-Type', 'text/plain; charset=utf-8')
                self.end_headers()
                self.wfile.write(b'Copyright restricted - no free stream available')
                return

            # Check local MP3 cache first — serves without CDN dependency
            cache_path = os.path.join(AUDIO_CACHE_DIR, f'{song_key}.mp3')
            if os.path.exists(cache_path) and os.path.getsize(cache_path) > 0:
                self._serve_file(cache_path)
                return

            # Proxy audio from CDN and save to local cache
            range_header = self.headers.get('Range', '')
            req_headers = {'User-Agent': UA, 'Referer': REFERER}
            if range_header:
                req_headers['Range'] = range_header

            try:
                req = urllib.request.Request(url, headers=req_headers)
                with urllib.request.urlopen(req, timeout=15) as upstream:
                    ct = upstream.headers.get('Content-Type', 'audio/mpeg')
                    cl = upstream.headers.get('Content-Length', '')
                    code = 206 if range_header else 200
                    self.send_response(code)
                    self.send_header('Content-Type', ct)
                    if cl:
                        self.send_header('Content-Length', cl)
                    self.send_header('Accept-Ranges', 'bytes')
                    self.send_header('Cache-Control', 'public, max-age=86400')
                    self.end_headers()
                    # Stream to client while saving to local cache
                    tmp_path = cache_path + '.tmp'
                    try:
                        with open(tmp_path, 'wb') as f:
                            while True:
                                chunk = upstream.read(65536)
                                if not chunk:
                                    break
                                self.wfile.write(chunk)
                                f.write(chunk)
                        os.rename(tmp_path, cache_path)
                        print(f'[stream] cached: {song_key} ({os.path.getsize(cache_path)} bytes)')
                    except (BrokenPipeError, ConnectionResetError):
                        pass  # client disconnected early
            except Exception as e:
                print(f'[stream] proxy error for {song_key}: {e}', file=sys.stderr)
                # Remove stale URL from all caches
                with _cache_lock:
                    _url_cache.pop(song_key, None)
                    _url_cache.pop(ne_id, None)
                if song_key in _song_cache:
                    del _song_cache[song_key]
                try:
                    self.send_response(451)
                    self.send_header('Content-Type', 'text/plain; charset=utf-8')
                    self.end_headers()
                    self.wfile.write(b'CDN expired')
                except (BrokenPipeError, ConnectionResetError):
                    pass
        except Exception as e:
            self.send_error(500, str(e))

    def _serve_file(self, path):
        """Serve a local file with Range support (required for iOS Safari)."""
        size = os.path.getsize(path)
        range_header = self.headers.get('Range', '')

        if range_header and range_header.startswith('bytes='):
            try:
                range_val = range_header[6:]
                if '-' in range_val:
                    parts = range_val.split('-', 1)
                    start = int(parts[0]) if parts[0] else 0
                    end = int(parts[1]) if parts[1] else size - 1
                else:
                    start = int(range_val)
                    end = size - 1

                start = max(0, min(start, size - 1))
                end = max(start, min(end, size - 1))
                length = end - start + 1

                self.send_response(206)
                self.send_header('Content-Type', 'audio/mpeg')
                self.send_header('Content-Length', str(length))
                self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
                self.send_header('Accept-Ranges', 'bytes')
                self.send_header('Cache-Control', 'public, max-age=86400')
                self.end_headers()

                with open(path, 'rb') as f:
                    f.seek(start)
                    remaining = length
                    while remaining > 0:
                        chunk = f.read(min(65536, remaining))
                        if not chunk:
                            break
                        try:
                            self.wfile.write(chunk)
                        except (BrokenPipeError, ConnectionResetError):
                            return
                        remaining -= len(chunk)
                return
            except (ValueError, IndexError):
                pass

        self.send_response(200)
        self.send_header('Content-Type', 'audio/mpeg')
        self.send_header('Content-Length', str(size))
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Cache-Control', 'public, max-age=86400')
        self.end_headers()
        with open(path, 'rb') as f:
            while True:
                chunk = f.read(65536)
                if not chunk:
                    break
                try:
                    self.wfile.write(chunk)
                except (BrokenPipeError, ConnectionResetError):
                    break

    def log_message(self, format, *args):
        if '/api/stream' in str(args):
            print(f'[stream] {args[0]}')
        else:
            super().log_message(format, *args)


def _api_request(url, timeout=10):
    headers = {
        'User-Agent': UA,
        'Referer': REFERER,
        'X-Forwarded-For': '202.106.0.20',
        'X-Real-IP': '202.106.0.20',
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        raw = resp.read()
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            # NetEase sometimes returns non-JSON (e.g. captcha page)
            text = raw.decode('utf-8', errors='replace')
            start = text.find('{')
            if start >= 0:
                end = text.rfind('}')
                if end > start:
                    return json.loads(text[start:end+1])
            return None


def get_url_by_id(song_id):
    data = _api_request(
        f'https://music.163.com/api/song/enhance/player/url?id={song_id}'
        f'&ids=%5B{song_id}%5D&br=128000'
    )
    item = data.get('data', [{}])[0]
    if item.get('code') == 200 and item.get('url'):
        return item['url']
    return None


def search_free_song(title):
    if not title:
        return None, None
    clean = title.split('(')[0].split('（')[0].strip()
    query = urllib.parse.quote(f'{clean} 儿歌')
    try:
        data = _api_request(
            f'https://music.163.com/api/search/get?type=1&limit=8&s={query}'
        )
        songs = data.get('result', {}).get('songs', [])
    except Exception:
        return None, None
    for song in songs:
        sid = str(song['id'])
        url = get_url_by_id(sid)
        if url:
            return url, sid
    return None, None


def get_netease_url(song_key, title=None, ne_id=None):
    now = time.time()

    # 1. Check in-memory cache
    cache_key = song_key or ne_id
    with _cache_lock:
        cached = _url_cache.get(cache_key)
        if cached and cached[1] > now:
            return cached[0]

    # 2. Check pre-generated file cache (from China IP)
    if song_key and song_key in _song_cache:
        cached_url = _song_cache[song_key].get('url')
        if cached_url:
            with _cache_lock:
                _url_cache[cache_key] = (cached_url, now + CACHE_TTL)
            print(f'[stream] file cache hit: {song_key}')
            return cached_url

    # 3. Try the specific NetEase ID
    if ne_id and ne_id.isdigit():
        url = get_url_by_id(ne_id)
        if url:
            with _cache_lock:
                _url_cache[cache_key] = (url, now + CACHE_TTL)
            return url

    # 4. Search by title
    if title:
        url, found_id = search_free_song(title)
        if url:
            with _cache_lock:
                _url_cache[cache_key] = (url, now + CACHE_TTL)
                _url_cache[found_id] = (url, now + CACHE_TTL)
            print(f'[stream] search fallback: "{title}" -> id={found_id}')
            return url

    return None


if __name__ == '__main__':
    os.chdir(BASE_DIR)
    import socket
    http.server.HTTPServer.allow_reuse_address = True
    server = http.server.HTTPServer(('0.0.0.0', PORT), ProxyHandler)
    server.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    print(f'Server running at http://localhost:{PORT}')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()
