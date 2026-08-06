#!/usr/bin/env python3
"""zenTTS Launcher — ANSI TUI, sin dependencias externas."""

import os, sys, subprocess, time, termios, tty
from pathlib import Path

PROJECT_DIR = Path(__file__).resolve().parent
PID_FILE = Path.home() / ".local/share/tts-zen/server.pid"
LOG_FILE = Path.home() / ".local/share/tts-zen/server.log"
PORT = 8765
W = 46
PID_FILE.parent.mkdir(parents=True, exist_ok=True)

# ── ANSI ──
P = '\033[38;5;141m'; G = '\033[38;5;114m'; E = '\033[38;5;203m'
K = '\033[38;5;243m'; W = '\033[38;5;255m'; R = '\033[0m'
B = '\033[1m'; BS = '\033[48;5;99m'

def top(): return f"  {P}╭{'─'*(W-2)}╮{R}"
def bot(): return f"  {P}╰{'─'*(W-2)}╯{R}"
def mid(s): return f"  {P}│{R}{s}{P}│{R}"

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

def draw(sel, msg=""):
    lines = []
    lines.append("")
    lines.append(top())
    lines.append(mid(f"               {W}{B}zenTTS{R}"))
    lines.append(mid(f"        {K}edge-tts · Zen Browser{R}"))
    lines.append(bot())
    lines.append("")

    pid = running()
    ok = healthy() if pid else False
    if pid and ok:
        status = f"  {G}{B}CORRIENDO{R}  {K}localhost:{PORT}{R}  {G}saludable{R}  PID {pid}"
    elif pid:
        status = f"  {G}{B}CORRIENDO{R}  {K}localhost:{PORT}{R}  {G}sin respuesta{R}  PID {pid}"
    else:
        status = f"  {E}{B}DETENIDO{R}  {K}localhost:{PORT}{R}  {E}sin iniciar{R}"

    lines.append(top())
    lines.append(mid(f"  {B}Estado{R}"))
    lines.append(mid(f"  {status}"))
    lines.append(bot())
    lines.append("")

    if msg:
        lines.append(f"  {G}{msg}{R}")
        lines.append("")

    items = ["Iniciar servidor","Detener servidor","Refrescar estado","Abrir Zen Browser"]
    lines.append(top())
    lines.append(mid(f"  {B}Acciones{R}"))
    for i, item in enumerate(items):
        if i == sel:
            lines.append(mid(f"  {BS}{B}  {item}  {R}"))
        else:
            lines.append(mid(f"    {K}{item}{R}"))
    lines.append(mid(""))
    lines.append(mid(f"  {K}^ v mover   1-4 tecla   Enter elegir   q salir{R}"))
    lines.append(bot())

    sys.stdout.write('\033[2J\033[H' + '\n'.join(lines))
    sys.stdout.flush()

def main():
    sel = 0; msg = ""
    fd = sys.stdin.fileno()
    old = termios.tcgetattr(fd)
    try:
        tty.setraw(fd)
        sys.stdout.write('\033[?25l\033[?1049h')
        sys.stdout.flush()
        while True:
            draw(sel, msg); msg = ""
            k = sys.stdin.read(1)
            if k == '\x1b':
                k2 = sys.stdin.read(1)
                if k2 == '[':
                    k3 = sys.stdin.read(1)
                    if k3 == 'A': sel = (sel - 1) % 4
                    elif k3 == 'B': sel = (sel + 1) % 4
                continue
            if k in ('q','Q','\x03'): break
            if k in ('\r','\n',' '):
                if sel == 0: msg = "Iniciando..."; draw(sel,msg); action_start(); msg = "Servidor listo" if running() else "Error"
                elif sel == 1: msg = "Deteniendo..."; draw(sel,msg); action_stop(); msg = "Servidor detenido"
                elif sel == 2: msg = "Actualizado"
                elif sel == 3: msg = "Abriendo Zen..."; draw(sel,msg); action_open(); msg = "Zen Browser abierto"
            if k == '1': sel = 0
            if k == '2': sel = 1
            if k == '3': sel = 2
            if k == '4': sel = 3
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, old)
        sys.stdout.write('\033[?25h\033[?1049l')
        sys.stdout.flush()

if __name__ == "__main__":
    main()
