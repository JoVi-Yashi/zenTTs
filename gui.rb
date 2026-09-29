#!/usr/bin/env ruby
# frozen_string_literal: true
# zenTTS — Cross-platform server manager (Linux / Windows)

require 'gtk3'
require 'fileutils'
require 'net/http'

# Identify as zenTTS in taskbars, docks, and alt-tab
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

# ── Translations ──

LANG_FILE = File.join(DATA_DIR, 'lang')

def load_lang
  File.read(LANG_FILE).strip == 'en' ? 'en' : 'es'
rescue
  'es'
end

def save_lang(lang)
  File.write(LANG_FILE, lang)
end

L = {
  es: {
    status_header: 'Servidor de voces neurales',
    stopped: 'Detenido',
    not_started: 'sin iniciar',
    running: 'En ejecución',
    healthy: 'saludable',
    no_response: 'Sin respuesta',
    not_responding: 'sin responder',
    actions: 'Acciones',
    start: 'Iniciar servidor',
    stop: 'Detener',
    open_zen: 'Abrir Zen Browser',
    version: 'zenTTS 0.4'
  },
  en: {
    status_header: 'Neural voice server',
    stopped: 'Stopped',
    not_started: 'not started',
    running: 'Running',
    healthy: 'healthy',
    no_response: 'No response',
    not_responding: 'not responding',
    actions: 'Actions',
    start: 'Start server',
    stop: 'Stop',
    open_zen: 'Open Zen Browser',
    version: 'zenTTS 0.4'
  }
}

def l(key, lang = @lang)
  (L[lang.to_sym] || L[:es])[key.to_sym] || key.to_s
end

# ══════════════════════════════════════════════
#  CSS
# ══════════════════════════════════════════════

