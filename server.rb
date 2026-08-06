#!/usr/bin/env ruby
# frozen_string_literal: true
# zenTTS Server — Ruby/Sinatra REST API for edge-tts

require 'sinatra'
require 'json'
require 'base64'
require 'open3'
require 'tempfile'
require 'fileutils'

set :port, 8765
set :bind, '127.0.0.1'

# ── CORS ──
before do
  headers 'Access-Control-Allow-Origin' => '*',
          'Access-Control-Allow-Methods' => 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers' => 'Content-Type'
end

options '*' do
  200
end

# ── Edge-TTS CLI path ──
EDGE_TTS = ENV.fetch('EDGE_TTS_PATH', 'edge-tts').freeze
TRAFILATURA = ENV.fetch('TRAFILATURA_PATH', 'trafilatura').freeze

# ── Helpers ──

def run_tts(text, voice: 'es-ES-AlvaroNeural', rate: '+0%')
  tmp_audio = Tempfile.new(['tts', '.mp3'])
  tmp_subs  = Tempfile.new(['tts', '.vtt'])
  begin
    cmd = [EDGE_TTS, '--voice', voice, '--rate', rate,
           '--text', text,
           '--write-media', tmp_audio.path,
           '--write-subtitles', tmp_subs.path]
    _out, err, status = Open3.capture3(*cmd)
    raise "edge-tts failed: #{err}" unless status.success?

    audio = File.binread(tmp_audio.path)
    subs  = File.read(tmp_subs.path) rescue ''
    [audio, subs]
  ensure
    tmp_audio.close!
    tmp_subs.close!
  end
end

def parse_vtt(vtt)
  sentences = []
  vtt.scan(/^(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})\n(.+?)(?=\n\n|\z)/m) do
    start = parse_timestamp(Regexp.last_match(1))
    endt  = parse_timestamp(Regexp.last_match(2))
    text  = Regexp.last_match(3).gsub(/<[^>]+>/, '').strip
    sentences << { text: text, start: start, end: endt } unless text.empty?
  end
  sentences
end

def parse_timestamp(ts)
  h, m, s = ts.split(':').map(&:to_f)
  (h * 3600 + m * 60 + s).round(3)
end

# ── Routes ──

get '/' do
  content_type :json
  {
    name: 'zenTTS',
    version: '0.3.0',
    endpoints: {
      '/health' => 'GET — health check',
      '/voices?locale=es-' => 'GET — list voices',
      '/tts' => 'POST {text, voice?, rate?} — MP3 audio',
      '/tts/sync' => 'POST {text, voice?, rate?} — audio + timing',
      '/extract' => 'POST {url, voice?, rate?} — extract + TTS'
    }
  }.to_json
end

get '/health' do
  content_type :json
  { status: 'ok' }.to_json
end

get '/voices' do
  locale = params[:locale]
  out, _err, status = Open3.capture3(EDGE_TTS, '--list-voices')
  unless status.success?
    halt 500, { error: 'Failed to list voices' }.to_json
  end

  voices = JSON.parse(out).map do |v|
    {
      name: v['ShortName'],
      locale: v['Locale'],
      gender: v['Gender'] || '',
      friendly: v['FriendlyName'] || v['ShortName']
    }
  end

  voices.select! { |v| v[:locale].start_with?(locale) } if locale
  content_type :json
  voices.to_json
end

post '/tts' do
  body = JSON.parse(request.body.read) rescue {}
  text = (body['text'] || '').strip
  halt 400, { error: 'text must not be empty' }.to_json if text.empty?

  voice = body['voice'] || 'es-ES-AlvaroNeural'
  rate  = body['rate']  || '+0%'

  begin
    audio, _ = run_tts(text, voice: voice, rate: rate)
    content_type 'audio/mpeg'
    audio
  rescue => e
    halt 500, { error: e.message }.to_json
  end
end

post '/tts/sync' do
  body = JSON.parse(request.body.read) rescue {}
  text = (body['text'] || '').strip
  halt 400, { error: 'text must not be empty' }.to_json if text.empty?

  voice = body['voice'] || 'es-ES-AlvaroNeural'
  rate  = body['rate']  || '+0%'

  begin
    audio, subs = run_tts(text, voice: voice, rate: rate)
    sentences = parse_vtt(subs)

    content_type :json
    {
      audio: Base64.strict_encode64(audio),
      mime: 'audio/mpeg',
      sentences: sentences,
      total_duration: sentences.any? ? sentences.last[:end] : 0
    }.to_json
  rescue => e
    halt 500, { error: e.message }.to_json
  end
end

post '/extract' do
  body = JSON.parse(request.body.read) rescue {}
  url = (body['url'] || '').strip
  halt 400, { error: 'url required' }.to_json if url.empty?

  voice = body['voice'] || 'es-ES-AlvaroNeural'
  rate  = body['rate']  || '+0%'

  begin
    # Extract text from URL using trafilatura CLI
    out, err, status = Open3.capture3(TRAFILATURA, '--url', url)
    halt 502, { error: "extraction failed: #{err}" }.to_json unless status.success?
    text = out.strip
    halt 400, { error: 'no text extracted' }.to_json if text.empty?

    audio, _ = run_tts(text, voice: voice, rate: rate)
    content_type 'audio/mpeg'
    audio
  rescue => e
    halt 500, { error: e.message }.to_json
  end
end
