#!/usr/bin/env python3
"""HTTP server with NetEase audio proxy for direct <audio> playback."""
import http.server
import urllib.request
import urllib.parse
import json
import sys
import os
import time
import threading

PORT = int(os.environ.get('PORT', 8767))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Cache: { neteaseId -> (url, expiry_timestamp) }
_url_cache = {}
_cache_lock = threading.Lock()
CACHE_TTL = 3600  # 1 hour

UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
      'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
REFERER = 'https://music.163.com/'

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        if self.path.startswith('/api/stream'):
            self.handle_stream()
        else:
            super().do_GET()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def handle_stream(self):
        qs = urllib.parse.urlparse(self.path).query
        params = urllib.parse.parse_qs(qs)
        ne_id = params.get('id', [None])[0]
        title = params.get('title', [None])[0]

        if not ne_id:
            self.send_error(400, 'Missing id parameter')
            return

        try:
            url = get_netease_url(ne_id, title)
            if url:
                self.send_response(302)
                self.send_header('Location', url)
                self.end_headers()
            else:
                self.send_response(451)
                self.send_header('Content-Type', 'text/plain; charset=utf-8')
                self.end_headers()
                self.wfile.write(b'Copyright restricted - no free stream available')
        except Exception as e:
            self.send_error(500, str(e))

    def log_message(self, format, *args):
        if '/api/stream' in str(args):
            print(f'[stream] {args[0]}')
        else:
            super().log_message(format, *args)


def _api_request(url, timeout=10):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Referer': REFERER})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read())


def get_url_by_id(song_id):
    """Try to get a free MP3 URL for a specific song ID."""
    data = _api_request(
        f'https://music.163.com/api/song/enhance/player/url?id={song_id}'
        f'&ids=%5B{song_id}%5D&br=128000'
    )
    item = data.get('data', [{}])[0]
    if item.get('code') == 200 and item.get('url'):
        return item['url']
    return None


def search_free_song(title):
    """Search NetEase for a free nursery rhyme version of the given title.
    Returns (url, song_id) or (None, None)."""
    if not title:
        return None, None

    # Strip special characters and use first few words as search query
    clean = title.split('(')[0].split('（')[0].strip()
    query = urllib.parse.quote(f'{clean} nursery rhymes')

    try:
        data = _api_request(
            f'https://music.163.com/api/search/get?type=1&limit=8&s={query}'
        )
        songs = data.get('result', {}).get('songs', [])
    except Exception:
        return None, None

    # Try each search result until we find a free one
    for song in songs:
        sid = str(song['id'])
        url = get_url_by_id(sid)
        if url:
            return url, sid
    return None, None


def get_netease_url(song_id, title=None):
    """Get a free streaming MP3 URL from NetEase API.
    First tries the exact song ID, then falls back to search."""
    now = time.time()

    # Check cache
    with _cache_lock:
        cached = _url_cache.get(song_id)
        if cached and cached[1] > now:
            return cached[0]

    # 1. Try the specific ID
    url = get_url_by_id(song_id)
    if url:
        with _cache_lock:
            _url_cache[song_id] = (url, now + CACHE_TTL)
        return url

    # 2. Fallback: search by title
    if title:
        url, found_id = search_free_song(title)
        if url:
            # Cache under BOTH the original ID and the found ID
            with _cache_lock:
                _url_cache[song_id] = (url, now + CACHE_TTL)
                _url_cache[found_id] = (url, now + CACHE_TTL)
            print(f'[stream] fallback search: "{title}" -> id={found_id}')
            return url

    # 3. Try search on just "nursery rhymes" + cleaned title to cast a wider net
    if title:
        clean = title.split('(')[0].split('（')[0].strip()
        url, found_id = search_free_song(clean)
        if url:
            with _cache_lock:
                _url_cache[song_id] = (url, now + CACHE_TTL)
                _url_cache[found_id] = (url, now + CACHE_TTL)
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
