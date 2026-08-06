#!/usr/bin/env python3
"""zenTTS Launcher — Rich TUI with box drawing and keyboard navigation."""

import os, sys, subprocess, time, termios, tty
from pathlib import Path

from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.align import Align
from rich.layout import Layout
from rich.live import Live
from rich.style import Style
from rich import box

PROJECT_DIR = Path(__file__).resolve().parent
PID_FILE = Path.home() / ".local/share/tts-zen/server.pid"
LOG_FILE = Path.home() / ".local/share/tts-zen/server.log"
PORT = 8765
PID_FILE.parent.mkdir(parents=True, exist_ok=True)

console = Console()
PURPLE = Style(color="#a78bfa")
GREEN  = Style(color="#84cc76")
RED    = Style(color="#f87171")
YELLOW = Style(color="#fbbf24")
GRAY   = Style(color="#6b7280", dim=True)
WHITE  = Style(color="#f3f4f6", bold=True)
SEL    = Style(bgcolor="#7c3aed", color="#ffffff")
KEY    = Style(color="#a78bfa")

def running():
    try:
        r = subprocess.run(["pgrep","-f","uvicorn tts_zen.main:app"],capture_output=True,text=True,timeout=2)
        if r.stdout.strip(): return r.stdout.strip().split("\n")[0]
    except: pass
    if PID_FILE.exists():
        try:
            pid = PID_FILE.read_text().strip()
            os.kill(int(pid), 0); return pid
        except: pass
    return None

def healthy():
    try:
        r = subprocess.run(["curl","-s",f"http://127.0.0.1:{PORT}/health"],capture_output=True,text=True,timeout=3)
        return '"status":"ok"' in r.stdout
    except: return False

def action_start():
    if running(): return
    subprocess.Popen(["uv","run","uvicorn","tts_zen.main:app","--port",str(PORT),"--host","127.0.0.1"],
        cwd=str(PROJECT_DIR/"server"),stdout=open(LOG_FILE,"w"),stderr=subprocess.STDOUT,
        env=os.environ,start_new_session=True)
    for _ in range(20):
        time.sleep(0.3)
        if healthy(): break
    subprocess.run(["notify-send","-i","audio-card","zenTTS",f"localhost:{PORT}"],timeout=2)

def action_stop():
    try: subprocess.run(["pkill","-f","uvicorn tts_zen.main:app"],timeout=3)
    except: pass
    time.sleep(0.5); PID_FILE.unlink(missing_ok=True)

def action_open():
    action_start(); time.sleep(0.5)
    subprocess.Popen(["flatpak","run","app.zen_browser.zen"],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,start_new_session=True)

def get_key():
    fd = sys.stdin.fileno()
    old = termios.tcgetattr(fd)
    try:
        tty.setraw(fd)
        c = sys.stdin.read(1)
        if c == '\x1b':
            c2 = sys.stdin.read(1)
            if c2 == '[':
                c3 = sys.stdin.read(1)
                if c3 == 'A': return 'up'
                if c3 == 'B': return 'down'
            return ''
        return c
    finally: termios.tcsetattr(fd, termios.TCSADRAIN, old)

def build_ui(selected, msg=""):
    layout = Layout()
    layout.split(Layout(name="header",size=5),Layout(name="status",size=6),Layout(name="menu",size=12))

    # Header
    h = Text("\n  zenTTS\n",style=WHITE)
    h.append("  edge-tts · Zen Browser",style=GRAY)
    layout["header"].update(Panel(Align.center(h),border_style=PURPLE,box=box.ROUNDED))

    # Status
    pid = running()
    ok = healthy() if pid else False
    s = Text()
    if pid and ok:
        s.append("  CORRIENDO",style=GREEN); s.append(f"  localhost:{PORT}",style=GRAY)
        s.append(f"\n  saludable    PID {pid}",style=GRAY)
    elif pid:
        s.append("  CORRIENDO",style=YELLOW); s.append(f"  localhost:{PORT}",style=GRAY)
        s.append(f"\n  sin respuesta    PID {pid}",style=GRAY)
    else:
        s.append("  DETENIDO",style=RED); s.append(f"  localhost:{PORT}",style=GRAY)
        s.append("\n  servidor sin iniciar",style=GRAY)
    layout["status"].update(Panel(s,title="Estado",border_style=PURPLE,box=box.ROUNDED,title_align="left"))

    # Menu
    items = ["Iniciar servidor","Detener servidor","Refrescar estado","Abrir Zen Browser"]
    m = Text()
    for i,item in enumerate(items):
        if i == selected: m.append(f"    {item}\n",SEL)
        else: m.append(f"    {item}\n",GRAY)
    m.append("\n")
    m.append("  ^ v mover    1-4 tecla    Enter elegir    q salir",GRAY)
    menu_panel = Panel(m,title="Acciones",border_style=PURPLE,box=box.ROUNDED,title_align="left")

    if msg:
        layout["menu"].update(Text(f"\n  {msg}\n",style=GREEN))
        layout["menu"].update(menu_panel)
    else:
        layout["menu"].update(menu_panel)

    return layout

def main():
    sel = 0; msg = ""
    with Live(build_ui(sel), console=console, refresh_per_second=10, transient=True) as live:
        while True:
            live.update(build_ui(sel, msg))
            msg = ""
            k = get_key()
            if k in ('q','Q','\x03'): break
            elif k == 'up':   sel = (sel - 1) % 4
            elif k == 'down': sel = (sel + 1) % 4
            elif k in ('\r','\n',' '):
                if sel == 0: msg = "Iniciando servidor..."; live.update(build_ui(sel,msg)); action_start(); msg = "Servidor listo" if running() else "Error al iniciar"
                elif sel == 1: msg = "Deteniendo..."; live.update(build_ui(sel,msg)); action_stop(); msg = "Servidor detenido"
                elif sel == 2: msg = "Estado actualizado"
                elif sel == 3: msg = "Abriendo Zen..."; live.update(build_ui(sel,msg)); action_open(); msg = "Zen Browser abierto"
            elif k == '1': sel = 0
            elif k == '2': sel = 1
            elif k == '3': sel = 2
            elif k == '4': sel = 3

if __name__ == "__main__":
    main()
