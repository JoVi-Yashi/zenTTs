#!/usr/bin/env ruby
# frozen_string_literal: true
# TTS-zen GUI — Desktop app to manage the edge-tts server visually

require 'gtk3'
require 'fileutils'
require 'json'
require 'open3'
require 'net/http'

PORT = 8765
PROJECT_DIR = File.dirname(File.expand_path(__FILE__))
PID_DIR = File.join(Dir.home, '.local', 'share', 'tts-zen')
PID_FILE = File.join(PID_DIR, 'server.pid')
LOG_FILE = File.join(PID_DIR, 'server.log')
FileUtils.mkdir_p(PID_DIR)

# ── Helpers ──

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

# ── CSS Theme ──

CSS = <<~CSS
  window { background: #0d0d1a; }
  .main-box { padding: 28px 32px; }
  .title { font-size: 22px; font-weight: bold; color: #a78bfa; margin-bottom: 4px; }
  .subtitle { font-size: 12px; color: #6b7280; margin-bottom: 20px; }
  .status-row { margin: 16px 0 20px; }
  .status-label { font-size: 13px; color: #d1d5db; }
  .status-running { font-size: 14px; font-weight: bold; color: #34d399; margin-left: 8px; }
  .status-stopped { font-size: 14px; font-weight: bold; color: #f87171; margin-left: 8px; }
  .info-text { font-size: 11px; color: #6b7280; margin-top: 4px; }
  .voice-label { font-size: 12px; color: #9ca3af; margin-top: 14px; margin-bottom: 6px; }
  .section-label { font-size: 12px; font-weight: bold; color: #a78bfa; margin-top: 18px; margin-bottom: 8px; }
  button {
    font-size: 13px; font-weight: 600; padding: 10px 20px;
    border-radius: 10px; border: none; transition: all .2s;
  }
  .btn-start {
    background: linear-gradient(135deg, #7c3aed, #6d28d9);
    color: #fff; box-shadow: 0 2px 12px rgba(124,58,237,.3);
  }
  .btn-start:hover { background: #8b5cf6; box-shadow: 0 4px 20px rgba(124,58,237,.45); }
  .btn-stop {
    background: rgba(248,113,113,.15); color: #f87171;
    border: 1px solid rgba(248,113,113,.25);
  }
  .btn-stop:hover { background: rgba(248,113,113,.25); }
  .btn-open {
    background: rgba(167,139,250,.1); color: #a78bfa;
    border: 1px solid rgba(167,139,250,.2);
  }
  .btn-open:hover { background: rgba(167,139,250,.2); }
  combobox {
    font-size: 12px; padding: 4px;
    background: rgba(255,255,255,.05); color: #d1d5db;
    border: 1px solid rgba(255,255,255,.08); border-radius: 8px;
  }
  combobox button { background: transparent; border: none; color: #d1d5db; }
  .footer { font-size: 10px; color: #4b5563; margin-top: 24px; }
  .dot { font-size: 18px; }
  .green { color: #34d399; }
  .red { color: #f87171; }
CSS

# ── App ──

class TTSZenApp
  def initialize
    @builder = Gtk::Builder.new
    build_ui
    refresh_status
    GLib::Timeout.add(3000) { refresh_status; true }
  end

  def build_ui
    @window = Gtk::Window.new
    @window.title = 'TTS-zen'
    @window.set_size_request(380, 480)
    @window.resizable = false
    @window.set_keep_above true
    @window.window_position = :center

    @window.signal_connect('destroy') { Gtk.main_quit }

    # Apply CSS
    provider = Gtk::CssProvider.new
    provider.load(data: CSS)
    Gtk::StyleContext.add_provider_for_screen(
      Gdk::Screen.default, provider, Gtk::StyleProvider::PRIORITY_APPLICATION
    )

    # Main layout
    main = Gtk::Box.new(:vertical, 0)
    main.style_context.add_class('main-box')

    # Title
    title = Gtk::Label.new
    title.markup = '<span size="x-large" weight="bold" foreground="#a78bfa">◈ TTS-zen</span>'
    title.halign = :start
    main.pack_start(title, expand: false, fill: false, padding: 0)

    subtitle = Gtk::Label.new('Servidor edge-tts · 45 voces neurales')
    subtitle.style_context.add_class('subtitle')
    subtitle.halign = :start
    main.pack_start(subtitle, expand: false, fill: false, padding: 0)

    # Status section
    status_header = Gtk::Label.new
    status_header.markup = '<span weight="bold" foreground="#a78bfa">Estado</span>'
    status_header.halign = :start
    status_header.margin_top = 16
    main.pack_start(status_header, expand: false, fill: false, padding: 0)

    @status_box = Gtk::Box.new(:horizontal, 8)
    @status_dot = Gtk::Label.new('●')
    @status_dot.style_context.add_class('dot')
    @status_box.pack_start(@status_dot, expand: false, fill: false, padding: 0)

    @status_label = Gtk::Label.new('Detenido')
    @status_box.pack_start(@status_label, expand: false, fill: false, padding: 0)
    main.pack_start(@status_box, expand: false, fill: false, padding: 0)

    @info_label = Gtk::Label.new("localhost:#{PORT}")
    @info_label.style_context.add_class('info-text')
    @info_label.halign = :start
    @info_label.margin_bottom = 16
    main.pack_start(@info_label, expand: false, fill: false, padding: 0)

    # Voice selector
    voice_header = Gtk::Label.new
    voice_header.markup = '<span weight="bold" foreground="#a78bfa">Voz predeterminada</span>'
    voice_header.halign = :start
    voice_header.margin_top = 8
    main.pack_start(voice_header, expand: false, fill: false, padding: 0)

    @voice_combo = Gtk::ComboBoxText.new
    @voice_combo.append_text('Cargando...')
    @voice_combo.active = 0
    main.pack_start(@voice_combo, expand: false, fill: false, padding: 0)

    # Buttons
    btn_box = Gtk::Box.new(:horizontal, 10)
    btn_box.margin_top = 24

    @start_btn = Gtk::Button.new(label: '▶  Iniciar')
    @start_btn.style_context.add_class('btn-start')
    @start_btn.signal_connect('clicked') { start_server!; refresh_status; load_voices_async }
    btn_box.pack_start(@start_btn, expand: true, fill: true, padding: 0)

    @stop_btn = Gtk::Button.new(label: '■  Detener')
    @stop_btn.style_context.add_class('btn-stop')
    @stop_btn.signal_connect('clicked') { stop_server!; refresh_status }
    btn_box.pack_start(@stop_btn, expand: true, fill: true, padding: 0)
    main.pack_start(btn_box, expand: false, fill: false, padding: 0)

    # Open browser
    @open_btn = Gtk::Button.new(label: '🌐  Abrir Zen Browser')
    @open_btn.style_context.add_class('btn-open')
    @open_btn.margin_top = 12
    @open_btn.signal_connect('clicked') do
      start_server! unless server_running?
      sleep 0.5
      spawn('flatpak', 'run', 'app.zen_browser.zen', out: File::NULL, err: File::NULL)
    end
    main.pack_start(@open_btn, expand: false, fill: false, padding: 0)

    # Footer
    footer = Gtk::Label.new("TTS-zen v0.4 · Ruby #{RUBY_VERSION}")
    footer.style_context.add_class('footer')
    footer.halign = :center
    footer.margin_top = 28
    main.pack_start(footer, expand: false, fill: false, padding: 0)

    @window.add(main)
    @window.show_all
  end

  def refresh_status
    pid = server_running?
    healthy = pid ? server_healthy? : false

    if pid && healthy
      @status_dot.style_context.remove_class('red')
      @status_dot.style_context.add_class('green')
      @status_label.style_context.remove_class('status-stopped')
      @status_label.style_context.add_class('status-running')
      @status_label.text = 'En ejecución'
      @info_label.text = "localhost:#{PORT} · PID #{pid} · saludable"
      @start_btn.sensitive = false
      @stop_btn.sensitive = true
    elsif pid
      @status_dot.style_context.remove_class('green')
      @status_dot.style_context.add_class('red')
      @status_label.style_context.remove_class('status-running')
      @status_label.style_context.add_class('status-stopped')
      @status_label.text = 'Sin respuesta'
      @info_label.text = "localhost:#{PORT} · PID #{pid} · sin responder"
      @start_btn.sensitive = true
      @stop_btn.sensitive = true
    else
      @status_dot.style_context.remove_class('green')
      @status_dot.style_context.add_class('red')
      @status_label.style_context.remove_class('status-running')
      @status_label.style_context.add_class('status-stopped')
      @status_label.text = 'Detenido'
      @info_label.text = "localhost:#{PORT} · sin iniciar"
      @start_btn.sensitive = true
      @stop_btn.sensitive = false
    end

    true
  end

  def load_voices_async
    Thread.new do
      voices = fetch_voices
      GLib::Idle.add do
        @voice_combo.remove_all
        voices.each do |v|
          label = "#{v['name']}  (#{v['gender']}, #{v['locale']})"
          @voice_combo.append_text(label)
        end
        @voice_combo.active = 0
        false # remove idle
      end
    end
  end
end

# ── Entry point ──

TTSZenApp.new
Gtk.main
