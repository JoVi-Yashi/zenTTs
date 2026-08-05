#!/usr/bin/env bash
set -euo pipefail

PID_FILE="$HOME/.local/share/tts-zen/server.pid"
LOG_FILE="$HOME/.local/share/tts-zen/server.log"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT=8765

mkdir -p "$(dirname "$PID_FILE")"

# ── Colores ──────────────────────────────────────────────
C_RESET='\033[0m'
C_BOLD='\033[1m'
C_DIM='\033[2m'
C_PURPLE='\033[38;5;141m'
C_GREEN='\033[38;5;114m'
C_RED='\033[38;5;203m'
C_YELLOW='\033[38;5;221m'
C_GRAY='\033[38;5;243m'
C_WHITE='\033[38;5;255m'
C_BG='\033[48;5;235m'

# ── Iconos Unicode ───────────────────────────────────────
ICON_SPEAKER='🔊'
ICON_CHECK='✓'
ICON_CROSS='✗'
ICON_CLOCK='◷'
ICON_GEAR='⚙'
ICON_ROCKET='🚀'
ICON_STOP='■'
ICON_PLAY='▶'
ICON_LINK='🔗'

# ── Utilidades ───────────────────────────────────────────

divider() {
    printf "${C_DIM}%$(( ${COLUMNS:-80} - 2 ))s${C_RESET}\n" '' | tr ' ' '─'
}

section() {
    echo ""
    printf "  ${C_PURPLE}${C_BOLD}%s${C_RESET}\n" "$1"
    divider
}

dim() { printf "${C_DIM}%s${C_RESET}" "$1"; }
green() { printf "${C_GREEN}%s${C_RESET}" "$1"; }
red() { printf "${C_RED}%s${C_RESET}" "$1"; }
purple() { printf "${C_PURPLE}%s${C_RESET}" "$1"; }
bold() { printf "${C_BOLD}%s${C_RESET}" "$1"; }

# ── Funciones ────────────────────────────────────────────

running() {
    local pid
    pid=$(pgrep -f "uvicorn tts_zen.main:app" 2>/dev/null | head -1)
    if [ -n "$pid" ]; then
        echo "$pid"
        return 0
    fi
    if [ -f "$PID_FILE" ]; then
        pid=$(cat "$PID_FILE" 2>/dev/null || true)
        if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            echo "$pid"
            return 0
        fi
    fi
    return 1
}

stop_server() {
    local pid dead
    printf "  $(dim 'Deteniendo servidor...') "
    pid=$(pgrep -f "uvicorn tts_zen.main:app" 2>/dev/null || true)
    dead=true
    if [ -n "$pid" ]; then
        kill "$pid" 2>/dev/null || true
        sleep 0.5
        kill -9 "$pid" 2>/dev/null || true
        if ! kill -0 "$pid" 2>/dev/null; then dead=true; fi
    fi
    rm -f "$PID_FILE"
    if $dead; then
        printf "$(green '✓') $(dim 'detenido')\n"
    else
        printf "$(red '✗') $(dim 'no se pudo detener')\n"
    fi
}

wait_for_server() {
    local i
    for i in $(seq 1 20); do
        if curl -s "http://127.0.0.1:$PORT/health" > /dev/null 2>&1; then
            return 0
        fi
        printf "\r  $(dim '⏳ esperando') $(dim '%ds...')" "$((i/2))"
        sleep 0.3
    done
    printf "\r  $(red '✗') $(red 'timeout')\n"
    return 1
}

show_header() {
    clear 2>/dev/null || true
    echo ""
    printf "  ${C_PURPLE}${C_BOLD}╭─────────────────────────────────────────╮${C_RESET}\n"
    printf "  ${C_PURPLE}${C_BOLD}│${C_RESET}              ${C_WHITE}${C_BOLD}TTS-zen${C_RESET}                       ${C_PURPLE}${C_BOLD}│${C_RESET}\n"
    printf "  ${C_PURPLE}${C_BOLD}│${C_RESET}     ${C_DIM}Texto a voz · edge-tts · Zen${C_RESET}          ${C_PURPLE}${C_BOLD}│${C_RESET}\n"
    printf "  ${C_PURPLE}${C_BOLD}╰─────────────────────────────────────────╯${C_RESET}\n"
}

