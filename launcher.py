#!/usr/bin/env python3
"""zenTTS Launcher — Rich TUI with proper box drawing and keyboard navigation."""

import os
import sys
import signal
import subprocess
import time
import termios
import tty
from pathlib import Path

try:
    from rich.console import Console
    from rich.panel import Panel
    from rich.table import Table
    from rich.text import Text
    from rich.align import Align
    from rich.layout import Layout
    from rich.live import Live
    from rich.style import Style
    from rich import box
except ImportError:
    print("Instalá rich: pip install rich")
    sys.exit(1)

PROJECT_DIR = Path(__file__).resolve().parent
PID_FILE = Path.home() / ".local/share/tts-zen/server.pid"
LOG_FILE = Path.home() / ".local/share/tts-zen/server.log"
PORT = 8765

PID_FILE.parent.mkdir(parents=True, exist_ok=True)

console = Console()
STYLE = {
    "purple": Style(color="#a78bfa"),
    "green": Style(color="#84cc76"),
    "red": Style(color="#f87171"),
    "yellow": Style(color="#fbbf24"),
    "gray": Style(color="#6b7280"),
    "white": Style(color="#f3f4f6", bold=True),
    "dim": Style(color="#6b7280", dim=True),
    "border": Style(color="#a78bfa"),
    "selected": Style(bgcolor="#7c3aed", color="#ffffff"),
    "key": Style(color="#a78bfa"),
}


def running() -> str | None:
    """Return PID if server is running."""
    try:
        result = subprocess.run(
            ["pgrep", "-f", "uvicorn tts_zen.main:app"],
            capture_output=True, text=True, timeout=2
        )
        if result.stdout.strip():
            return result.stdout.strip().split("\n")[0]
    except Exception:
        pass
    if PID_FILE.exists():
        try:
            pid = PID_FILE.read_text().strip()
            os.kill(int(pid), 0)
            return pid
        except Exception:
            pass
    return None


def server_healthy() -> bool:
    """Check if the server responds to health check."""
    try:
        result = subprocess.run(
            ["curl", "-s", f"http://127.0.0.1:{PORT}/health"],
            capture_output=True, text=True, timeout=3
        )
        return '"status":"ok"' in result.stdout
    except Exception:
        return False


def action_start():
    """Start the server in background."""
    if running():
        return
    env = os.environ.copy()
    server_dir = PROJECT_DIR / "server"
    subprocess.Popen(
        ["uv", "run", "uvicorn", "tts_zen.main:app", "--port", str(PORT), "--host", "127.0.0.1"],
        cwd=str(server_dir),
        stdout=open(LOG_FILE, "w"),
        stderr=subprocess.STDOUT,
        env=env,
        start_new_session=True,
    )
    # Wait for server to start
    for _ in range(20):
        time.sleep(0.3)
        if server_healthy():
            break
    # Send notification
    subprocess.run(
        ["notify-send", "-i", "audio-card", "zenTTS", f"Servidor listo en localhost:{PORT}"],
        capture_output=True, timeout=2
    )


def action_stop():
    """Stop the server."""
    try:
        subprocess.run(["pkill", "-f", "uvicorn tts_zen.main:app"], timeout=3)
    except Exception:
        pass
    time.sleep(0.5)
    PID_FILE.unlink(missing_ok=True)


def action_open():
    """Start server and open Zen Browser."""
    action_start()
    time.sleep(0.5)
    subprocess.Popen(
        ["flatpak", "run", "app.zen_browser.zen"],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        start_new_session=True,
    )


