# AMO Store Listing

## Name
TTS-zen

## Summary (250 chars)
Read any page aloud with a floating TTS panel. Dual engine: native SpeechSynthesis or Microsoft edge-tts neural voices. Highlights text in real time. Wattpad & AO3 support.

## Summary (Spanish)
Lee cualquier página en voz alta con un panel TTS flotante. Dos motores: SpeechSynthesis nativo o voces neurales de Microsoft edge-tts. Resalta texto en tiempo real. Soporte para Wattpad y AO3.

## Description (English)

TTS-zen injects a floating text-to-speech panel into any webpage using Shadow DOM. Click "Read" and it extracts the main content, reads it aloud, and highlights each sentence in real time — both on the page and in a synchronized pop-up.

**Dual engine — pick your voice quality:**
- **Native**: Browser SpeechSynthesis. Zero setup. Works offline.
- **Neural**: 45 Microsoft neural voices via edge-tts. Requires a local Ruby server (`ruby server.rb`).

**Features:**
- 🎯 Platform-specific extractors for Wattpad, AO3, FanFiction, and Webnovel
- 🎛️ Adjustable speed (0.5x to 3.0x), voice, and language (ES/EN)
- 📍 Sentence highlighting on the page with auto-scroll
- 📝 Synchronized text preview with adjustable typography
- 🌐 Site Manager — enable/disable per domain
- 🎨 Shadow DOM — site CSS never interferes

**No account, no cloud, no tracking.** All processing happens locally.

**Permissions:**
- `activeTab` — to extract text when you click "Read"
- `storage` — to save your voice, speed, and site preferences
- `localhost:8765` — to communicate with the optional local edge-tts server

## Description (Spanish)

TTS-zen inyecta un panel flotante de texto a voz en cualquier página web usando Shadow DOM. Haz clic en "Leer", extrae el contenido principal, lo lee en voz alta y resalta cada oración en tiempo real — tanto en la página como en un pop-up sincronizado.

**Dos motores — elige la calidad de voz:**
- **Nativo**: SpeechSynthesis del navegador. Sin configuración. Funciona sin conexión.
- **Neural**: 45 voces neurales de Microsoft vía edge-tts. Requiere un servidor Ruby local (`ruby server.rb`).

**Características:**
- 🎯 Extractores específicos para Wattpad, AO3, FanFiction y Webnovel
- 🎛️ Velocidad ajustable (0.5x a 3.0x), voz e idioma (ES/EN)
- 📍 Resaltado de oraciones en la página con desplazamiento automático
- 📝 Vista previa de texto sincronizada con tipografía ajustable
- 🌐 Site Manager — activa/desactiva por dominio
- 🎨 Shadow DOM — el CSS del sitio nunca interfiere

**Sin cuenta, sin nube, sin rastreo.** Todo el procesamiento es local.

**Permisos:**
- `activeTab` — para extraer texto al hacer clic en "Leer"
- `storage` — para guardar preferencias de voz, velocidad y sitios
- `localhost:8765` — para comunicarse con el servidor local edge-tts opcional

## Categories
- Audio
- Accessibility

## License
MIT

## Privacy Policy
https://github.com/JoVi-Yashi/zenTTs/blob/main/PRIVACY.md

## Homepage
https://github.com/JoVi-Yashi/zenTTs

## Support
https://github.com/JoVi-Yashi/zenTTs/issues
