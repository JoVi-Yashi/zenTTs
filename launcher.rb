#!/usr/bin/env ruby
# frozen_string_literal: true
# zenTTS Launcher — Ruby TUI with ANSI box drawing and keyboard navigation

require 'io/console'
require 'fileutils'

PORT = 8765
PROJECT_DIR = File.dirname(File.expand_path(__FILE__))
PID_DIR = File.join(Dir.home, '.local', 'share', 'tts-zen')
PID_FILE = File.join(PID_DIR, 'server.pid')
LOG_FILE = File.join(PID_DIR, 'server.log')
W = 46

FileUtils.mkdir_p(PID_DIR)

# ── ANSI ──
P = "\e[38;5;141m"; G = "\e[38;5;114m"; E = "\e[38;5;203m"
K = "\e[38;5;243m"; W = "\e[38;5;255m"; R = "\e[0m"
B = "\e[1m"; BS = "\e[48;5;99m"

def top()  "  #{P}╭#{'─' * (W-2)}╮#{R}" end
def bot()  "  #{P}╰#{'─' * (W-2)}╯#{R}" end
def mid(s) "  #{P}│#{R}#{s.ljust(W-2)}#{P}│#{R}" end

# ── Server helpers ──

def running?
  pid = `pgrep -f "uvicorn tts_zen.main:app" 2>/dev/null`.strip.split("\n").first
  return pid if pid && !pid.empty?
  if File.exist?(PID_FILE)
    pid = File.read(PID_FILE).strip
    return pid if pid && !pid.empty? && Process.kill(0, pid.to_i) rescue nil
  end
  nil
end

def healthy?
  r = `curl -s http://127.0.0.1:#{PORT}/health 2>/dev/null`
  r.include?('"status":"ok"')
end

def action_start
  return if running?
  pid = spawn(
    'ruby', 'server.rb',
    chdir: PROJECT_DIR,
    out: LOG_FILE, err: LOG_FILE,
    pgroup: true
  )
  Process.detach(pid)
  File.write(PID_FILE, pid.to_s)
  20.times do
    sleep 0.3
    break if healthy?
  end
  system('notify-send', '-i', 'audio-card', 'zenTTS', "localhost:#{PORT}", err: File::NULL) rescue nil
end

def action_stop
  system('pkill', '-f', 'uvicorn tts_zen.main:app', err: File::NULL) rescue nil
  sleep 0.5
  FileUtils.rm_f(PID_FILE)
end

def action_open
  action_start
  sleep 0.5
  spawn('flatpak', 'run', 'app.zen_browser.zen', out: File::NULL, err: File::NULL, pgroup: true)
end

# ── Drawing ──

def draw(sel, msg = '')
  pid = running?
  ok = pid ? healthy? : false

  if pid && ok
    status = "  #{G}#{B}CORRIENDO#{R}  #{K}localhost:#{PORT}#{R}  #{G}saludable#{R}  PID #{pid}"
  elsif pid
    status = "  #{G}#{B}CORRIENDO#{R}  #{K}localhost:#{PORT}#{R}  #{G}sin respuesta#{R}  PID #{pid}"
  else
    status = "  #{E}#{B}DETENIDO#{R}  #{K}localhost:#{PORT}#{R}  #{E}sin iniciar#{R}"
  end

  items = ['Iniciar servidor', 'Detener servidor', 'Refrescar estado', 'Abrir Zen Browser']
  lines = [
    '', top,
    mid("               #{W}#{B}zenTTS#{R}"),
    mid("        #{K}edge-tts · Zen Browser#{R}"),
    bot, '',
    top,
    mid("  #{B}Estado#{R}"),
    mid("  #{status}"),
    bot, ''
  ]

  lines << "  #{G}#{msg}#{R}" << '' unless msg.empty?

  lines += [
    top,
    mid("  #{B}Acciones#{R}")
  ]

  items.each_with_index do |item, i|
    if i == sel
      lines << mid("  #{BS}#{B}  #{item}  #{R}")
    else
      lines << mid("    #{K}#{item}#{R}")
    end
  end

  lines += [
    mid(''),
    mid("  #{K}^ v mover   1-4 tecla   Enter elegir   q salir#{R}"),
    bot
  ]

  $stdout.write("\e[2J\e[H" + lines.join("\n"))
  $stdout.flush
end

# ── Key reader ──

def read_key
  c = $stdin.getch
  if c == "\e"
    c2 = $stdin.getch
    if c2 == '['
      c3 = $stdin.getch
      return :up if c3 == 'A'
      return :down if c3 == 'B'
    end
    return ''
  end
  c
end

# ── Main ──

def main
  sel = 0
  msg = ''

  $stdout.write("\e[?25l\e[?1049h")
  $stdout.flush
  at_exit { $stdout.write("\e[?25h\e[?1049l"); $stdout.flush }

  loop do
    draw(sel, msg)
    msg = ''

    k = read_key
    break if ['q', 'Q', "\u0003"].include?(k)

    case k
    when :up   then sel = (sel - 1) % 4
    when :down then sel = (sel + 1) % 4
    when "\r", "\n", ' '
      case sel
      when 0 then msg = 'Iniciando...'; draw(sel, msg); action_start; msg = running? ? 'Servidor listo' : 'Error'
      when 1 then msg = 'Deteniendo...'; draw(sel, msg); action_stop; msg = 'Servidor detenido'
      when 2 then msg = 'Actualizado'
      when 3 then msg = 'Abriendo Zen...'; draw(sel, msg); action_open; msg = 'Zen Browser abierto'
      end
    when '1' then sel = 0
    when '2' then sel = 1
    when '3' then sel = 2
    when '4' then sel = 3
    end
  end
end

main
