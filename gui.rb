#!/usr/bin/env ruby
# frozen_string_literal: true
# TTS-zen — Cross-platform server manager (Linux / Windows)

require 'gtk3'
require 'fileutils'
require 'net/http'

# Identify as TTS-zen in taskbars, docks, and alt-tab
GLib.set_prgname('tts-zen')

PORT = 8765
PROJECT_DIR = File.dirname(File.expand_path(__FILE__))

# Default icon for all windows
default_icon = File.join(PROJECT_DIR, 'tts.png')
default_icon = '/app/share/icons/hicolor/scalable/apps/io.github.jovi-yashi.zentts.png' unless File.exist?(default_icon)
Gtk::Window.set_default_icon_from_file(default_icon) if File.exist?(default_icon)

# ── Platform paths ──

if Gem.win_platform?
  APPDATA = ENV['APPDATA'] || File.join(Dir.home, 'AppData', 'Roaming')
  DATA_DIR = File.join(APPDATA, 'tts-zen')
else
  DATA_DIR = File.join(Dir.home, '.local', 'share', 'tts-zen')
end

PID_FILE = File.join(DATA_DIR, 'server.pid')
LOG_FILE = File.join(DATA_DIR, 'server.log')
FileUtils.mkdir_p(DATA_DIR)

WINDOWS = Gem.win_platform?

# ══════════════════════════════════════════════
#  Platform-specific helpers
# ══════════════════════════════════════════════

