#!/usr/bin/env ruby
# frozen_string_literal: true
# TTS-zen GUI — Visual server manager with dark theme

require 'gtk3'
require 'fileutils'
require 'json'
require 'net/http'

PORT = 8765
PROJECT_DIR = File.dirname(File.expand_path(__FILE__))
PID_DIR = File.join(Dir.home, '.local', 'share', 'tts-zen')
PID_FILE = File.join(PID_DIR, 'server.pid')
LOG_FILE = File.join(PID_DIR, 'server.log')
FileUtils.mkdir_p(PID_DIR)

# ══════════════════════════════════════════════
#  Helpers
# ══════════════════════════════════════════════

def server_running?
  pid = `fuser #{PORT}/tcp 2>/dev/null`.strip
  return pid unless pid.empty?
  if File.exist?(PID_FILE)
    pid = File.read(PID_FILE).strip
    return pid if !pid.empty? && Process.kill(0, pid.to_i) rescue nil
  end
  nil
end

def server_healthy?
  uri = URI("http://127.0.0.1:#{PORT}/health")
  Net::HTTP.get_response(uri).body.include?('"status":"ok"')
rescue
  false
end

def start_server!
  return if server_running?
  pid = spawn('ruby', File.join(PROJECT_DIR, 'server.rb'),
              chdir: PROJECT_DIR, out: LOG_FILE, err: LOG_FILE, pgroup: true)
  Process.detach(pid)
  File.write(PID_FILE, pid.to_s)
  20.times do
    sleep 0.3
    break if server_healthy?
  end
end

def stop_server!
  system('fuser', '-k', "#{PORT}/tcp", err: File::NULL) rescue nil
  sleep 0.5
  FileUtils.rm_f(PID_FILE)
end

def fetch_voices
  uri = URI("http://127.0.0.1:#{PORT}/voices?locale=es-")
  JSON.parse(Net::HTTP.get(uri))
rescue
  [{ 'name' => 'es-ES-AlvaroNeural', 'locale' => 'es-ES', 'gender' => 'Male' }]
end

# ══════════════════════════════════════════════
#  GTK3 CSS Theme
# ══════════════════════════════════════════════

