#!/usr/bin/env ruby
# frozen_string_literal: true
# zenTTS Server — Ruby/Sinatra REST API for edge-tts

require 'sinatra'
require 'json'
require 'base64'
require 'open3'
require 'tempfile'
require 'fileutils'
require 'net/http'

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
PYTHON = ENV.fetch('PYTHON', 'python3').freeze
EDGE_WORDS = File.join(__dir__, 'edge_words.py').freeze
TRAFILATURA = ENV.fetch('TRAFILATURA_PATH', 'trafilatura').freeze

# ── Helpers ──

def run_tts(text, voice: 'es-ES-AlvaroNeural', rate: '+0%')
  tmp_text  = Tempfile.new(['tts-text', '.txt'])
  tmp_audio = Tempfile.new(['tts', '.mp3'])
  tmp_subs  = Tempfile.new(['tts', '.vtt'])
  begin
    tmp_text.write(text)
    tmp_text.close
    cmd = [EDGE_TTS, '--voice', voice, '--rate', rate,
           '--file', tmp_text.path,
           '--write-media', tmp_audio.path,
           '--write-subtitles', tmp_subs.path]
    _out, err, status = Open3.capture3(*cmd)
    raise "edge-tts failed: #{err}" unless status.success?

    audio = File.binread(tmp_audio.path)
    subs  = File.read(tmp_subs.path) rescue ''
    [audio, subs]
  ensure
    tmp_text.close!
    tmp_audio.close!
    tmp_subs.close!
  end
end

# Like run_tts, but with a timestamp for every word (via edge_words.py).
# Returns [audio, words] or nil when the edge_tts Python module is unavailable.
def run_tts_words(text, voice:, rate:)
  tmp_text  = Tempfile.new(['tts-text', '.txt'])
  tmp_audio = Tempfile.new(['tts', '.mp3'])
  begin
    tmp_text.write(text)
    tmp_text.close
    out, _err, status = Open3.capture3(PYTHON, EDGE_WORDS, voice, rate, tmp_text.path, tmp_audio.path)
    return nil unless status.success?

    [File.binread(tmp_audio.path), JSON.parse(out)]
  rescue JSON::ParserError, SystemCallError
    nil
  ensure
    tmp_text.close!
    tmp_audio.close!
  end
end

def parse_vtt(vtt)
  sentences = []
  # WebVTT uses comma as millisecond separator: 00:00:00,050
  # Cues may have an optional numeric identifier line
  vtt.scan(/(?:^\d+\n)?(\d{2}:\d{2}:\d{2}[.,]\d{3}) --> (\d{2}:\d{2}:\d{2}[.,]\d{3})\n(.+?)(?=\n\n|\z)/m) do
    start = parse_timestamp(Regexp.last_match(1))
    endt  = parse_timestamp(Regexp.last_match(2))
    text  = Regexp.last_match(3).gsub(/<[^>]+>/, '').strip
    sentences << { text: text, start: start, end: endt } unless text.empty?
  end
  sentences
end

def parse_timestamp(ts)
  ts = ts.tr(',', '.')
  h, m, s = ts.split(':').map(&:to_f)
  (h * 3600 + m * 60 + s).round(3)
end

def parse_voice_table(output)
  lines = output.lines
  # Skip header and separator lines (first two)
  lines.drop(2).filter_map do |line|
    cols = line.strip.split(/\s{2,}/)
    next if cols.size < 2
    name = cols[0]
    locale = name.split('-').first(2).join('-')
    {
      name: name,
      locale: locale,
      gender: cols[1] || '',
      friendly: name
    }
  end
end

# ── Routes ──

get '/' do
  content_type :json
  {
    name: 'zenTTS',
    version: '0.5.0',
    endpoints: {
      '/health' => 'GET — health check',
      '/voices?locale=es-' => 'GET — list voices (all when no locale)',
      '/tts' => 'POST {text, voice?, rate?} — MP3 audio',
      '/tts/sync' => 'POST {text, voice?, rate?, words?} — audio + sentence or word timing',
      '/extract' => 'POST {url, voice?, rate?} — extract + TTS',
      '/translate' => 'POST {texts[], from?, to?} — translate paragraphs'
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

  # edge-tts CLI outputs a formatted table, not JSON
  voices = parse_voice_table(out)

  voices.select! { |v| v[:locale].start_with?(locale) } if locale && !locale.empty?
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
    # Word timings when asked for; falls back to the CLI's sentence subtitles
    if body['words'] && (result = run_tts_words(text, voice: voice, rate: rate))
      audio, words = result
      sentences = []
    else
      audio, subs = run_tts(text, voice: voice, rate: rate)
      sentences = parse_vtt(subs)
      words = []
    end
    last = (sentences.last || words.last)

    content_type :json
    {
      audio: Base64.strict_encode64(audio),
      mime: 'audio/mpeg',
      sentences: sentences,
      words: words,
      total_duration: last ? (last[:end] || last['end']) : 0
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
    out, err, status = Open3.capture3(TRAFILATURA, '-u', url)
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

# Google's free endpoint rejects long queries, so paragraphs are sent in
# batches that stay under this size and never split a paragraph.
TRANSLATE_BATCH = 1800
BATCH_SEPARATOR = "\n\n"

def google_translate(text, from, to)
  uri = URI("https://translate.googleapis.com/translate_a/single?client=gtx&sl=#{from}&tl=#{to}&dt=t&q=#{URI.encode_www_form_component(text)}")
  parsed = JSON.parse(Net::HTTP.get(uri))
  parsed[0].map { |s| s[0] }.join
end

# Splits one long paragraph at sentence ends so each piece fits a request
def split_long(text)
  return [text] if text.length <= TRANSLATE_BATCH
  text.scan(/[^.!?…]+[.!?…]*\s*/).each_with_object(['']) do |sentence, parts|
    parts << '' if parts.last.length + sentence.length > TRANSLATE_BATCH && !parts.last.empty?
    parts.last << sentence
  end
end

def translate_paragraphs(texts, from, to)
  batches = texts.each_with_index.each_with_object([[]]) do |(text, i), acc|
    size = acc.last.sum { |j| texts[j].length + BATCH_SEPARATOR.length }
    acc << [] if !acc.last.empty? && size + text.length > TRANSLATE_BATCH
    acc.last << i
  end

  result = Array.new(texts.size)
  batches.each do |batch|
    next if batch.empty?
    if batch.size > 1
      parts = google_translate(batch.map { |i| texts[i] }.join(BATCH_SEPARATOR), from, to)
              .split(/\n\s*\n/)
      if parts.size == batch.size
        batch.each_with_index { |i, k| result[i] = parts[k].strip }
        next
      end
    end
    # One by one when the batch did not come back with the same paragraph count
    batch.each do |i|
      result[i] = split_long(texts[i]).map { |piece| google_translate(piece, from, to) }.join(' ').strip
    end
  end
  result
end

post '/translate' do
  body = JSON.parse(request.body.read) rescue {}
  texts = Array(body['texts'] || body['text']).map { |t| t.to_s.strip }
  halt 400, { error: 'texts required' }.to_json if texts.all?(&:empty?)

  from = body['from'] || 'auto'
  to   = body['to']   || 'es'

  content_type :json
  { texts: translate_paragraphs(texts, from, to), from: from, to: to }.to_json
rescue => e
  halt 500, { error: e.message }.to_json
end
