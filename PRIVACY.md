# Privacy Policy for zenTTS

**Last updated: October 2026**

## Summary

zenTTS has no accounts, no analytics, no telemetry, no cookies and no
fingerprinting. Nothing is ever sent to the author, and nothing is sold or
shared for advertising.

zenTTS is not, however, entirely offline in every mode. Two optional features
send the text you are reading to a third party, and several features download
files from public servers. Exactly what leaves your machine, and when, is
listed below.

## What zenTTS stores on your machine

All of this is kept locally, in `browser.storage.local` and the
origin-private file system. None of it is transmitted anywhere.

| Data | Purpose |
|---|---|
| Voice, engine, speed, languages, panel position, accent, theme | Remember your preferences |
| List of sites where the panel opens automatically | Your per-site choices |
| Reading progress — the sentence or page you stopped at | Resume where you left off |
| Library entries: title, author, cover, tags, and for web works the page URL, title and host | Show your shelf and resume the right chapter |
| Downloaded voice and translation model files | Offline reading and translation |

You can stop web works from being remembered with the **Remember web works**
switch in the library; the PDF and web shelves can also be cleared from there.

## What leaves your machine

### 1. Neural voices — text goes to Microsoft

The neural engine is **optional and off by default**. When you choose it,
zenTTS sends the sentences being read to a local server you install and run
yourself at `http://localhost:8765`. That server uses the `edge-tts` tool,
which sends the text to **Microsoft's Edge text-to-speech service** to produce
the audio.

