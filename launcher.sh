#!/usr/bin/env bash
set -euo pipefail

PID_FILE="$HOME/.local/share/tts-zen/server.pid"
LOG_FILE="$HOME/.local/share/tts-zen/server.log"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT=8765

mkdir -p "$(dirname "$PID_FILE")"

# ── Funciones ──────────────────────────────────────────────

banner() {
    echo ""
    echo "  ╔══════════════════════════════════════════╗"
    echo "  ║           🎙️  TTS-zen                    ║"
    echo "  ║     Text-to-speech para Zen Browser      ║"
    echo "  ╚══════════════════════════════════════════╝"
    echo ""
}

running() {
    local pid
    pid=$(pgrep -f "uvicorn tts_zen.main:app" 2>/dev/null || true)
    if [ -n "$pid" ]; then
        return 0
    fi
    if [ -f "$PID_FILE" ]; then
        pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            return 0
        fi
    fi
    return 1
}

stop_server() {
    local pid
    echo -n "🛑 Deteniendo TTS-zen... "
    if [ -f "$PID_FILE" ]; then
        pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null || true
            sleep 1
            kill -9 "$pid" 2>/dev/null || true
        fi
        rm -f "$PID_FILE"
    fi
    # Limpiar cualquier uvicorn huérfano
    pkill -f "uvicorn tts_zen.main:app" 2>/dev/null || true
    echo "Listo."
}

start_server() {
    echo -n "🚀 Iniciando servidor TTS-zen... "
    cd "$PROJECT_DIR/server"
    nohup uv run uvicorn tts_zen.main:app --port "$PORT" --host 127.0.0.1 \
        > "$LOG_FILE" 2>&1 &
    local pid=$!
    echo "$pid" > "$PID_FILE"

    # Esperar a que esté listo
    for i in $(seq 1 15); do
        if curl -s "http://127.0.0.1:$PORT/health" > /dev/null 2>&1; then
            echo "✅"
            return 0
        fi
        sleep 0.3
    done

    echo "❌ (timeout — revisá $LOG_FILE)"
    return 1
}

# ── Main ───────────────────────────────────────────────────

banner

case "${1:-start}" in
    start)
        if running; then
            echo "✅ TTS-zen ya está corriendo en http://localhost:$PORT"
            echo ""
            echo "   Abrí Zen Browser y asegurate de tener la extensión cargada"
            echo "   desde about:debugging → Cargar complemento temporal."
            if command -v notify-send &>/dev/null; then
                notify-send -i audio-card "TTS-zen" "Ya está corriendo en localhost:$PORT" 2>/dev/null || true
            fi
            exit 0
        fi

        start_server
        echo ""
        echo "   🌐 Servidor:    http://localhost:$PORT"
        echo "   📋 Salud:       http://localhost:$PORT/health"
        echo "   🎤 Voces:       http://localhost:$PORT/voices"
        echo "   📝 Log:         $LOG_FILE"
        echo ""
        echo "   Para detener:   ./launcher.sh stop"
        echo ""

        if command -v notify-send &>/dev/null; then
            notify-send -i audio-card "TTS-zen listo 🎙️" "Servidor corriendo en localhost:$PORT" 2>/dev/null || true
        fi
        ;;

    stop)
        stop_server
        echo "   TTS-zen detenido."
        echo ""
        ;;

    status)
        if running; then
            echo "✅ TTS-zen está CORRIENDO en http://localhost:$PORT"
            if curl -s "http://127.0.0.1:$PORT/health" > /dev/null 2>&1; then
                echo "   Health: OK ($(curl -s "http://127.0.0.1:$PORT/health"))"
            fi
        else
            echo "⚫ TTS-zen está DETENIDO."
            echo "   Ejecutá: ./launcher.sh start"
        fi
        echo ""
        ;;

    *)
        echo "Uso: $0 {start|stop|status}"
        exit 1
        ;;
esac
