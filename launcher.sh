#!/usr/bin/env bash
set -euo pipefail

PID_FILE="$HOME/.local/share/tts-zen/server.pid"
LOG_FILE="$HOME/.local/share/tts-zen/server.log"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT=8765

mkdir -p "$(dirname "$PID_FILE")"

# ── Colores ──────────────────────────────────────────────
R='\033[0m'; B='\033[1m'; D='\033[2m'
P='\033[38;5;141m'; G='\033[38;5;114m'; E='\033[38;5;203m'
Y='\033[38;5;221m'; K='\033[38;5;243m'; W='\033[38;5;255m'
BS='\033[48;5;99m'

# ── Terminal setup ───────────────────────────────────────
setup_term() { printf '\033[?25l\033[?1049h\033[2J'; stty -echo 2>/dev/null || true; }
reset_term() { printf '\033[?25h\033[?1049l'; stty echo 2>/dev/null || true; }
trap 'reset_term' EXIT

# ── Drawing ──────────────────────────────────────────────

W=48
TOP() { printf "  ${P}╭%s╮${R}\n" "$(printf '─%.0s' $(seq 1 $((W-2))))"; }
MID() { printf "  ${P}│${R}%-$((W-2))s${P}│${R}\n" "$1"; }
BOT() { printf "  ${P}╰%s╯${R}\n" "$(printf '─%.0s' $(seq 1 $((W-2))))"; }

# ── Server helpers ───────────────────────────────────────

running() {
    local pid=$(pgrep -f "uvicorn tts_zen.main:app" 2>/dev/null | head -1)
    [ -n "$pid" ] && echo "$pid" && return 0
    if [ -f "$PID_FILE" ]; then
        pid=$(cat "$PID_FILE" 2>/dev/null || true)
        [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null && echo "$pid" && return 0
    fi
    return 1
}

stop_server() {
    local pid=$(pgrep -f "uvicorn tts_zen.main:app" 2>/dev/null || true)
    [ -n "$pid" ] && { kill "$pid" 2>/dev/null; sleep 0.5; kill -9 "$pid" 2>/dev/null; }
    rm -f "$PID_FILE"
}

# ── Redraw ───────────────────────────────────────────────

redraw() {
    local sel="$1" msg="$2"
    clear

    # Header
    printf "\n"
    TOP
    MID "               ${W}${B}zenTTS${R}"
    MID "        ${K}edge-tts · Zen Browser${R}"
    BOT
    printf "\n"

    # Status
    local pid health
    if pid=$(running 2>/dev/null); then
        if curl -s "http://127.0.0.1:$PORT/health" &>/dev/null; then
            health="${G}${B}CORRIENDO${R} · ${K}localhost:${PORT}${R}   ${G}saludable${R}   PID ${pid}"
        else
            health="${Y}${B}CORRIENDO${R} · ${K}localhost:${PORT}${R}   ${Y}sin respuesta${R}   PID ${pid}"
        fi
    else
        health="${E}${B}DETENIDO${R} · ${K}localhost:${PORT}${R}   ${E}sin iniciar${R}"
    fi

    TOP
    MID "  ${B}Estado${R}"
    MID "  ${health}"
    BOT
    printf "\n"

    # Extra message
    [ -n "$msg" ] && printf "  ${G}%s${R}\n\n" "$msg"

    # Menu
    local items=("▶  Iniciar servidor" "■  Detener servidor" "↻  Refrescar estado" "🌐  Abrir Zen Browser")

    TOP
    MID "  ${B}Acciones${R}"
    for i in 0 1 2 3; do
        if [ "$i" -eq "$sel" ]; then
            MID "  ${BS}${B}  ${items[$i]}  ${R}"
        else
            MID "    ${K}${items[$i]}${R}"
        fi
    done
    MID ""
    MID "  ${K}↑↓ mover   1-4 tecla   Enter elegir   q salir${R}"
    BOT
}

# ── Actions ──────────────────────────────────────────────

action_start() {
    if running &>/dev/null; then return; fi
    cd "$PROJECT_DIR/server"
    nohup uv run uvicorn tts_zen.main:app --port "$PORT" --host 127.0.0.1 > "$LOG_FILE" 2>&1 &
    echo "$!" > "$PID_FILE"
    for i in $(seq 1 15); do curl -s "http://127.0.0.1:$PORT/health" &>/dev/null && break; sleep 0.3; done
    command -v notify-send &>/dev/null && notify-send -i audio-card "zenTTS" "Servidor listo" 2>/dev/null || true
}

action_stop() { stop_server; sleep 0.5; }
action_open() { action_start; sleep 0.5; flatpak run app.zen_browser.zen &>/dev/null & }

# ── Main ─────────────────────────────────────────────────

main() {
    setup_term
    local sel=0 msg=""

    while true; do
        redraw "$sel" "$msg"
        msg=""

        IFS= read -rsn1 key
        case "$key" in
            $'\033')
                read -rsn2 -t 0.001 k2 || true
                case "$k2" in
                    '[A') sel=$(( (sel - 1 + 4) % 4 )) ;;
                    '[B') sel=$(( (sel + 1) % 4 )) ;;
                esac ;;
            '') case $sel in
                    0) action_start; running &>/dev/null && msg="Servidor listo" || msg="Error al iniciar" ;;
                    1) action_stop; msg="Servidor detenido" ;;
                    2) msg="Estado actualizado" ;;
                    3) action_open; msg="Zen Browser abierto" ;;
                esac ;;
            q|Q) break ;;
            1) sel=0; action_start; running &>/dev/null && msg="Servidor listo" || msg="Error al iniciar" ;;
            2) sel=1; action_stop; msg="Servidor detenido" ;;
            3) sel=2; msg="Estado actualizado" ;;
            4) sel=3; action_open; msg="Zen Browser abierto" ;;
        esac
    done
}

main
