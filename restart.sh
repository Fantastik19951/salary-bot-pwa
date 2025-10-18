#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$DIR/logs"
BACKEND_PORT=8001
FRONTEND_PORT=3001
NGROK_REGION="eu"

PYTHON="${PYTHON:-}"
if [[ -z "$PYTHON" ]]; then
  if command -v python3 >/dev/null 2>&1; then
    PYTHON=$(command -v python3)
  elif command -v python >/dev/null 2>&1; then
    PYTHON=$(command -v python)
  else
    echo "❌ Не найден интерпретатор Python. Установи Python 3 и попробуй снова."
    exit 1
  fi
fi

mkdir -p "$LOG_DIR"

log() {
  printf "%s\n" "$1"
}

title() {
  printf "\n=== %s ===\n" "$1"
}

stop_port() {
  local port=$1
  lsof -ti:"$port" -sTCP:LISTEN | xargs kill -9 2>/dev/null || true
}

title "Остановка процессов"
log "⏹ Останавливаю backend ($BACKEND_PORT)"
stop_port "$BACKEND_PORT"

log "⏹ Останавливаю frontend ($FRONTEND_PORT)"
stop_port "$FRONTEND_PORT"

log "⏹ Останавливаю ngrok"
pkill -f "ngrok" 2>/dev/null || true

sleep 1

BACKEND_PID=""
FRONTEND_PID=""
NGROK_PID=""

start_backend() {
  title "Запуск backend"
  log "🚀 Backend → http://localhost:$BACKEND_PORT"
  cd "$DIR/backend"
  nohup "$PYTHON" main.py > "$LOG_DIR/backend.log" 2>&1 &
  BACKEND_PID=$!
}

start_frontend() {
  title "Запуск frontend"
  log "🚀 Frontend preview → http://localhost:$FRONTEND_PORT"
  cd "$DIR/frontend"
  nohup npm run preview -- --host 0.0.0.0 --port "$FRONTEND_PORT" > "$LOG_DIR/frontend.log" 2>&1 &
  FRONTEND_PID=$!
}

start_ngrok() {
  title "Запуск ngrok"
  log "🌍 Туннель ngrok → регион $NGROK_REGION"
  cd "$DIR"
  nohup ngrok http "$FRONTEND_PORT" --region "$NGROK_REGION" --log=stdout > "$LOG_DIR/ngrok.log" 2>&1 &
  NGROK_PID=$!
}

wait_backend() {
  log "⏳ Ожидаю готовность backend"
  for _ in {1..30}; do
    if curl -sf "http://localhost:$BACKEND_PORT/api/health" | grep -q '"status":"healthy"'; then
      log "✅ Backend готов"
      return
    fi
    sleep 1
  done
  log "⚠️ Backend не ответил. Проверь лог: $LOG_DIR/backend.log"
}

wait_frontend() {
  log "⏳ Ожидаю готовность frontend"
  for _ in {1..30}; do
    if lsof -ti:"$FRONTEND_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
      log "✅ Frontend готов"
      return
    fi
    sleep 1
  done
  log "⚠️ Frontend не открыл порт. Проверь лог: $LOG_DIR/frontend.log"
}

wait_ngrok() {
  log "⏳ Ожидаю ссылку ngrok"
  local url=""
  for _ in {1..30}; do
    sleep 1
    local resp
    resp=$(curl -sf http://127.0.0.1:4040/api/tunnels 2>/dev/null || true)
    if [ -n "$resp" ]; then
      url=$(printf '%s' "$resp" | "$PYTHON" - <<'PY'
import json
import sys

try:
    data = json.load(sys.stdin)
except json.JSONDecodeError:
    sys.exit(0)

for tunnel in data.get('tunnels', []):
    public = tunnel.get('public_url', '')
    if public.startswith('https://'):
        print(public)
        break
PY
      )
      if [ -n "$url" ]; then
        printf '%s' "$url"
        return
      fi
    fi
  done
  printf ''
}

start_backend
wait_backend

start_frontend
wait_frontend

start_ngrok
NGROK_URL=$(wait_ngrok)

if [ -z "$NGROK_URL" ]; then
  log "⚠️ Не удалось получить ссылку ngrok. Проверь лог: $LOG_DIR/ngrok.log"
else
  log "
🔗 Ссылка для логина: $NGROK_URL"
fi

title "Процессы"
log "Backend PID:  $BACKEND_PID"
log "Frontend PID: $FRONTEND_PID"
log "ngrok PID:    $NGROK_PID"
log "Логи:         $LOG_DIR"

log "
Готово. Для остановки выполните: pkill -f 'python main.py'; pkill -f 'npm run preview'; pkill -f ngrok"