If you do not want the text of what you read to reach Microsoft, use the
**Native** engine (your browser's own voices) or the **Offline** engine
(Piper), which never send text anywhere.

### 2. Online translation — text goes to Google

Translation has an **online** mode, which is **not** the default. In that mode
the same local server sends the text to be translated to
**Google Translate** (`translate.googleapis.com`).

The **offline** translation mode runs entirely on your machine and sends no
text anywhere; it only downloads model packs once, as described below.

### 3. File downloads

These requests fetch files. They carry no page content and no personal data.

| Host | What is downloaded |
|---|---|
| `huggingface.co`, `*.hf.co` | Piper voice models, for the offline engine |
| `storage.googleapis.com` | Mozilla's public Firefox Translations model packs |

### 4. Book details lookup — optional, on request

Only when you press **Look up details** for a book in the library, and only
after you grant access the first time, zenTTS sends that book's title, or its
ISBN, to the public catalogues below to fetch its metadata and cover.

`openlibrary.org`, `covers.openlibrary.org`, `www.googleapis.com`,
`books.google.com`, `graphql.anilist.co`, `s4.anilist.co`, `api.jikan.moe`,
`cdn.myanimelist.net`

No page content, browsing history or personal data is sent — only the book
title or ISBN you are looking up.

## Permissions

| Permission | Why it is needed |
|---|---|
| `activeTab` | Read the text of the current tab, after you press the zenTTS button |
| `storage` | Save your preferences, reading progress and library |
| `unlimitedStorage` | Hold offline voice and translation models, which are large |
| Content script on `<all_urls>` | zenTTS must be able to read whichever page you are on. It stays dormant until you press the button or shortcut, or on sites you added yourself |
| `http://localhost:8765/*` | Talk to the optional local server, for neural voices and online translation |
| `https://huggingface.co/*`, `https://*.hf.co/*` | Download Piper voice models |
| `https://storage.googleapis.com/*` | Download Firefox Translations model packs |
| Optional host access | Requested only when you use the book details lookup |

## What zenTTS never does

- No analytics, telemetry, cookies or fingerprinting
- No account, no sign-in, no identifier of any kind
- Nothing is sent to the author of zenTTS
- No data is sold or transferred to third parties beyond the uses described above
- No data is used for creditworthiness or lending

## Contact

GitHub: [github.com/JoVi-Yashi/zenTTs](https://github.com/JoVi-Yashi/zenTTs)
Issues: [github.com/JoVi-Yashi/zenTTs/issues](https://github.com/JoVi-Yashi/zenTTs/issues)

---

## Política de Privacidad de zenTTS

**Última actualización: octubre de 2026**

## Resumen

zenTTS no tiene cuentas, analíticas, telemetría, cookies ni fingerprinting.
Nunca se envía nada al autor, y no se venden ni se comparten datos con fines
publicitarios.

Sin embargo, zenTTS no funciona totalmente sin conexión en todos sus modos.
Dos funciones opcionales envían el texto que lees a un tercero, y otras
descargan archivos de servidores públicos. A continuación se detalla con
precisión qué sale de tu equipo y cuándo.

## Qué guarda zenTTS en tu equipo

Todo esto se conserva localmente, en `browser.storage.local` y en el sistema
de archivos privado del origen. Nada de esto se transmite.

| Dato | Propósito |
|---|---|
| Voz, motor, velocidad, idiomas, posición del panel, acento, tema | Recordar tus preferencias |
| Lista de sitios donde el panel se abre solo | Tus decisiones por sitio |
| Progreso de lectura: la frase o página donde te quedaste | Retomar donde lo dejaste |
| Entradas de la biblioteca: título, autor, portada, etiquetas y, para obras web, la URL, el título y el dominio de la página | Mostrar tu estantería y retomar el capítulo correcto |
| Archivos de modelos de voz y traducción descargados | Lectura y traducción sin conexión |

Podés impedir que se recuerden las obras web con el interruptor **Recordar
obras web** en la biblioteca; desde ahí también podés vaciar las estanterías
de PDF y web.

## Qué sale de tu equipo

### 1. Voces neurales: el texto va a Microsoft

El motor neural es **opcional y está desactivado por defecto**. Cuando lo
elegís, zenTTS envía las frases que se están leyendo a un servidor local que
instalás y ejecutás vos mismo en `http://localhost:8765`. Ese servidor usa la
herramienta `edge-tts`, que envía el texto al **servicio de texto a voz de
Microsoft Edge** para generar el audio.

Si no querés que el texto de lo que leés llegue a Microsoft, usá el motor
**Nativo** (las voces del navegador) o el **Offline** (Piper), que nunca
envían texto a ningún lado.

### 2. Traducción en línea: el texto va a Google

La traducción tiene un modo **en línea**, que **no** es el predeterminado. En
ese modo, el mismo servidor local envía el texto a traducir a **Google
Translate** (`translate.googleapis.com`).

El modo de traducción **sin conexión** se ejecuta por completo en tu equipo y
no envía ningún texto; solo descarga los paquetes de modelos una vez, como se
describe abajo.

### 3. Descargas de archivos

Estas peticiones descargan archivos. No llevan contenido de páginas ni datos
personales.

| Servidor | Qué se descarga |
|---|---|
| `huggingface.co`, `*.hf.co` | Modelos de voz Piper, para el motor sin conexión |
| `storage.googleapis.com` | Paquetes públicos de modelos de Firefox Translations, de Mozilla |

### 4. Búsqueda de datos del libro: opcional y a pedido

Solo cuando pulsás **Buscar datos** para un libro de la biblioteca, y solo
después de que concedas el acceso la primera vez, zenTTS envía el título de
ese libro, o su ISBN, a los catálogos públicos siguientes para obtener sus
datos y su portada.

`openlibrary.org`, `covers.openlibrary.org`, `www.googleapis.com`,
`books.google.com`, `graphql.anilist.co`, `s4.anilist.co`, `api.jikan.moe`,
`cdn.myanimelist.net`

No se envía contenido de páginas, historial ni datos personales: solo el
título o el ISBN que estás buscando.

## Permisos

| Permiso | Por qué hace falta |
|---|---|
| `activeTab` | Leer el texto de la pestaña actual, después de que pulses el botón de zenTTS |
| `storage` | Guardar tus preferencias, el progreso de lectura y la biblioteca |
| `unlimitedStorage` | Albergar los modelos de voz y traducción sin conexión, que son grandes |
| Content script en `<all_urls>` | zenTTS tiene que poder leer la página en la que estés. Permanece inactivo hasta que pulsás el botón o el atajo, o en los sitios que agregaste vos |
| `http://localhost:8765/*` | Hablar con el servidor local opcional, para voces neurales y traducción en línea |
| `https://huggingface.co/*`, `https://*.hf.co/*` | Descargar modelos de voz Piper |
| `https://storage.googleapis.com/*` | Descargar paquetes de Firefox Translations |
| Acceso opcional a hosts | Se pide solo cuando usás la búsqueda de datos del libro |

## Lo que zenTTS nunca hace

- Sin analíticas, telemetría, cookies ni fingerprinting
- Sin cuenta, sin inicio de sesión, sin identificador de ningún tipo
- Nunca se envía nada al autor de zenTTS
- No se venden ni se transfieren datos a terceros más allá de los usos descritos
- No se usan datos para determinar solvencia ni para actividades crediticias

## Contacto

GitHub: [github.com/JoVi-Yashi/zenTTs](https://github.com/JoVi-Yashi/zenTTs)
Issues: [github.com/JoVi-Yashi/zenTTs/issues](https://github.com/JoVi-Yashi/zenTTs/issues)
