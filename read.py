#!/usr/bin/env python3
import sys
import subprocess
import trafilatura

def main():
    if len(sys.argv) < 2:
        print("Uso: python read_fanfic.py <URL> [palabra_o_frase_de_inicio]")
        sys.exit(1)

    url = sys.argv[1]
    start_phrase = sys.argv[2] if len(sys.argv) > 2 else None

    # 1. Extraer el contenido principal del fanfic
    downloaded = trafilatura.fetch_url(url)
    if not downloaded:
        print("Error: No se pudo cargar la página web.")
        sys.exit(1)

    text = trafilatura.extract(downloaded, include_comments=False, include_tables=False)

    if not text:
        print("Error: No se pudo extraer texto limpio de la página.")
        sys.exit(1)

    # 2. Si definiste un punto de inicio, recortar el texto desde ahí
    if start_phrase:
        pos = text.lower().find(start_phrase.lower())
        if pos != -1:
            text = text[pos:]
            print(f"Iniciando lectura desde: '{start_phrase}'")
        else:
            print(f"Frase '{start_phrase}' no encontrada. Leyendo desde el principio.")

    # 3. Mandar el texto recortado a edge-tts y reproductor mpv en pipeline
    # Voz por defecto: es-ES-AlvaroNeural (puedes cambiarla por es-MX-DaliaNeural o es-ES-ElviraNeural)
    edge_cmd = ["edge-tts", "--voice", "es-ES-AlvaroNeural", "--text", text]
    mpv_cmd = ["mpv", "--no-video", "-"]

    p1 = subprocess.Popen(edge_cmd, stdout=subprocess.PIPE)
    p2 = subprocess.Popen(mpv_cmd, stdin=p1.stdout)
    p1.stdout.close()
    p2.communicate()

if __name__ == "__main__":
    main()