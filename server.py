#!/usr/bin/env python3
"""HTTP server with NetEase audio proxy for direct <audio> playback."""
import http.server
import urllib.request
import urllib.parse
import json
import sys
import os

PORT = int(os.environ.get('PORT', 8767))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        if self.path.startswith('/api/stream'):
            self.handle_stream()
        else:
            super().do_GET()

    def end_headers(self):
        # Never cache — recommendations are date-seeded and change daily
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def handle_stream(self):
        qs = urllib.parse.urlparse(self.path).query
        params = urllib.parse.parse_qs(qs)
        ne_id = params.get('id', [None])[0]
        if not ne_id:
            self.send_error(400, 'Missing id parameter')
            return

        try:
            url = get_netease_url(ne_id)
            if url:
                self.send_response(302)
                self.send_header('Location', url)
                self.end_headers()
            else:
                # Song not available for free (copyright restricted)
                self.send_response(451)  # Unavailable For Legal Reasons
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


def get_netease_url(song_id):
    """Get a free streaming MP3 URL from NetEase API."""
    req = urllib.request.Request(
        f'https://music.163.com/api/song/enhance/player/url?id={song_id}'
        f'&ids=%5B{song_id}%5D&br=128000',
        headers={
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
                          'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://music.163.com/',
        }
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read())
    item = data.get('data', [{}])[0]
    if item.get('code') == 200 and item.get('url'):
        return item['url']
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
