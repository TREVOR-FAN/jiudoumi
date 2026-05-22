#!/usr/bin/env python3
"""Refresh NetEase CDN URL cache. Requires China IP to work."""
import urllib.request
import urllib.parse
import json
import sys
import os
import time

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CACHE_FILE = os.path.join(BASE_DIR, 'netease_cache.json')

UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
      'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
REFERER = 'https://music.163.com/'


def api_request(url, timeout=10):
    headers = {
        'User-Agent': UA,
        'Referer': REFERER,
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        raw = resp.read()
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            text = raw.decode('utf-8', errors='replace')
            start = text.find('{')
            if start >= 0:
                end = text.rfind('}')
                if end > start:
                    return json.loads(text[start:end+1])
            return None


def get_url_by_id(song_id):
    data = api_request(
        f'https://music.163.com/api/song/enhance/player/url?id={song_id}'
        f'&ids=%5B{song_id}%5D&br=128000'
    )
    if not data:
        return None
    item = data.get('data', [{}])[0]
    if item.get('code') == 200 and item.get('url'):
        return item['url']
    return None


def search_song(title):
    clean = title.split('(')[0].split('（')[0].strip()
    query = urllib.parse.quote(f'{clean} 儿歌')
    data = api_request(
        f'https://music.163.com/api/search/get?type=1&limit=5&s={query}'
    )
    if not data:
        return None
    songs = data.get('result', {}).get('songs', [])
    for song in songs:
        sid = str(song['id'])
        url = get_url_by_id(sid)
        if url:
            return url, sid
    return None


def main():
    print('=== 九豆米 NetEase Cache Refresher ===')
    print(f'Loading cache from: {CACHE_FILE}')

    try:
        with open(CACHE_FILE, 'r') as f:
            cache = json.load(f)
    except FileNotFoundError:
        print('ERROR: netease_cache.json not found')
        sys.exit(1)

    songs = cache.get('songs', {})
    total = len(songs)
    print(f'Found {total} songs to refresh\n')

    found = 0
    for i, (key, info) in enumerate(sorted(songs.items()), 1):
        title = info.get('title', key)
        ne_id = info.get('netease_id', '')
        print(f'[{i}/{total}] {key}: {title}', end=' ', flush=True)

        url = None
        # Try by NetEase ID first
        if ne_id and ne_id.isdigit():
            url = get_url_by_id(ne_id)

        # Fallback: search
        if not url:
            result = search_song(title)
            if result:
                url, new_id = result
                info['netease_id'] = new_id

        if url:
            print(f'=> OK ({len(url)} bytes)')
            info['url'] = url
            found += 1
        else:
            print('=> FAILED (geo-blocked or copyright restricted)')

        time.sleep(0.3)  # Rate limit

    cache['generated'] = time.time()
    cache['found'] = found
    cache['total'] = total

    with open(CACHE_FILE, 'w') as f:
        json.dump(cache, f, indent=2, ensure_ascii=False)

    print(f'\nDone: {found}/{total} URLs refreshed')
    if found < total:
        print('Some songs failed — try from a different network or later.')
    print('Now commit and push to deploy:')
    print('  git add netease_cache.json && git commit -m "Refresh CDN cache" && git push')


if __name__ == '__main__':
    main()
