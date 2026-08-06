# Privacy Policy for TTS-zen

**Last updated: August 2026**

## Data Collection

TTS-zen **does not collect, store, or transmit any personal data** to external servers.

### What happens locally

| Data | Where | Purpose |
|---|---|---|
| Page text | Browser memory only | Extracted to read aloud via TTS |
| Site preferences | `browser.storage.local` | Remember allowed/blocked sites |
| Voice & speed settings | `browser.storage.local` | Persist user preferences |
| Language preference | `browser.storage.local` | UI language (ES/EN) |

### Edge-tts server (optional)

When Neural mode is enabled, extracted text is sent to a **local server** running on `http://localhost:8765`. This server:
- Runs on your own machine
- Uses Microsoft Edge TTS to generate audio
- Does **not** send data to any third party
- Text is processed entirely on your device

### Permissions explained

| Permission | Why |
|---|---|
| `activeTab` | Extract text from the current page when you click "Read" |
| `storage` | Save your voice, speed, site, and language preferences |
| `http://localhost:8765/*` | Communicate with the optional local edge-tts server |

### No tracking

- No analytics
- No telemetry
- No cookies
- No fingerprinting
- No third-party services

## Contact

GitHub: [github.com/JoVi-Yashi/zenTTs](https://github.com/JoVi-Yashi/zenTTs)

---

## Política de Privacidad de TTS-zen

**Última actualización: agosto 2026**

### Recopilación de datos

TTS-zen **no recopila, almacena ni transmite datos personales** a servidores externos.

### Qué sucede localmente

| Dato | Dónde | Propósito |
|---|---|---|
| Texto de la página | Solo en memoria del navegador | Extraído para leer en voz alta |
| Preferencias de sitios | `browser.storage.local` | Recordar sitios permitidos/bloqueados |
| Voz y velocidad | `browser.storage.local` | Guardar preferencias del usuario |
| Idioma | `browser.storage.local` | Idioma de la interfaz (ES/EN) |

### Servidor edge-tts (opcional)

Cuando el modo Neural está activado, el texto extraído se envía a un **servidor local** en `http://localhost:8765`. Este servidor:
- Se ejecuta en tu propia máquina
- Usa Microsoft Edge TTS para generar audio
- **No** envía datos a terceros
- El texto se procesa completamente en tu dispositivo

### Permisos explicados

| Permiso | Motivo |
|---|---|
| `activeTab` | Extraer texto de la página actual al hacer clic en "Leer" |
| `storage` | Guardar preferencias de voz, velocidad, sitios e idioma |
| `http://localhost:8765/*` | Comunicarse con el servidor local edge-tts opcional |

### Sin rastreo

- Sin analíticas
- Sin telemetría
- Sin cookies
- Sin fingerprinting
- Sin servicios de terceros

## Contacto

GitHub: [github.com/JoVi-Yashi/zenTTs](https://github.com/JoVi-Yashi/zenTTs)
