// zenTTS — panel colors from the browser theme and the chosen accent
//
// Zen keeps its accent and workspace gradient inside the browser UI, where
// extensions cannot read them. What an extension can read is a Firefox theme
// (browser.theme.getCurrent) and light/dark mode; the accent can also be set by
// hand, e.g. by pasting the value of zen.theme.accent-color.

var probe = null;

// Any CSS color → [r, g, b] (alpha ignored), or null
export function parseColor(value) {
  if (!value || typeof value !== 'string') return null;
  if (!probe) probe = document.createElement('canvas').getContext('2d');
  probe.fillStyle = '#010203';
  probe.fillStyle = value;
  var out = probe.fillStyle;
  if (out === '#010203' && value.trim().toLowerCase() !== '#010203') return null;
  if (out[0] === '#') {
    return [1, 3, 5].map(function(i) { return parseInt(out.slice(i, i + 2), 16); });
  }
  var m = out.match(/[\d.]+/g);
  return m ? m.slice(0, 3).map(Number) : null;
}

export function toHex(rgb) {
  return '#' + rgb.map(function(v) { return Math.round(v).toString(16).padStart(2, '0'); }).join('');
}

function mix(a, b, t) {
  return a.map(function(v, i) { return v + (b[i] - v) * t; });
}

function luminance(rgb) {
  var c = rgb.map(function(v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

export function contrast(a, b) {
  var la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// Nudges the accent toward white or black until it reads on the background
export function fitAccent(accent, background) {
  var target = luminance(background) > 0.4 ? [0, 0, 0] : [255, 255, 255];
  var out = accent;
  for (var t = 0.1; contrast(out, background) < 3.2 && t <= 1; t += 0.1) out = mix(accent, target, t);
  return out;
}

// Panel tokens from a Firefox theme, or null when it has no usable colors
export function themeTokens(theme) {
  var c = (theme && theme.colors) || {};
  var sheet = parseColor(c.popup || c.toolbar || c.frame);
  var ink = parseColor(c.popup_text || c.toolbar_text || c.tab_background_text);
  if (!sheet || !ink || contrast(sheet, ink) < 3) return null;
  var paper = parseColor(c.toolbar_field) || mix(sheet, ink, 0.05);
  if (contrast(paper, ink) < 3) paper = mix(sheet, ink, 0.05);
  var dark = luminance(sheet) < 0.3;
  return {
    dark: dark,
    sheet: sheet,
    paper: paper,
    ink: ink,
    inkSoft: mix(ink, sheet, 0.35),
    rule: mix(ink, sheet, 0.8),
    accent: parseColor(c.tab_line || c.icons_attention || c.toolbar_field_border_focus)
  };
}

var TOKEN_VARS = ['--sheet', '--paper', '--ink', '--ink-soft', '--rule', '--hover', '--accent', '--mark'];

// Writes the tokens on the shadow host (they win over the :host defaults)
export function applyPanelColors(host, tokens, accentValue) {
  if (!host) return;
  TOKEN_VARS.forEach(function(v) { host.style.removeProperty(v); });

  if (tokens) {
    host.style.setProperty('--sheet', toHex(tokens.sheet));
    host.style.setProperty('--paper', toHex(tokens.paper));
    host.style.setProperty('--ink', toHex(tokens.ink));
    host.style.setProperty('--ink-soft', toHex(tokens.inkSoft));
    host.style.setProperty('--rule', toHex(tokens.rule));
    var i = tokens.ink;
    host.style.setProperty('--hover', 'rgba(' + i[0] + ',' + i[1] + ',' + i[2] + ',0.07)');
  }

  var accent = parseColor(accentValue) || (tokens && tokens.accent);
  if (!accent) return;
  // Measure against the background actually in use (theme or light/dark default)
  var panel = host.shadowRoot && host.shadowRoot.getElementById('tts-zen-panel');
  var bg = tokens ? tokens.sheet : parseColor(panel ? getComputedStyle(panel).getPropertyValue('--sheet') : '') || [251, 248, 241];
  var fitted = fitAccent(accent, bg);
  host.style.setProperty('--accent', toHex(fitted));
  host.style.setProperty('--mark', 'rgba(' + fitted.map(Math.round).join(',') + ',0.22)');
}