def port_pid
  if WINDOWS
    out = `netstat -ano 2>NUL`.lines
      .grep(/:#{PORT}\s/)
      .grep(/LISTENING/)
      .first
    return nil unless out
    out.strip.split(/\s+/).last
  else
    pid = `fuser #{PORT}/tcp 2>/dev/null`.strip
    pid.empty? ? nil : pid
  end
rescue
  nil
end

def server_running?
  pid = port_pid
  return pid if pid
  if File.exist?(PID_FILE)
    pid = File.read(PID_FILE).strip
    return pid if !pid.empty? && Process.kill(0, pid.to_i) rescue nil
  end
  nil
end

def server_healthy?
  uri = URI("http://127.0.0.1:#{PORT}/health")
  http = Net::HTTP.new(uri.host, uri.port)
  http.open_timeout = 2
  http.read_timeout = 2
  res = http.get(uri.path)
  res.body.include?('"status":"ok"')
rescue
  false
end

def start_server!
  return if server_running?
  pid = if WINDOWS
          spawn('ruby', File.join(PROJECT_DIR, 'server.rb'),
                chdir: PROJECT_DIR, out: LOG_FILE, err: LOG_FILE)
        else
          spawn('ruby', File.join(PROJECT_DIR, 'server.rb'),
                chdir: PROJECT_DIR, out: LOG_FILE, err: LOG_FILE, pgroup: true)
        end
  Process.detach(pid)
  File.write(PID_FILE, pid.to_s)
  20.times do
    sleep 0.3
    break if server_healthy?
  end
end

def stop_server!
  if WINDOWS
    pid = port_pid
    system("taskkill /PID #{pid} /F 2>NUL") if pid
  else
    system('fuser', '-k', "#{PORT}/tcp", err: File::NULL) rescue nil
  end
  sleep 0.5
  FileUtils.rm_f(PID_FILE)
end

def open_browser
  start_server! unless server_running?
  sleep 0.5
  if WINDOWS
    system('start', '', 'app.zen_browser.zen') rescue nil
  else
    spawn('flatpak', 'run', 'app.zen_browser.zen', out: File::NULL, err: File::NULL)
  end
end

# ══════════════════════════════════════════════
#  CSS
# ══════════════════════════════════════════════

CSS = <<~CSS
  * { border-color: transparent; }

  window {
    background: #0a0a1c;
    border: none;
  }
  decoration {
    border: none;
    box-shadow: none;
    border-color: transparent;
  }

  headerbar {
    background: #0d0d1f;
    border: none;
    border-bottom: 1px solid rgba(167,139,250,0.1);
    min-height: 38px;
    box-shadow: none;
  }
  headerbar decoration,
  headerbar * {
    border-color: transparent;
  }
  headerbar .title {
    font-size: 13px; font-weight: 600; color: #c4b5fd;
  }

  .body { padding: 24px; }

  .status-card {
    background: #111128;
    border: 1px solid rgba(167,139,250,0.08);
    border-radius: 14px; padding: 20px 22px; margin-bottom: 20px;
  }
  .status-header {
    font-size: 10px; font-weight: 600; color: #5b6370;
    letter-spacing: 0.6px; margin-bottom: 12px;
  }
  .status-row { margin: 6px 0; }
  .indicator {
    min-width: 10px; min-height: 10px; border-radius: 50%; margin-right: 10px;
    border: none;
  }
  .dot-on  { background: #34d399; }
  .dot-off { background: #f87171; }
  .dot-warn { background: #fbbf24; }

  .status-text { font-size: 14px; font-weight: 600; }
  .text-on   { color: #34d399; }
  .text-off  { color: #f87171; }
  .text-warn { color: #fbbf24; }
  .detail {
    font-size: 10px; color: #4b5563; margin-top: 6px; font-family: monospace;
  }

  .section-label {
    font-size: 10px; font-weight: 600; color: #5b6370;
    letter-spacing: 0.6px; margin-top: 4px; margin-bottom: 10px;
  }

  button {
    font-size: 12px; font-weight: 600; padding: 10px 18px;
    border-radius: 10px;
    border: 1px solid transparent;
    outline: none;
    background: rgba(255,255,255,0.05);
    color: #9ca3af;
    box-shadow: none;
  }
  button:disabled { opacity: 0.3; }
  button:hover {
    background: rgba(167,139,250,0.1);
    border-color: rgba(167,139,250,0.2);
    color: #c4b5fd;
  }

  .btn-primary {
    background: #7c3aed; color: #fff;
    border: none;
  }
  .btn-primary:hover {
    background: #8b5cf6;
  }

  .btn-danger {
    background: rgba(248,113,113,0.1); color: #f87171;
    border: 1px solid rgba(248,113,113,0.15);
  }
  .btn-danger:hover {
    background: rgba(248,113,113,0.18);
  }

  .btn-zen {
    background: transparent; color: #7e8aa0;
    border: 1px solid rgba(255,255,255,0.06);
  }
  .btn-zen:hover {
    background: rgba(167,139,250,0.08);
    border-color: rgba(167,139,250,0.18); color: #a78bfa;
  }

  .footer {
    font-size: 10px; color: #3a3f50;
    padding-top: 16px; margin-top: 8px;
    border-top: 1px solid rgba(255,255,255,0.03);
  }
CSS

# ══════════════════════════════════════════════
#  App
# ══════════════════════════════════════════════

class TTSZenApp
  def initialize
    build_ui
    # Defer first refresh so window appears immediately
    GLib::Idle.add { refresh_status; false }
    GLib::Timeout.add(3000) { refresh_status; true }
  end

  def build_ui
    @window = Gtk::Window.new
    @window.title = 'TTS-zen'
    @window.set_size_request(360, 340)
    @window.resizable = false
    @window.window_position = :center

    # App icon in taskbar/dock
    icon = File.join(PROJECT_DIR, 'tts.png')
    icon = '/app/share/icons/hicolor/scalable/apps/io.github.jovi-yashi.zentts.png' unless File.exist?(icon)
    if File.exist?(icon)
      begin
        @window.set_icon_from_file(icon)
      rescue
        begin
          pixbuf = GdkPixbuf::Pixbuf.new(file: icon, width: 128, height: 128)
          @window.set_icon(pixbuf)
        rescue
          # Fallback: GTK will use default icon
        end
      end
    end

    # Force dark theme so system borders/widgets match our palette
    settings = Gtk::Settings.default
    settings.gtk_application_prefer_dark_theme = true

    # Proper WM_CLASS so taskbars/docks show "TTS-zen"
    @window.set_wmclass('tts-zen', 'TTS-zen')
    @window.signal_connect('destroy') { Gtk.main_quit }

    provider = Gtk::CssProvider.new
    provider.load(data: CSS)
    Gtk::StyleContext.add_provider_for_screen(
      Gdk::Screen.default, provider, Gtk::StyleProvider::PRIORITY_APPLICATION
    )

    # Header bar (native CSD)
    header = Gtk::HeaderBar.new
    header.show_close_button = true
    header.custom_title = title_widget
    @window.titlebar = header

    # Body
    body = Gtk::Box.new(:vertical, 0)
    body.style_context.add_class('body')

    # Status card
    card = Gtk::Box.new(:vertical, 0)
    card.style_context.add_class('status-card')

    sh = Gtk::Label.new('ESTADO DEL SERVIDOR')
    sh.style_context.add_class('status-header'); sh.halign = :start
    card.pack_start(sh, expand: false, fill: false, padding: 0)

    row = Gtk::Box.new(:horizontal, 8)
    row.style_context.add_class('status-row')
    @dot = Gtk::DrawingArea.new
    @dot.set_size_request(10, 10)
    @dot.style_context.add_class('indicator')
    row.pack_start(@dot, expand: false, fill: false, padding: 0)

    @status_label = Gtk::Label.new('Detenido')
    row.pack_start(@status_label, expand: false, fill: false, padding: 0)
    card.pack_start(row, expand: false, fill: false, padding: 0)

    @detail = Gtk::Label.new("localhost:#{PORT}  ·  sin iniciar")
    @detail.style_context.add_class('detail'); @detail.halign = :start
    card.pack_start(@detail, expand: false, fill: false, padding: 0)
    body.pack_start(card, expand: false, fill: true, padding: 0)

    al = Gtk::Label.new('ACCIONES')
    al.style_context.add_class('section-label'); al.halign = :start
    body.pack_start(al, expand: false, fill: false, padding: 0)

    btn_row = Gtk::Box.new(:horizontal, 8)
    @start_btn = Gtk::Button.new(label: 'Iniciar servidor')
    @start_btn.style_context.add_class('btn-primary')
    @start_btn.signal_connect('clicked') { start_server!; refresh_status }

    @stop_btn = Gtk::Button.new(label: 'Detener')
    @stop_btn.style_context.add_class('btn-danger')
    @stop_btn.signal_connect('clicked') { stop_server!; refresh_status }
    btn_row.pack_start(@start_btn, expand: true, fill: true, padding: 0)
    btn_row.pack_start(@stop_btn, expand: false, fill: false, padding: 0)
    body.pack_start(btn_row, expand: false, fill: true, padding: 0)

    @zen_btn = Gtk::Button.new(label: 'Abrir Zen Browser')
    @zen_btn.style_context.add_class('btn-zen')
    @zen_btn.margin_top = 10
    @zen_btn.signal_connect('clicked') { open_browser }
    body.pack_start(@zen_btn, expand: false, fill: true, padding: 0)

    footer = Gtk::Label.new("TTS-zen v0.4  ·  Ruby #{RUBY_VERSION}")
    footer.style_context.add_class('footer'); footer.halign = :center
    body.pack_start(footer, expand: false, fill: false, padding: 0)

    @window.add(body)
    @window.show_all
  end

  def title_widget
    box = Gtk::Box.new(:horizontal, 7)
    da = Gtk::DrawingArea.new
    da.set_size_request(16, 16)
    da.signal_connect('draw') do |_, cr|
      cr.set_source_rgba(0.655, 0.545, 0.980, 1.0)
      cr.set_line_width(1.5)
      cr.move_to(5, 4); cr.line_to(2, 7);  cr.line_to(2, 10)
      cr.line_to(5, 13); cr.line_to(8, 13); cr.line_to(8, 4)
      cr.close_path; cr.fill_preserve; cr.stroke
      cr.set_line_width(1.2)
      cr.move_to(10.5, 6); cr.curve_to(12, 7, 12, 10, 10.5, 11); cr.stroke
      cr.move_to(12.5, 4.5); cr.curve_to(14, 6, 14, 11, 12.5, 12.5); cr.stroke
      false
    end
    box.pack_start(da, expand: false, fill: false, padding: 0)
    box.show_all
    box
  end

  def refresh_status
    pid = server_running?
    healthy = pid ? server_healthy? : false

    if pid && healthy
      set_dot('dot-on')
      swap_class(@status_label, %w[text-off text-warn], 'text-on')
      @status_label.text = 'En ejecución'
      @detail.text = "localhost:#{PORT}  ·  PID #{pid}  ·  saludable"
      @start_btn.sensitive = false; @stop_btn.sensitive = true
    elsif pid
      set_dot('dot-warn')
      swap_class(@status_label, %w[text-on text-off], 'text-warn')
      @status_label.text = 'Sin respuesta'
      @detail.text = "localhost:#{PORT}  ·  PID #{pid}  ·  sin responder"
      @start_btn.sensitive = true; @stop_btn.sensitive = true
    else
      set_dot('dot-off')
      swap_class(@status_label, %w[text-on text-warn], 'text-off')
      @status_label.text = 'Detenido'
      @detail.text = "localhost:#{PORT}  ·  sin iniciar"
      @start_btn.sensitive = true; @stop_btn.sensitive = false
    end
    true
  end

  def set_dot(cls)
    %w[dot-on dot-off dot-warn].each { |c| @dot.style_context.remove_class(c) }
    @dot.style_context.add_class(cls)
  end

  def swap_class(widget, remove, add)
    remove.each { |c| widget.style_context.remove_class(c) }
    widget.style_context.add_class(add)
  end
end

# ══════════════════════════════════════════════
#  Entry
# ══════════════════════════════════════════════

TTSZenApp.new
Gtk.main
