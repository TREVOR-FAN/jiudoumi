#!/bin/bash
# 九豆米 — 一键启动脚本（本地服务器 + 公网隧道）
cd "$(dirname "$0")"

# Kill any previous instances
pkill -f "ssh.*serveo" 2>/dev/null
pkill -f "python3 server.py" 2>/dev/null
sleep 1

echo "🚀 启动九豆米服务器..."
python3 server.py &
SERVER_PID=$!
sleep 1

echo ""
echo "📡 创建公网隧道..."

# Auto-reconnect loop
while true; do
  echo "   连接中..."

  ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 \
      -o ExitOnForwardFailure=yes \
      -i ~/.ssh/id_ed25519 \
      -R jiudoumi:80:localhost:8767 serveo.net \
      2>&1 | while read line; do
    echo "   $line"
    if echo "$line" | grep -q "Forwarding HTTP traffic"; then
      URL=$(echo "$line" | grep -o 'https://[^ ]*')
      if [ -n "$URL" ]; then
        echo ""
        echo "============================================"
        echo "  📱 iPhone 打开 Safari 访问："
        echo "  $URL/preview.html"
        echo ""
        echo "  然后点「分享」→「添加到主屏幕」"
        echo "============================================"
        echo ""
      fi
    fi
  done

  echo ""
  echo "⚠️  隧道断开，3 秒后自动重连..."
  sleep 3
done &

TUNNEL_PID=$!

trap "kill $SERVER_PID $TUNNEL_PID 2>/dev/null; exit" INT TERM

echo "按 Ctrl+C 停止"
wait
