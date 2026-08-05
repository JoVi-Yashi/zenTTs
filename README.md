# 🎙️ zenTTS

> Text-to-speech flotante para Zen Browser. Leé cualquier página web con un panel elegante que se inyecta en el sitio.

## Características

- **Panel flotante** — se inyecta en cualquier página con Shadow DOM, no interfiere con el CSS del sitio
- **SpeechSynthesis nativo** — cero dependencias, funciona apenas cargás la extensión
- **Site manager** — activá/desactivá la herramienta por dominio (🌐)
- **Preview sincronizado** — popup con el texto extraído y subrayado en tiempo real (👁)
- **Highlighting en página** — resalta el párrafo actual mientras se reproduce
- **Navegación** — ◀ ▶ saltar oraciones, contador de línea
- **Personalización** — selector de voz, velocidad, tipografía en preview
- **Minimizar** — botón estilo Mac que colapsa el panel a un círculo flotante
- **Extractores por sitio** — Wattpad, AO3, FanFiction, Webnovel + genérico

## Instalación

### Requisitos
- [Zen Browser](https://zen-browser.app/) (Firefox-based)
- Node.js (solo para build)

### Setup

```bash
git clone git@github.com:JoVi-Yashi/zenTTs.git
cd zenTTs

# Buildear la extensión
cd extension && npm install && cd ..
make build-extension
```

### Cargar en Zen

1. Abrí Zen → `about:debugging` → **Cargar complemento temporal**
2. Seleccioná `extension/manifest.json`
3. ¡Listo! El panel aparece en cualquier página

> **Nota para Flatpak**: si Zen está instalado vía Flatpak, necesitás darle acceso al filesystem:
> ```bash
> flatpak override --user --filesystem=$HOME/Proyectos/zenTTs app.zen_browser.zen
> ```

## Uso

1. Navegá a cualquier página con texto
2. El panel aparece abajo a la derecha
3. **▶ Leer** — extrae el texto y lo reproduce
4. **⏸** — pausa, **⏹** — detiene
5. **◀ ▶** — saltar oraciones
6. **●** (amarillo) — minimizar a círculo flotante
7. **👁** — preview del texto con highlighting sincronizado
8. **🌐** — gestionar sitios (activar/desactivar dominios)
9. **⚙** — voz, velocidad

## Ramas

| Rama | Motor TTS | Dependencias | Calidad |
|---|---|---|---|
| [`main`](https://github.com/JoVi-Yashi/zenTTs) | SpeechSynthesis | **Ninguna** | Voces del sistema |
| [`feat/edge-tts-server`](https://github.com/JoVi-Yashi/zenTTs/tree/feat/edge-tts-server) | edge-tts + FastAPI | Python, uv, server local | Alta (45 voces neurales) |

## Estructura

```
zenTTs/
├── extension/              # Extensión Firefox MV3
│   ├── manifest.json
│   ├── content.js          # Bundle (content script)
│   ├── src/
│   │   ├── content.js      # Fuente del content script
│   │   └── panel.js        # UI del panel flotante
│   ├── panel/              # CSS/HTML de referencia
│   └── icons/              # Iconos PNG + SVG
├── Makefile
└── README.md
```

## Tech Stack

- **Extensión**: vanilla JS, esbuild, Shadow DOM, Firefox MV3 WebExtensions
- **TTS**: SpeechSynthesis API nativa del navegador
- **Extractores**: Readability.js + selectores específicos por sitio

## Licencia

MIT
