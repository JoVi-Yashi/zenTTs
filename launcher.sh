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
BG='\033[48;5;237m'; BS='\033[48;5;99m'; BW='\033[48;5;240m'; BR='\033[48;5;95m'

# ── Terminal setup ───────────────────────────────────────
setup_term() { printf '\033[?25l\033[?1049h'; stty -echo 2>/dev/null || true; }
reset_term() { printf '\033[?25h\033[?1049l'; stty echo 2>/dev/null || true; }
trap 'reset_term' EXIT

# ── Utilidades ───────────────────────────────────────────

center() {
    local text="$1" color="${2:-}" width=40
    local pad=$(( (width - ${#text}) / 2 ))
    printf "  ${P}│${R}%*s${color}%s${R}%*s${P}│${R}\n" "$pad" "" "$text" "$(( width - pad - ${#text} ))" ""
}

running() {
    local pid=$(pgrep -f "uvicorn tts_zen.main:app" 2>/dev/null | head -1)
    if [ -n "$pid" ]; then echo "$pid"; return 0; fi
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

# ── UI Components ────────────────────────────────────────

# Arrow key sequences
UP=$'\033[A'; DOWN=$'\033[B'; ENTER=$'\n'; ESC=$'\033'
TAB=$'\t'; SPACE=' '

menu_item() {
    local label="$1" desc="$2" selected="$3"
    if $selected; then
        printf "  ${P}│${R}  ${BS}${B}  %-18s${R} ${D}%-20s${R}${P}│${R}\n" "$label" "$desc"
    else
        printf "  ${P}│${R}  ${K}  %-18s${R} ${D}%-20s${R}${P}│${R}\n" "  $label" "$desc"
    fi
}

redraw() {
    local selected_idx="$1" status_text="$2" status_color="$3" extra="$4"

    clear

    # Header
    echo ""
    printf "  ${P}${B}╭────────────────── TTS-zen ──────────────────╮${R}\n"
    printf "  ${P}${B}│${R}             ${W}${B}Texto a voz${R}                      ${P}${B}│${R}\n"
    printf "  ${P}${B}│${R}        ${K}edge-tts · Zen Browser${R}               ${P}${B}│${R}\n"
    printf "  ${P}${B}╰────────────────────────────────────────────╯${R}\n"
    echo ""

    # Status
    local pid health
    if pid=$(running 2>/dev/null); then
        if curl -s "http://127.0.0.1:$PORT/health" &>/dev/null; then
            status_text="● CORRIENDO en localhost:$PORT"
            status_color="$G"
            health="  ${G}✓${R} ${K}saludable  ${R}  PID ${K}${pid}${R}"
        else
            status_text="● CORRIENDO (sin respuesta)"
            status_color="$Y"
            health="  ${Y}⚠${R} ${K}pid ${pid}, sin respuesta${R}"
        fi
    else
        status_text="● DETENIDO"
        status_color="$E"
        health="  ${E}✗${R} ${K}servidor sin iniciar${R}"
    fi

    printf "  ${P}┌─ Estado ─────────────────────────────────────┐${R}\n"
    printf "  ${P}│${R}  ${status_color}${B}%-44s${R} ${P}│${R}\n" "$status_text"
    printf "  ${P}│${R}  ${health}%$((40 - ${#health} + 15))s${P}│${R}\n" ""
    printf "  ${P}└──────────────────────────────────────────────┘${R}\n"
    echo ""

    # Extra message
    [ -n "$extra" ] && printf "  %s\n" "$extra" && echo ""

    # Menu
    local items=("▶ Iniciar servidor"     "Arranca en background" \
                 "■ Detener servidor"     "Frena el server" \
                 "↻ Refrescar estado"     "Actualizar estado" \
                 "🌐 Abrir Zen Browser"    "Inicia server + Zen")
    local labels=("start" "stop" "status" "open")

    printf "  ${P}┌─ Acciones ───────────────────────────────────┐${R}\n"
    for i in "${!labels[@]}"; do
        local name="${items[$((i*2))]}"
        local desc="${items[$((i*2+1))]}"
        local sel=false
        [ "$i" -eq "$selected_idx" ] && sel=true
        menu_item "$name" "$desc" "$sel"
    done
    printf "  ${P}│${R}                                                ${P}│${R}\n"
    printf "  ${P}│${R}  ${K}↑↓ mover  ${R} ${K}1-4 tecla  ${R} ${K}Enter elegir  ${R} ${K}q salir${R}          ${P}│${R}\n"
    printf "  ${P}└──────────────────────────────────────────────┘${R}\n"
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
    command -v notify-send &>/dev/null && notify-send -i audio-card "TTS-zen" "Servidor listo en localhost:$PORT" 2>/dev/null || true
}

action_stop() { stop_server; sleep 0.5; }

action_open() {
    action_start
    sleep 0.5
    flatpak run app.zen_browser.zen &>/dev/null &
}

# ── Main Loop ────────────────────────────────────────────

main() {
    setup_term
    local selected=0 extra=""

    while true; do
        redraw "$selected" "" "" "$extra"
        extra=""

        IFS= read -rsn1 key
        case "$key" in
            $'\033')
                read -rsn2 -t 0.001 key2 || true
                case "$key2" in
                    '[A') selected=$(( (selected - 1 + 4) % 4 )) ;;  # Up
                    '[B') selected=$(( (selected + 1) % 4 )) ;;      # Down
                esac
                ;;
            '')  # Enter
                case $selected in
                    0) extra="  ${G}Iniciando servidor...${R}"; action_start
                       if running &>/dev/null; then extra="  ${G}✓ Servidor listo en localhost:$PORT${R}"
                       else extra="  ${E}✗ Error al iniciar${R}"; fi ;;
                    1) extra="  ${K}Deteniendo...${R}"; action_stop
                       extra="  ${G}✓ Servidor detenido${R}" ;;
                    2) extra="  ${K}Actualizando...${R}" ;;
                    3) extra="  ${G}Abriendo Zen Browser...${R}"; action_open
                       extra="  ${G}✓ Zen Browser abierto${R}" ;;
                esac
                ;;
            q|Q) break ;;
            1) selected=0; extra="  ${K}▶ Iniciar servidor...${R}"; action_start
                if running &>/dev/null; then extra="  ${G}✓ Servidor listo en localhost:$PORT${R}"
                else extra="  ${E}✗ Error al iniciar${R}"; fi ;;
            2) selected=1; extra="  ${K}■ Deteniendo...${R}"; action_stop
                extra="  ${G}✓ Servidor detenido${R}" ;;
            3) selected=2; extra="  ${K}↻ Refrescando...${R}" ;;
            4) selected=3; extra="  ${G}🌐 Abriendo Zen...${R}"; action_open
                extra="  ${G}✓ Zen Browser abierto${R}" ;;
        esac
    done
}

main