CSS = <<~CSS
  window {
    background: #0a0a1a;
    font-family: 'Inter', 'Cantarell', 'Segoe UI', system-ui, sans-serif;
  }
  .window-box { padding: 0; }

  /* ── Header ── */
  .header {
    background: #111128;
    padding: 28px 28px 22px;
    border-bottom: 1px solid rgba(167,139,250,0.08);
  }
  .logo-row { margin-bottom: 6px; }
  .app-title { font-size: 20px; font-weight: 700; color: #c4b5fd; }
  .app-title accent { color: #a78bfa; font-style: italic; }
  .app-subtitle { font-size: 11px; color: #5b6370; margin-top: 2px; }

  /* ── Body ── */
  .body { padding: 20px 24px 24px; }

  /* ── Status card ── */
  .status-card {
    background: rgba(20,20,43,0.7);
    border: 1px solid rgba(167,139,250,0.08);
    border-radius: 14px;
    padding: 16px 18px;
    margin-bottom: 18px;
  }
  .status-header { font-size: 10px; font-weight: 600; color: #5b6370; letter-spacing: 0.5px; margin-bottom: 8px; }
  .status-row-box { margin: 4px 0; }
  .status-indicator {
    min-width: 10px; min-height: 10px;
    border-radius: 50%; margin-right: 8px;
  }
  .indicator-on { background: #34d399; box-shadow: 0 0 8px rgba(52,211,153,0.4); }
  .indicator-off { background: #f87171; box-shadow: 0 0 8px rgba(248,113,113,0.3); }
  .status-text { font-size: 13px; font-weight: 600; }
  .text-on { color: #34d399; }
  .text-off { color: #f87171; }
  .text-warn { color: #fbbf24; }
  .status-detail { font-size: 10px; color: #4b5563; margin-top: 5px; }

  /* ── Section header ── */
  .section-label {
    font-size: 10px; font-weight: 600; color: #5b6370;
    letter-spacing: 0.5px; margin-bottom: 8px; margin-top: 2px;
  }

  /* ── Combobox ── */
  combobox {
    font-size: 12px; min-height: 30px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 8px; padding: 2px;
    color: #c4b5fd;
  }
  combobox button { background: transparent; border: none; color: #c4b5fd; }
  combobox box.linked { background: transparent; }

  /* ── Buttons ── */
  button {
    font-size: 12px; font-weight: 600;
    padding: 10px 16px; border-radius: 10px;
    border: none; transition: all 0.2s ease;
    outline: none;
  }
  button:disabled { opacity: 0.35; }
  .btn-primary {
    background: #7c3aed;
    color: #fff;
    box-shadow: 0 2px 12px rgba(124,58,237,0.25);
  }
  .btn-primary:hover {
    background: #8b5cf6;
    box-shadow: 0 4px 20px rgba(124,58,237,0.4);
  }
  .btn-danger {
    background: rgba(248,113,113,0.1);
    color: #f87171;
    border: 1px solid rgba(248,113,113,0.15);
  }
  .btn-danger:hover { background: rgba(248,113,113,0.18); }
  .btn-ghost {
    background: transparent;
    color: #7e8aa0;
    border: 1px solid rgba(255,255,255,0.06);
  }
  .btn-ghost:hover {
    background: rgba(167,139,250,0.08);
    border-color: rgba(167,139,250,0.18);
    color: #a78bfa;
  }

  /* ── Footer ── */
  .footer {
    font-size: 10px; color: #3a3f50; margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid rgba(255,255,255,0.03);
  }
CSS

# ══════════════════════════════════════════════
#  App
# ══════════════════════════════════════════════

class TTSZenApp
  def initialize
    build_ui
    refresh_status
    GLib::Timeout.add(3000) { refresh_status; true }
  end

  def build_ui
    @window = Gtk::Window.new
    @window.title = 'TTS-zen'
    @window.set_size_request(380, 440)
    @window.resizable = false
    @window.window_position = :center
    @window.signal_connect('destroy') { Gtk.main_quit }

    provider = Gtk::CssProvider.new
    provider.load(data: CSS)
    Gtk::StyleContext.add_provider_for_screen(
      Gdk::Screen.default, provider, Gtk::StyleProvider::PRIORITY_APPLICATION
    )

    # Root
    root = Gtk::Box.new(:vertical, 0)
    root.style_context.add_class('window-box')

    # ── Header ──
    header = Gtk::Box.new(:vertical, 0)
    header.style_context.add_class('header')

    logo_row = Gtk::Box.new(:horizontal, 8)
    logo_row.style_context.add_class('logo-row')
    logo_row.pack_start(speaker_icon, expand: false, fill: false, padding: 0)

    title = Gtk::Label.new
    title.markup = '<span size="large" weight="bold" foreground="#c4b5fd">zen</span><span size="large" weight="bold" foreground="#a78bfa" style="italic">TTS</span>'
    title.halign = :start
    logo_row.pack_start(title, expand: false, fill: false, padding: 0)
    header.pack_start(logo_row, expand: false, fill: false, padding: 0)

    subtitle = Gtk::Label.new('Servidor edge-tts  ·  45 voces neurales Microsoft')
    subtitle.style_context.add_class('app-subtitle')
    subtitle.halign = :start
    header.pack_start(subtitle, expand: false, fill: false, padding: 0)

    root.pack_start(header, expand: false, fill: true, padding: 0)

    # ── Body ──
    body = Gtk::Box.new(:vertical, 0)
    body.style_context.add_class('body')

    # Status card
    @status_card = Gtk::Box.new(:vertical, 0)
    @status_card.style_context.add_class('status-card')

    status_header = Gtk::Label.new('ESTADO DEL SERVIDOR')
    status_header.style_context.add_class('status-header')
    status_header.halign = :start
    @status_card.pack_start(status_header, expand: false, fill: false, padding: 0)

    status_row = Gtk::Box.new(:horizontal, 8)
    status_row.style_context.add_class('status-row-box')
    @status_dot = Gtk::DrawingArea.new
    @status_dot.set_size_request(10, 10)
    @status_dot.style_context.add_class('status-indicator')
    status_row.pack_start(@status_dot, expand: false, fill: false, padding: 0)

    @status_label = Gtk::Label.new('Detenido')
    status_row.pack_start(@status_label, expand: false, fill: false, padding: 0)
    @status_card.pack_start(status_row, expand: false, fill: false, padding: 0)

    @detail_label = Gtk::Label.new("localhost:#{PORT}  ·  sin iniciar")
    @detail_label.style_context.add_class('status-detail')
    @detail_label.halign = :start
    @status_card.pack_start(@detail_label, expand: false, fill: false, padding: 0)

    body.pack_start(@status_card, expand: false, fill: true, padding: 0)

    # Voice section
    voice_label = Gtk::Label.new('VOZ PREDETERMINADA')
    voice_label.style_context.add_class('section-label')
    voice_label.halign = :start
    body.pack_start(voice_label, expand: false, fill: false, padding: 0)

    @voice_combo = Gtk::ComboBoxText.new
    @voice_combo.append_text('Cargando voces...')
    @voice_combo.active = 0
    body.pack_start(@voice_combo, expand: false, fill: true, padding: 0)

    # Buttons
    btn_box = Gtk::Box.new(:horizontal, 8)
    btn_box.margin_top = 18

    @start_btn = Gtk::Button.new(label: 'Iniciar servidor')
    @start_btn.style_context.add_class('btn-primary')
    @start_btn.signal_connect('clicked') { start_server!; refresh_status; load_voices_async }

    @stop_btn = Gtk::Button.new(label: 'Detener')
    @stop_btn.style_context.add_class('btn-danger')
    @stop_btn.signal_connect('clicked') { stop_server!; refresh_status }

    btn_box.pack_start(@start_btn, expand: true, fill: true, padding: 0)
    btn_box.pack_start(@stop_btn, expand: false, fill: false, padding: 0)
    body.pack_start(btn_box, expand: false, fill: true, padding: 0)

    # Open Zen
    @open_btn = Gtk::Button.new(label: 'Abrir Zen Browser')
    @open_btn.style_context.add_class('btn-ghost')
    @open_btn.margin_top = 10
    @open_btn.signal_connect('clicked') do
      start_server! unless server_running?
      sleep 0.5
      spawn('flatpak', 'run', 'app.zen_browser.zen', out: File::NULL, err: File::NULL)
    end
    body.pack_start(@open_btn, expand: false, fill: true, padding: 0)

    root.pack_start(body, expand: true, fill: true, padding: 0)

    # Footer
    footer = Gtk::Label.new("TTS-zen v0.4  ·  Ruby #{RUBY_VERSION}")
    footer.style_context.add_class('footer')
    footer.halign = :center
    root.pack_start(footer, expand: false, fill: false, padding: 0)

    @window.add(root)
    @window.show_all
  end

  def speaker_icon
    icon = Gtk::DrawingArea.new
    icon.set_size_request(18, 18)
    icon.signal_connect('draw') do |_, cr|
      cr.set_source_rgba(0.655, 0.545, 0.980, 1.0) # #a78bfa
      cr.set_line_width(1.5)
      cr.move_to(6, 5);  cr.line_to(2, 9);  cr.line_to(2, 12)
      cr.line_to(6, 16); cr.line_to(10, 16); cr.line_to(10, 5)
      cr.close_path; cr.fill_preserve; cr.set_source_rgba(0.655, 0.545, 0.980, 1.0); cr.stroke
      cr.set_line_width(1.2)
      cr.move_to(13, 7); cr.curve_to(15, 8.5, 15, 12.5, 13, 14); cr.stroke
      cr.move_to(15.5, 5); cr.curve_to(17.5, 7, 17.5, 14, 15.5, 16); cr.stroke
      false
    end
    icon
  end

  # ── Status refresh ──

  def refresh_status
    pid = server_running?
    healthy = pid ? server_healthy? : false

    if pid && healthy
      set_indicator(:on)
      @status_label.style_context.remove_class('text-off')
      @status_label.style_context.remove_class('text-warn')
      @status_label.style_context.add_class('text-on')
      @status_label.text = 'En ejecucion'
      @detail_label.text = "localhost:#{PORT}  ·  PID #{pid}  ·  saludable"
      @start_btn.sensitive = false
      @stop_btn.sensitive = true
    elsif pid
      set_indicator(:warn)
      @status_label.style_context.remove_class('text-on')
      @status_label.style_context.remove_class('text-off')
      @status_label.style_context.add_class('text-warn')
      @status_label.text = 'Sin respuesta'
      @detail_label.text = "localhost:#{PORT}  ·  PID #{pid}  ·  sin responder"
      @start_btn.sensitive = true
      @stop_btn.sensitive = true
    else
      set_indicator(:off)
      @status_label.style_context.remove_class('text-on')
      @status_label.style_context.remove_class('text-warn')
      @status_label.style_context.add_class('text-off')
      @status_label.text = 'Detenido'
      @detail_label.text = "localhost:#{PORT}  ·  sin iniciar"
      @start_btn.sensitive = true
      @stop_btn.sensitive = false
    end

    true
  end

  def set_indicator(state)
    @status_dot.style_context.remove_class('indicator-on')
    @status_dot.style_context.remove_class('indicator-off')
    case state
    when :on   then @status_dot.style_context.add_class('indicator-on')
    when :warn then @status_dot.style_context.add_class('indicator-off')
    when :off  then @status_dot.style_context.add_class('indicator-off')
    end
  end

  def load_voices_async
    Thread.new do
      voices = fetch_voices
      GLib::Idle.add do
        @voice_combo.remove_all
        voices.each do |v|
          @voice_combo.append_text("#{v['name']}  ·  #{v['gender']}")
        end
        @voice_combo.active = 0
        false
      end
    end
  end
end

# ══════════════════════════════════════════════

TTSZenApp.new
Gtk.main
