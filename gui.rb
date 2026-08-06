#!/usr/bin/env ruby
# frozen_string_literal: true
# TTS-zen — Server manager with native GTK3 header bar

require 'gtk3'
require 'fileutils'
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

# ══════════════════════════════════════════════
#  CSS
# ══════════════════════════════════════════════

CSS = <<~CSS
  headerbar {
    background: #0d0d1f;
    border-bottom: 1px solid rgba(167,139,250,0.1);
    min-height: 38px;
    padding: 0 8px;
  }
  headerbar .title {
    font-size: 13px; font-weight: 600; color: #c4b5fd;
  }
  headerbar .subtitle {
    font-size: 10px; font-weight: 400; color: #5b6370;
  }
  headerbar button {
    background: transparent; border: none; box-shadow: none;
    color: #7e8aa0; padding: 4px 8px; border-radius: 6px;
  }
  headerbar button:hover {
    background: rgba(167,139,250,0.12); color: #a78bfa;
  }

  window { background: #0a0a1c; }
  .body { padding: 24px; }

  .status-card {
    background: #111128;
    border: 1px solid rgba(167,139,250,0.08);
    border-radius: 14px;
    padding: 20px 22px;
    margin-bottom: 20px;
  }
  .status-header {
    font-size: 10px; font-weight: 600; color: #5b6370;
    letter-spacing: 0.6px; margin-bottom: 12px;
  }

  .status-row { margin: 6px 0; }
  .indicator {
    min-width: 10px; min-height: 10px; border-radius: 50%; margin-right: 10px;
  }
  .dot-on  { background: #34d399; box-shadow: 0 0 10px rgba(52,211,153,0.5); }
  .dot-off { background: #f87171; box-shadow: 0 0 10px rgba(248,113,113,0.35); }
  .dot-warn { background: #fbbf24; box-shadow: 0 0 10px rgba(251,191,36,0.4); }

  .status-text { font-size: 14px; font-weight: 600; }
  .text-on   { color: #34d399; }
  .text-off  { color: #f87171; }
  .text-warn { color: #fbbf24; }

  .detail {
    font-size: 10px; color: #4b5563; margin-top: 6px;
    font-family: monospace;
  }

  .section-label {
    font-size: 10px; font-weight: 600; color: #5b6370;
    letter-spacing: 0.6px; margin-top: 4px; margin-bottom: 10px;
  }

  button {
    font-size: 12px; font-weight: 600;
    padding: 10px 18px; border-radius: 10px;
    border: none; transition: all 0.15s ease; outline: none;
  }
  button:disabled { opacity: 0.3; }

  .btn-primary {
    background: #7c3aed; color: #fff;
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
    refresh_status
    GLib::Timeout.add(3000) { refresh_status; true }
  end

  def build_ui
    @window = Gtk::Window.new
    @window.title = 'TTS-zen'
    @window.set_size_request(360, 340)
    @window.resizable = false
    @window.window_position = :center
    @window.signal_connect('destroy') { Gtk.main_quit }

    provider = Gtk::CssProvider.new
    provider.load(data: CSS)
    Gtk::StyleContext.add_provider_for_screen(
      Gdk::Screen.default, provider, Gtk::StyleProvider::PRIORITY_APPLICATION
    )

    # ── Header bar (native CSD) ──
    header = Gtk::HeaderBar.new
    header.show_close_button = true
    header.custom_title = title_widget
    @window.titlebar = header

    # ── Body ──
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

    # Actions label
    al = Gtk::Label.new('ACCIONES')
    al.style_context.add_class('section-label'); al.halign = :start
    body.pack_start(al, expand: false, fill: false, padding: 0)

    # Buttons
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
    @zen_btn.signal_connect('clicked') do
      start_server! unless server_running?
      sleep 0.5
      spawn('flatpak', 'run', 'app.zen_browser.zen', out: File::NULL, err: File::NULL)
    end
    body.pack_start(@zen_btn, expand: false, fill: true, padding: 0)

    # Footer
    footer = Gtk::Label.new("TTS-zen v0.4  ·  Ruby #{RUBY_VERSION}")
    footer.style_context.add_class('footer'); footer.halign = :center
    body.pack_start(footer, expand: false, fill: false, padding: 0)

    @window.add(body)
    @window.show_all
  end

  def title_widget
    box = Gtk::Box.new(:horizontal, 7)
    icon = speaker_icon
    box.pack_start(icon, expand: false, fill: false, padding: 0)
    box.show_all
    box
  end

  def speaker_icon
    da = Gtk::DrawingArea.new
    da.set_size_request(16, 16)
    da.signal_connect('draw') do |_, cr|
      cr.set_source_rgba(0.655, 0.545, 0.980, 1.0)
      cr.set_line_width(1.5)
      cr.move_to(5, 4)
      cr.line_to(2, 7)
      cr.line_to(2, 10)
      cr.line_to(5, 13)
      cr.line_to(8, 13)
      cr.line_to(8, 4)
      cr.close_path
      cr.fill_preserve
      cr.stroke
      cr.set_line_width(1.2)
      cr.move_to(10.5, 6)
      cr.curve_to(12, 7, 12, 10, 10.5, 11)
      cr.stroke
      cr.move_to(12.5, 4.5)
      cr.curve_to(14, 6, 14, 11, 12.5, 12.5)
      cr.stroke
      false
    end
    da
  end

  # ── Status ──

  def refresh_status
    pid = server_running?
    healthy = pid ? server_healthy? : false

    if pid && healthy
      set_dot('dot-on')
      swap_class(@status_label, %w[text-off text-warn], 'text-on')
      @status_label.text = 'En ejecucion'
      @detail.text = "localhost:#{PORT}  ·  PID #{pid}  ·  saludable"
      @start_btn.sensitive = false
      @stop_btn.sensitive = true
    elsif pid
      set_dot('dot-warn')
      swap_class(@status_label, %w[text-on text-off], 'text-warn')
      @status_label.text = 'Sin respuesta'
      @detail.text = "localhost:#{PORT}  ·  PID #{pid}  ·  sin responder"
      @start_btn.sensitive = true
      @stop_btn.sensitive = true
    else
      set_dot('dot-off')
      swap_class(@status_label, %w[text-on text-warn], 'text-off')
      @status_label.text = 'Detenido'
      @detail.text = "localhost:#{PORT}  ·  sin iniciar"
      @start_btn.sensitive = true
      @stop_btn.sensitive = false
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

TTSZenApp.new
Gtk.main
