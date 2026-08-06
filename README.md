<h1 align="center"><img alt="zenTTS" src="docs/ZenTTs.png" width="180"></h1>
<p align="center">Text-to-speech flotante para Zen Browser. Leé cualquier página web con un solo click.</p>
<p align="center">
    <a href="https://github.com/JoVi-Yashi/zenTTs/blob/main/LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue"></a>
    <a href="https://github.com/JoVi-Yashi/zenTTs"><img alt="GitHub stars" src="https://img.shields.io/github/stars/JoVi-Yashi/zenTTs?style=social"></a>
</p>

Un panel TTS que se inyecta en cualquier página con Shadow DOM. Extrae el texto, lo lee con SpeechSynthesis, y resalta cada oración en tiempo real — en el sitio y en un pop-up sincronizado. Sin servidores, sin dependencias externas.

Diseñado para lectores de Wattpad, AO3 y FanFiction: extractores nativos por plataforma que ignoran headers, navs y sidebars. Solo el contenido de la historia.

Construido sobre la [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API). Inspirado por Edge Read Aloud.

> [!WARNING]
> Esta extensión se carga como complemento temporal en `about:debugging`. No está publicada en addons.mozilla.org.

## Ramas

| Rama | Motor | Dependencias |
|---|---|---|
| [`main`](https://github.com/JoVi-Yashi/zenTTs) | SpeechSynthesis | **Ninguna** |
| [`feat/edge-tts-server`](https://github.com/JoVi-Yashi/zenTTs/tree/feat/edge-tts-server) | edge-tts + FastAPI | Python, uv, server local |

`main` es la versión recomendada: cero configuración, funciona apenas cargás la extensión. `feat/edge-tts-server` ofrece 45 voces neurales de Microsoft a costa de mantener un server Python local.

## Características

### Panel flotante

Shadow DOM encapsulado. El CSS del sitio jamás interfiere con la herramienta. Aparece abajo a la derecha con un botón amarillo estilo Mac para colapsarlo a un círculo flotante de 44px.

### Highlighting sincronizado

Cada oración se resalta directamente en el DOM del sitio — outline violeta + scroll automático. Al mismo tiempo, un pop-up muestra el texto completo con subrayado en la oración actual. Ambos se actualizan en tiempo real mientras el audio avanza.

<details><summary><b>Atajos del panel</b></summary>

| Botón | Acción |
|---|---|
| ▶ Leer | Extrae texto y empieza a reproducir |
| ⏸ | Pausa / reanudar |
| ⏹ | Detener |
| ◀ ▶ | Oración anterior / siguiente |
| ● | Minimizar a círculo flotante |
| 👁 | Abrir pop-up de texto extraído |
| 🌐 | Gestionar sitios (activar/desactivar) |
| ⚙ | Voz, velocidad |

</details>

### Site Manager

Activá o desactivá la herramienta por dominio. Cada sitio muestra su favicon real. Los sitios personalizados se persisten entre sesiones. Si desactivás un dominio, el panel desaparece de inmediato.

### Extractores nativos

Cada plataforma tiene su propio extractor optimizado con selectores específicos. Ignoran headers, navegación, sidebars y comentarios.

| Sitio | Selector |
|---|---|
| Wattpad | `.panel.panel-reading:not(.text-center) pre p[data-p-id]` |
| AO3 | `#chapters .userstuff` |
| FanFiction | `.storytext, #storytext` |
| Webnovel | `.cha-content, .chapter-content, .read-content` |
| Genérico | Readability.js → `<main>` → `<article>` → `body.innerText` |

### Preview tipográfico

El pop-up de texto extraído permite cambiar tipografía (Serif / Sans / Mono), tamaño (A− / A+) y espaciado. Todo se aplica en vivo.

### TTS

SpeechSynthesis nativo del navegador. El texto se divide en oraciones y se reproducen secuencialmente. Cada `SpeechSynthesisUtterance` dispara el highlight de la oración correspondiente.

Velocidad ajustable de 0.5x a 3.0x. La voz se selecciona entre las disponibles en el sistema, agrupadas por idioma.

## Instalación

### Requisitos

- [Zen Browser](https://zen-browser.app/) (Firefox-based)
- Node.js ≥ 18

### Clonar y buildear

```bash
git clone https://github.com/JoVi-Yashi/zenTTs.git
cd zenTTs
cd extension && npm install && cd ..
make build-extension
```

### Cargar en Zen

1. Abrí Zen → `about:debugging` → **Cargar complemento temporal**
2. Seleccioná `extension/manifest.json`

> [!NOTE]
> Si Zen está instalado vía Flatpak, necesita acceso al filesystem:
> ```bash
> flatpak override --user --filesystem=$HOME/Proyectos/zenTTs app.zen_browser.zen
> ```

### Server opcional (`feat/edge-tts-server`)

```bash
git checkout feat/edge-tts-server
make install-backend
./launcher.sh start
```

## Estructura

```
zenTTs/
├── extension/              # Firefox MV3 WebExtension
│   ├── manifest.json
│   ├── content.js          # Bundle esbuild (content script)
│   ├── background.js       # Event Page proxy (solo edge-tts)
│   ├── src/
│   │   ├── content.js      # Fuente: inyección, extractores, TTS
│   │   └── panel.js        # Fuente: UI del panel, modales
│   └── icons/              # PNG 16→128 + SVG
├── server/                 # FastAPI backend (solo edge-tts)
├── launcher.sh             # TUI interactiva (solo edge-tts)
├── docs/                   # GitHub Pages landing
├── Makefile
└── read.py                 # Script CLI original (preservado)
```

## Tech Stack

- **Extensión**: vanilla JS, esbuild IIFE, Firefox MV3, Shadow DOM
- **TTS**: SpeechSynthesis API (`main`) / edge-tts 7.2.8 + FastAPI (`feat/edge-tts-server`)
- **Extracción**: @mozilla/readability v0.6.0 + selectores específicos por sitio
- **Server**: Python 3.14, FastAPI, trafilatura, uv

## Licencia

MIT