def build_ui(selected: int, extra: str = "") -> Layout:
    """Build the Rich layout."""
    layout = Layout()
    layout.split(
        Layout(name="header", size=5),
        Layout(name="status", size=7),
        Layout(name="menu", size=11),
    )

    # Header
    header_text = Text()
    header_text.append("\n zenTTS\n", STYLE["white"])
    header_text.append(" edge-tts · Zen Browser", STYLE["dim"])
    header_panel = Panel(
        Align.center(header_text),
        border_style=STYLE["border"],
        box=box.ROUNDED,
    )
    layout["header"].update(header_panel)

    # Status
    pid = running()
    healthy = server_healthy() if pid else False

    status_text = Text()
    if pid and healthy:
        status_text.append("  [●]  CORRIENDO  ", STYLE["green"])
        status_text.append(f"localhost:{PORT}\n", STYLE["dim"])
        status_text.append(f"  +  saludable    PID {pid}", STYLE["dim"])
    elif pid:
        status_text.append("  [●]  CORRIENDO  ", STYLE["yellow"])
        status_text.append(f"localhost:{PORT}\n", STYLE["dim"])
        status_text.append(f"  ~  sin respuesta    PID {pid}", STYLE["dim"])
    else:
        status_text.append("  [●]  DETENIDO  ", STYLE["red"])
        status_text.append("localhost:8765\n", STYLE["dim"])
        status_text.append("  -  servidor sin iniciar", STYLE["dim"])

    status_panel = Panel(
        status_text,
        title="Estado",
        border_style=STYLE["border"],
        box=box.ROUNDED,
        title_align="left",
    )
    layout["status"].update(status_panel)

    # Menu
    items = [
        "Iniciar servidor",
        "Detener servidor",
        "Refrescar estado",
        "Abrir Zen Browser",
    ]

    menu_text = Text()
    for i, item in enumerate(items):
        if i == selected:
            menu_text.append(f"    {item}", STYLE["selected"])
        else:
            menu_text.append(f"    {item}", STYLE["dim"])
        menu_text.append("\n")
    menu_text.append("\n")
    menu_text.append("  ^  v  mover    1-4 tecla    Enter elegir    q salir", STYLE["dim"])

    menu_panel = Panel(
        menu_text,
        title="Acciones",
        border_style=STYLE["border"],
        box=box.ROUNDED,
        title_align="left",
    )

    if extra:
        layout["menu"].update(Text(f"\n {extra}\n", style=STYLE["green"]))
        layout["menu"].update(menu_panel)
    else:
        layout["menu"].update(menu_panel)

    return layout


def get_key():
    """Read a single keypress including arrow keys."""
    fd = sys.stdin.fileno()
    old = termios.tcgetattr(fd)
    try:
        tty.setraw(fd)
        ch = sys.stdin.read(1)
        if ch == '\x1b':
            # Escape sequence
            ch2 = sys.stdin.read(1)
            if ch2 == '[':
                ch3 = sys.stdin.read(1)
                if ch3 == 'A': return 'up'
                if ch3 == 'B': return 'down'
                return ''
        return ch
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, old)


def main():
    selected = 0
    extra = ""

    with Live(build_ui(selected), console=console, screen=True, refresh_per_second=10) as live:
        while True:
            live.update(build_ui(selected, extra))
            extra = ""

            key = get_key()
            if key in ('q', 'Q', '\x03'):  # \x03 = Ctrl+C
                break
            elif key == 'up':
                selected = (selected - 1) % 4
            elif key == 'down':
                selected = (selected + 1) % 4
            elif key in ('\r', '\n', ' '):  # Enter or Space
                if selected == 0:
                    extra = "  +  Iniciando servidor..."
                    live.update(build_ui(selected, extra))
                    action_start()
                    extra = "  +  Servidor listo" if running() else "  -  Error al iniciar"
                elif selected == 1:
                    extra = "  ~  Deteniendo..."
                    live.update(build_ui(selected, extra))
                    action_stop()
                    extra = "  +  Servidor detenido"
                elif selected == 2:
                    extra = "  ~  Refrescando..."
                elif selected == 3:
                    extra = "  ~  Abriendo Zen Browser..."
                    live.update(build_ui(selected, extra))
                    action_open()
                    extra = "  +  Zen Browser abierto"
            elif key == '1':
                selected = 0
            elif key == '2':
                selected = 1
            elif key == '3':
                selected = 2
            elif key == '4':
                selected = 3


if __name__ == "__main__":
    main()
