# Changelog

## 1.1.0 — 2026-09-30

### Arreglos
- **Estantería sin parpadeo:** al pasar el ratón por el borde de un libro, este ya no entra y sale del hover sin parar. Su caja no se mueve (los vecinos se apartan con transformaciones), las caras 3D no reciben el puntero y el libro se levanta tras una breve intención. Al recargar la estantería solo se animan los libros nuevos.
- **Libros que se montaban en una balda llena:** cada libro se ve ahora de frente (perspectiva propia) y en reposo solo muestra el lomo; antes los de la derecha enseñaban su tapa encima del vecino. Al levantar uno, los vecinos se apartan sin salirse del mueble.
- **Misma portada en todos los volúmenes:** al buscar datos de una saga, la portada de la serie (la del vol. 1, de AniList o MyAnimeList) acababa en cada tomo. Ahora la búsqueda lleva siempre el volumen ("Vol N", "Volume N"), la relevancia premia el volumen exacto y castiga otro, y esa portada, la de otro volumen o la que ya usa otro tomo no se toman por defecto: la vista previa avisa y ofrece una galería (portadas de ese tomo, página 1 del PDF y el resto). Cada libro recuerda de dónde vino su portada. El nombre reconoce también `Tom`, `Tome`, `Band` y `#N`.
- **Búsqueda sin resultados:** ya no salta sola a "Escribir a mano" (y al volver no buscaba otra vez para saltar de nuevo). Se queda en Resultados con el aviso y un botón "Escribir a mano"; lo escrito en "Otra búsqueda" y los resultados se conservan al cambiar de pestaña.
- **Acabado mate:** lomos y tapas sin brillo de plástico, con sombras suaves y un grano de tela y papel.

### Nuevo
- **Añadir varios PDF a la vez** (o soltarlos sobre la estantería), con progreso y resumen. Los repetidos se detectan por su contenido (SHA-256), no se duplican y se resalta el que ya estaba; un PDF abierto antes en el lector tampoco se duplica al añadirlo.
- **Datos del libro:** se ofrece al añadir PDF ("Revisar datos") y desde la ficha ("Buscar datos…"); los permisos se piden solo al usarlo.
  - El nombre se limpia (etiquetas, formato, fuentes) y se separan la serie, el volumen y el capítulo.
  - Búsqueda por pasos: ISBN → serie y volumen (en tu idioma y en cualquiera) → palabras clave → AniList y MyAnimeList para novelas ligeras, manga y webnovels.
  - Las 4 coincidencias más relevantes, con fuente e idioma de la edición, y "Ver más resultados".
  - **Vista previa campo por campo** antes de aplicar: eliges qué tomar (título, autor, año, editorial, ISBN, portada).
  - **Escribir a mano**, con portada desde una URL o una imagen, y un botón para buscar portadas en la web.
- **Idioma de los datos:** ajuste en ⚙ (por defecto, el idioma del libro, detectado al añadirlo). Una edición en otro idioma no renombra tu libro: su título, autor e ISBN solo vienen marcados si le faltan al tuyo.
- **Serie y volumen:** se guardan aparte del título y deciden el orden "Título y serie" (orden numérico de volúmenes). Los datos de internet nunca los cambian; se editan en la ficha.
- **Biblioteca PDF / Web:** selector arriba a la derecha. La vista Web muestra las obras que zenTTS te ha leído en páginas web, una balda por sitio, con su capítulo y "Seguir leyendo". Se puede desactivar ("Recordar lo que leo en la web").
- Página y READMEs con la biblioteca.
- **Logos de los sitios:** AO3, FanFiction.net, Wattpad y Webnovel llevan su logo en el panel (Sitios compatibles), en la biblioteca y en la página, en lugar de una letra genérica.

## 1.0.1 — 2026-09-30

### Arreglos
- **PDF en la versión publicada:** el lector se abre ahora en una pestaña nueva junto al PDF. Firefox no deja cargar una página de la extensión navegando la propia pestaña del PDF (local o web) y mostraba "Archivo no encontrado".
- **Subtítulo de traducción:** fijo a la pantalla y anclado al párrafo que se lee; sigue el scroll (también el de contenedores internos, como en Webnovel) y los cambios de tamaño, y se oculta si el párrafo sale de la vista.
- **Webnovel:** al terminar un capítulo pasa al siguiente: si ya está en la página lo lee; si no, provoca la carga del scroll infinito y espera; si hay un enlace o botón "Siguiente", lo sigue y la lectura continúa. Avisa si el capítulo está bloqueado.
- Los números como "2.1" ya no cortan una frase.

### Nuevo
- **Biblioteca de PDF:** estantería 3D con los PDF que abres (portada generada, lomo con color y grosor según páginas, página en la que te quedaste). Al pasar el ratón el libro sale y gira hacia ti; al elegirlo pasa al centro y gira mostrando portada y contraportada, con la estantería desenfocada detrás. Portadas propias, color del lomo, etiquetas como sub-bibliotecas, estilos de madera, orden y tamaño. Guarda una copia del PDF para abrir los locales sin volver a elegirlos.
- **Índice del PDF:** el índice real del documento (con subniveles) en un panel lateral; lleva a cada sección y, si está leyendo, la lectura salta ahí. Marca la sección que se lee. Sin índice, se genera con los títulos.
- **El lector recuerda la página** en la que estabas y la muestra en la barra.
- **PDF a varias columnas:** se leen en orden (título, columna izquierda completa, luego la derecha).

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
