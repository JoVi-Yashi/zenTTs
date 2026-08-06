#!/usr/bin/env bash
set -euo pipefail

PID_FILE="$HOME/.local/share/tts-zen/server.pid"
LOG_FILE="$HOME/.local/share/tts-zen/server.log"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT=8765
BOX_W=48

mkdir -p "$(dirname "$PID_FILE")"

# ── Colores ──────────────────────────────────────────────
R='\033[0m'; B='\033[1m'; D='\033[2m'
P='\033[38;5;141m'; G='\033[38;5;114m'; E='\033[38;5;203m'
Y='\033[38;5;221m'; K='\033[38;5;243m'; W='\033[38;5;255m'
BS='\033[48;5;99m'; BR='\033[48;5;237m'

# ── Terminal setup ───────────────────────────────────────
setup_term() { printf '\033[?25l\033[?1049h\033[2J'; stty -echo 2>/dev/null || true; }
reset_term() { printf '\033[?25h\033[?1049l'; stty echo 2>/dev/null || true; }
trap 'reset_term' EXIT

# ── Drawing helpers ──────────────────────────────────────

box_top()    { printf "  ${P}╭%s╮${R}\n" "$(printf '─%.0s' $(seq 1 $((BOX_W-2))))"; }
box_mid()    { printf "  ${P}│${R}${1}${P}│${R}\n"; }
box_bot()    { printf "  ${P}╰%s╯${R}\n" "$(printf '─%.0s' $(seq 1 $((BOX_W-2))))"; }

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
    local selected="$1" extra="$2"
    clear

    # Header
    printf "\n"
    box_top
    box_mid "               ${W}${B}zenTTS${R}               "
    box_mid "        ${K}edge-tts · Zen Browser${R}        "
    box_bot
    printf "\n"

    # Status
    local pid health status status_c health_line
    if pid=$(running 2>/dev/null); then
        if curl -s "http://127.0.0.1:$PORT/health" &>/dev/null; then
            status="${G}${B}●  CORRIENDO${R}"
            health_line="  ${G}✓ saludable${R}    PID ${K}${pid}${R}"
        else
            status="${Y}${B}●  CORRIENDO${R}"
            health_line="  ${Y}⚠ sin respuesta${R}   PID ${K}${pid}${R}"
        fi
    else
        status="${E}${B}●  DETENIDO${R}"
        health_line="  ${E}✗ servidor sin iniciar${R}"
    fi

    box_top
    box_mid "  ${B}Estado${R}"
    box_mid "  ${status}  ${K}localhost:${PORT}${R}"
    box_mid "  ${health_line}"
    box_bot
    printf "\n"

    # Extra message
    [ -n "$extra" ] && printf "  %s\n\n" "$extra"

    # Menu
    local items=("▶  Iniciar servidor" "■  Detener servidor" "↻  Refrescar estado" "🌐  Abrir Zen Browser")
    local labels=("start" "stop" "status" "open")

    box_top
    box_mid "  ${B}Acciones${R}"
    for i in 0 1 2 3; do
        local name="${items[$i]}"
        local line
        if [ "$i" -eq "$selected" ]; then
            line="${BS}  ${name}  ${R}"
        else
            line="  ${name}  "
        fi
        box_mid "  ${line}"
    done
    box_mid ""
    box_mid "  ${K}↑↓ mover   1-4 tecla   Enter elegir   q salir${R}"
    box_bot
}

# ── Actions ──────────────────────────────────────────────

action_start() {
    if running &>/dev/null; then return; fi
    cd "$PROJECT_DIR/server"
    nohup uv run uvicorn tts_zen.main:app --port "$PORT" --host 127.0.0.1 > "$LOG_FILE" 2>&1 &
    echo "$!" > "$PID_FILE"
    for i in $(seq 1 15); do
        curl -s "http://127.0.0.1:$PORT/health" &>/dev/null && break
        sleep 0.3
    done
    command -v notify-send &>/dev/null && notify-send -i audio-card "zenTTS" "Servidor listo" 2>/dev/null || true
}

action_stop() { stop_server; sleep 0.5; }

action_open() { action_start; sleep 0.5; flatpak run app.zen_browser.zen &>/dev/null & }

# ── Main Loop ────────────────────────────────────────────

main() {
    setup_term
    local selected=0 extra=""

    while true; do
        redraw "$selected" "$extra"
        extra=""

        IFS= read -rsn1 key
        case "$key" in
            $'\033')
                read -rsn2 -t 0.001 key2 || true
                case "$key2" in
                    '[A') selected=$(( (selected - 1 + 4) % 4 )) ;;
                    '[B') selected=$(( (selected + 1) % 4 )) ;;
                esac
                ;;
            '')  # Enter
                case $selected in
                    0) extra="  ${G}Iniciando servidor...${R}"; action_start
                       running &>/dev/null && extra="  ${G}✓  Servidor listo en localhost:${PORT}${R}" \
                       || extra="  ${E}✗  Error al iniciar${R}" ;;
                    1) extra="  ${K}Deteniendo...${R}"; action_stop
                       extra="  ${G}✓  Servidor detenido${R}" ;;
                    2) extra="  ${K}Actualizando...${R}" ;;
                    3) extra="  ${G}Abriendo Zen Browser...${R}"; action_open
                       extra="  ${G}✓  Zen Browser abierto${R}" ;;
                esac
                ;;
            q|Q) break ;;
            1) selected=0; extra="  ${K}▶  Iniciando servidor...${R}"; action_start
               running &>/dev/null && extra="  ${G}✓  Servidor listo en localhost:${PORT}${R}" \
               || extra="  ${E}✗  Error al iniciar${R}" ;;
            2) selected=1; extra="  ${K}■  Deteniendo...${R}"; action_stop
               extra="  ${G}✓  Servidor detenido${R}" ;;
            3) selected=2; extra="  ${K}↻  Refrescando...${R}" ;;
            4) selected=3; extra="  ${G}🌐  Abriendo Zen...${R}"; action_open
               extra="  ${G}✓  Zen Browser abierto${R}" ;;
        esac
    done
}

main
