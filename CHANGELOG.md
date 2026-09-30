# Changelog

## 1.0.0 — 2026-09-30

Primera versión estable. / First stable release.

### Nuevo
- **Botón de la barra:** el panel ya no aparece solo. El botón de zenTTS (o `Alt+Mayús+Z`) lo muestra u oculta en la pestaña, con un punto en el botón mientras está activo. Persiste al recargar y al pasar de capítulo. Opción "Abrir siempre en este sitio".
- **Lector de PDF** con pdf.js: páginas renderizadas, frase y palabra marcadas, sin encabezados ni números de página, continuar donde lo dejaste. PDF locales: se sueltan o eligen una vez.
- **Detección de idioma y traducción** sin conexión (Firefox Translations) o en línea, progresiva, con la frase traducida bajo el párrafo original. Ajuste "Traducir con" y elecciones recordadas por idioma.
- **Voces Local (Piper)** agrupadas por calidad, con descripción y aviso si una voz va más lenta que la lectura en tu equipo. Nueva voz `es_AR-daniela-high`.
- **Ajustes en pestañas** (Voz, Lectura, Traducir, Aspecto), tooltips propios y descargas que se llenan en el botón.
- **Burbuja** que se arrastra a cualquier esquina, con un fantasma del destino y animación suave; el panel se orienta hacia su esquina.
- **Empezar donde elijas** con el botón de la mira.

### Mejoras
- Piper: precarga del modelo, frases largas en trozos, más audio generado por delante; la traducción sin conexión cede la CPU a la voz.
- Cambiar de voz o motor a mitad de lectura reinicia la frase con la voz nueva.
- Motor del navegador: Pausa funciona aunque speech-dispatcher ignore `pause()`.
- "Sitios" pasa a "Sitios compatibles": presets de extracción y la lista de sitios que se abren solos.
- Página del proyecto renovada.

### Arreglos
- La frase traducida ya no se superpone a "Texto extraído" ni a "Sitios".
- La burbuja soltada en el centro de la pantalla ya no desaparece.
- El aviso de traducción ya no se queda en 100 %.
- Solo aparecían voces Piper en inglés al leer una página inglesa traducida.

## 0.5.0
- Resaltado de oración y palabra, capítulo siguiente en la misma página, continuar donde lo dejaste, voz Local (Piper), temas del navegador.