CSS = <<~CSS
  window {
    background: #1b1916;
    color: #e9e2d4;
  }
  decoration { box-shadow: 0 2px 10px rgba(0,0,0,0.4); }

  headerbar {
    background: #1b1916;
    border: none;
    border-bottom: 1px solid #3a352e;
    box-shadow: none;
    min-height: 40px;
  }
  headerbar button { color: #a39a8b; border-color: transparent; }
  headerbar button:hover { color: #e9e2d4; background: rgba(233,226,212,0.07); }

  .app-title {
    font-family: "Iowan Old Style", "Charter", "Source Serif 4", Georgia, serif;
    font-size: 16px; font-weight: 600; color: #e9e2d4;
  }
  .app-title-accent {
    font-family: "Iowan Old Style", "Charter", "Source Serif 4", Georgia, serif;
    font-size: 16px; font-style: italic; color: #d9785c;
  }

  .body { padding: 22px 24px 18px; }

  .status-card {
    padding: 0 0 18px; margin-bottom: 18px;
    border-bottom: 1px solid #3a352e;
  }
  .status-header, .section-label {
    font-size: 12px; color: #a39a8b; margin-bottom: 8px;
  }
  .indicator { min-width: 8px; min-height: 8px; border-radius: 50%; margin-right: 8px; }
  .dot-on   { background: #8fb573; }
  .dot-off  { background: #6d655a; }
  .dot-warn { background: #d9a441; }

  .status-text {
    font-family: "Iowan Old Style", "Charter", "Source Serif 4", Georgia, serif;
    font-size: 20px; color: #e9e2d4;
  }
  .text-on, .text-off, .text-warn { color: #e9e2d4; }
  .detail {
    font-family: monospace; font-size: 11px; color: #a39a8b; margin-top: 4px;
  }

  button {
    font-size: 13px; padding: 8px 16px; border-radius: 4px;
    border: 1px solid #3a352e; background: transparent; background-image: none;
    color: #e9e2d4; box-shadow: none; text-shadow: none; outline: none;
  }
  button:hover { background: rgba(233,226,212,0.07); }
  button:disabled { opacity: 0.35; }

  .btn-primary { background: #e9e2d4; color: #1b1916; border-color: #e9e2d4; font-weight: 600; }
  .btn-primary:hover { background: #d8d0c1; }
  .btn-primary label { color: #1b1916; }

  .btn-danger { color: #d9785c; }
  .btn-danger label { color: #d9785c; }

  .btn-zen { border-color: transparent; color: #a39a8b; }
  .btn-zen label { color: #a39a8b; }
  .btn-zen:hover label { color: #e9e2d4; }

  .lang-toggle { font-size: 12px; padding: 2px 8px; border-color: transparent; color: #a39a8b; }
  .lang-toggle label { color: #a39a8b; }

  .footer { font-size: 11px; color: #6d655a; margin-top: 10px; }
CSS

# ══════════════════════════════════════════════
#  App
# ══════════════════════════════════════════════

class TTSZenApp
  def initialize
    @lang = load_lang
    build_ui
    GLib::Idle.add { refresh_status; false }
    GLib::Timeout.add(3000) { refresh_status; true }
  end

  def build_ui
    @window = Gtk::Window.new
    @window.title = 'zenTTS'
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

    # Proper WM_CLASS so taskbars/docks show "zenTTS"
    @window.set_wmclass('tts-zen', 'zenTTS')
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

    sh = Gtk::Label.new(l(:status_header))
    sh.style_context.add_class('status-header'); sh.halign = :start
    card.pack_start(sh, expand: false, fill: false, padding: 0)

    row = Gtk::Box.new(:horizontal, 8)
    row.style_context.add_class('status-row')
    @dot = Gtk::DrawingArea.new
    @dot.set_size_request(8, 8)
    @dot.valign = :center
    @dot.style_context.add_class('indicator')
    @dot.signal_connect('draw') do |w, cr|
      Gtk.render_background(w.style_context, cr, 0, 0, w.allocated_width, w.allocated_height)
      false
    end
    row.pack_start(@dot, expand: false, fill: false, padding: 0)

    @status_label = Gtk::Label.new(l(:stopped))
    @status_label.style_context.add_class('status-text')
    row.pack_start(@status_label, expand: false, fill: false, padding: 0)
    card.pack_start(row, expand: false, fill: false, padding: 0)

    @detail = Gtk::Label.new("localhost:#{PORT}  ·  #{l(:not_started)}")
    @detail.style_context.add_class('detail'); @detail.halign = :start
    card.pack_start(@detail, expand: false, fill: false, padding: 0)
    body.pack_start(card, expand: false, fill: true, padding: 0)

    al = Gtk::Label.new(l(:actions))
    al.style_context.add_class('section-label'); al.halign = :start
    body.pack_start(al, expand: false, fill: false, padding: 0)

    btn_row = Gtk::Box.new(:horizontal, 8)
    @start_btn = Gtk::Button.new(label: l(:start))
    @start_btn.style_context.add_class('btn-primary')
    @start_btn.signal_connect('clicked') { start_server!; refresh_status }

    @stop_btn = Gtk::Button.new(label: l(:stop))
    @stop_btn.style_context.add_class('btn-danger')
    @stop_btn.signal_connect('clicked') { stop_server!; refresh_status }
    btn_row.pack_start(@start_btn, expand: true, fill: true, padding: 0)
    btn_row.pack_start(@stop_btn, expand: false, fill: false, padding: 0)
    body.pack_start(btn_row, expand: false, fill: true, padding: 0)

    @zen_btn = Gtk::Button.new(label: l(:open_zen))
    @zen_btn.style_context.add_class('btn-zen')
    @zen_btn.margin_top = 10
    @zen_btn.signal_connect('clicked') { open_browser }
    body.pack_start(@zen_btn, expand: false, fill: true, padding: 0)

    # Language toggle
    lang_row = Gtk::Box.new(:horizontal, 0)
    lang_row.halign = :center; lang_row.margin_top = 10
    @lang_btn = Gtk::Button.new(label: @lang == 'en' ? 'English' : 'Español')
    @lang_btn.style_context.add_class('lang-toggle')
    @lang_btn.signal_connect('clicked') do
      @lang = @lang == 'es' ? 'en' : 'es'
      @lang_btn.label = @lang == 'en' ? 'English' : 'Español'
      save_lang(@lang)
      apply_language
    end
    lang_row.pack_start(@lang_btn, expand: false, fill: false, padding: 0)
    body.pack_start(lang_row, expand: false, fill: false, padding: 0)

    footer = Gtk::Label.new("#{l(:version)}  ·  Ruby #{RUBY_VERSION}")
    footer.style_context.add_class('footer'); footer.halign = :center
    body.pack_start(footer, expand: false, fill: false, padding: 0)

    @window.add(body)
    @window.show_all
  end

  def title_widget
    box = Gtk::Box.new(:horizontal, 0)
    zen = Gtk::Label.new('zen')
    zen.style_context.add_class('app-title')
    tts = Gtk::Label.new('TTS')
    tts.style_context.add_class('app-title-accent')
    box.pack_start(zen, expand: false, fill: false, padding: 0)
    box.pack_start(tts, expand: false, fill: false, padding: 0)
    box.show_all
    box
  end

  def apply_language
    @start_btn.label = l(:start)
    @stop_btn.label = l(:stop)
    @zen_btn.label = l(:open_zen)
    # Update static labels
    @window.child.children.each do |child|
      if child.is_a?(Gtk::Box)
        child.children.each do |c|
          if c.is_a?(Gtk::Label) && c.style_context.has_class?('status-header')
            c.text = l(:status_header)
          elsif c.is_a?(Gtk::Label) && c.style_context.has_class?('section-label')
            c.text = l(:actions)
          end
        end
      end
    end
    refresh_status
  end

  def refresh_status
    pid = server_running?
    healthy = pid ? server_healthy? : false

    if pid && healthy
      set_dot('dot-on')
      swap_class(@status_label, %w[text-off text-warn], 'text-on')
      @status_label.text = l(:running)
      @detail.text = "localhost:#{PORT}  ·  PID #{pid}  ·  #{l(:healthy)}"
      @start_btn.sensitive = false; @stop_btn.sensitive = true
    elsif pid
      set_dot('dot-warn')
      swap_class(@status_label, %w[text-on text-off], 'text-warn')
      @status_label.text = l(:no_response)
      @detail.text = "localhost:#{PORT}  ·  PID #{pid}  ·  #{l(:not_responding)}"
      @start_btn.sensitive = true; @stop_btn.sensitive = true
    else
      set_dot('dot-off')
      swap_class(@status_label, %w[text-on text-warn], 'text-off')
      @status_label.text = l(:stopped)
      @detail.text = "localhost:#{PORT}  ·  #{l(:not_started)}"
      @start_btn.sensitive = true; @stop_btn.sensitive = false
    end
    true
  end

  def set_dot(cls)
    %w[dot-on dot-off dot-warn].each { |c| @dot.style_context.remove_class(c) }
    @dot.style_context.add_class(cls)
    @dot.queue_draw
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