show_status_box() {
    local running_pid health status_text color

    if running_pid=$(running 2>/dev/null); then
        color="$C_GREEN"
        if curl -s "http://127.0.0.1:$PORT/health" > /dev/null 2>&1; then
            health="$(green '✓') $(dim 'saludable')"
            status_text="$(bold 'CORRIENDO')"
        else
            health="$(yellow '⚠') $(dim 'sin respuesta')"
            status_text="$(bold 'CORRIENDO') $(dim '(sin respuesta)')"
        fi
    else
        color="$C_RED"
        health="$(red '✗') $(dim 'sin conexión')"
        status_text="$(bold 'DETENIDO')"
    fi

    echo ""
    printf "  ${C_PURPLE}┌─ Estado ─────────────────────────────────┐${C_RESET}\n"
    printf "  ${C_PURPLE}│${C_RESET}                                           ${C_PURPLE}│${C_RESET}\n"
    printf "  ${C_PURPLE}│${C_RESET}   Servidor: ${color}${C_BOLD}%-32s${C_RESET} ${C_PURPLE}│${C_RESET}\n" "$status_text"
    printf "  ${C_PURPLE}│${C_RESET}   Health:   %-40s ${C_PURPLE}│${C_RESET}\n" "$health"
    if [ -n "$running_pid" ]; then
        printf "  ${C_PURPLE}│${C_RESET}   PID:      ${C_DIM}%-36s${C_RESET} ${C_PURPLE}│${C_RESET}\n" "$running_pid"
    fi
    printf "  ${C_PURPLE}│${C_RESET}   Puerto:   ${C_DIM}localhost:%-29s${C_RESET} ${C_PURPLE}│${C_RESET}\n" "$PORT"
    printf "  ${C_PURPLE}│${C_RESET}                                            ${C_PURPLE}│${C_RESET}\n"
    printf "  ${C_PURPLE}└────────────────────────────────────────────┘${C_RESET}\n"
}

show_help() {
    echo ""
    printf "  ${C_PURPLE}${C_BOLD}Comandos:${C_RESET}\n"
    printf "    ${C_BOLD}start${C_RESET}   ${C_DIM}Iniciar servidor en background${C_RESET}\n"
    printf "    ${C_BOLD}stop${C_RESET}    ${C_DIM}Detener servidor${C_RESET}\n"
    printf "    ${C_BOLD}status${C_RESET}  ${C_DIM}Mostrar estado${C_RESET}\n"
    printf "    ${C_BOLD}open${C_RESET}    ${C_DIM}Iniciar + abrir Zen Browser${C_RESET}\n"
    printf "    ${C_BOLD}help${C_RESET}    ${C_DIM}Esta ayuda${C_RESET}\n"
}

# ── Main ────────────────────────────────────────────────

show_header

case "${1:-status}" in
    start)
        if running &>/dev/null; then
            show_status_box
            echo ""
            printf "  $(green '✓') $(dim 'El servidor ya está corriendo.')\n"
            echo ""
            exit 0
        fi

        echo ""
        printf "  $(dim 'Iniciando servidor...') "
        cd "$PROJECT_DIR/server"

        nohup uv run uvicorn tts_zen.main:app --port "$PORT" --host 127.0.0.1 \
            > "$LOG_FILE" 2>&1 &
        pid=$!
        echo "$pid" > "$PID_FILE"

        if ! wait_for_server; then
            echo ""
            printf "  $(red '✗') $(red 'El servidor no respondió a tiempo')\n"
            printf "  $(dim 'Log: %s')\n" "$LOG_FILE"
            exit 1
        fi

        printf "\r  $(green '✓') $(dim 'servidor listo')\n"
        show_status_box
        section "Extensión"
        printf "  $(dim 'Cargala en Zen: %s → Cargar complemento temporal')\n" "about:debugging"
        printf "  $(dim 'Archivo: %s/extension/manifest.json')\n" "$PROJECT_DIR"
        echo ""
        if command -v notify-send &>/dev/null; then
            notify-send -i audio-card "TTS-zen listo" "localhost:$PORT · $(date +%H:%M)" 2>/dev/null || true
        fi
        ;;

    stop)
        stop_server
        show_status_box
        echo ""
        ;;

    status)
        show_status_box
        show_help
        ;;

    open)
        if ! running &>/dev/null; then
            "$0" start || exit 1
        fi
        echo ""
        printf "  $(dim 'Abriendo Zen Browser...') "
        if command -v zen-browser &>/dev/null; then
            zen-browser &>/dev/null &
            printf "$(green '✓')\n"
        elif flatpak list 2>/dev/null | grep -qi zen; then
            flatpak run app.zen_browser.zen &>/dev/null &
            printf "$(green '✓')\n"
        else
            printf "$(yellow '?') $(dim 'no se encontró Zen')\n"
        fi
        echo ""
        ;;

    help|--help|-h)
        show_help
        echo ""
        ;;

    *)
        show_help
        echo ""
        ;;
esac
