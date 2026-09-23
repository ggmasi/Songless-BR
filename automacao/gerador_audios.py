import os
import re
import yt_dlp
import csv

def gerar_nome_arquivo(nome_musica):
    nome_limpo = re.sub(r'[^\w\s-]', '', nome_musica).strip().lower()
    return re.sub(r'[-\s]+', '_', nome_limpo)   

def baixar_e_cortar_audio(musica, pasta_destino):
    nome_arquivo = gerar_nome_arquivo(musica)
    caminho_final = os.path.join(pasta_destino, f"{nome_arquivo}.ogg")

    if os.path.exists(caminho_final):
        print(f"[-] Já baixado: {nome_arquivo}.ogg")
        return

    print(f"[+] Buscando e baixando: {musica}...")

    ydl_opts = {
        'format'                    : 'bestaudio/best',
        'outtmpl'                   : os.path.join(pasta_destino, f'{nome_arquivo}.%(ext)s'),
        'noplaylist'                : True,
        'quiet'                     : True,
        'retries'                   : 5,
        'socket_timeout'            : 30,
        'external_downloader'       : 'ffmpeg',
        'external_downloader_args'   : {'ffmpeg_i': ['-ss', '00:00:00', '-t', '00:00:30']},
        'postprocessors'            : [{
                                        'key' : 'FFmpegExtractAudio',
                                        'preferredcodec' : 'vorbis',
        }],
        'postprocessor_args'       : ['-b:a', '64k'],   

        
    }


    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([f"ytsearch1:{musica} official audio"])
        print(f"    Sucesso! Salvo como {nome_arquivo}.ogg")
    except Exception as e:
        print(f"    X Erro ao processar '{musica}': {e}")


if __name__ == "__main__":
    pasta_script = os.path.dirname(os.path.abspath(__file__))
    caminho_csv = os.path.join(pasta_script, "meu_catalogo_base.csv")
    pasta_audios = os.path.join(pasta_script, "audios_recortados")

    os.makedirs(pasta_audios, exist_ok=True)

    if not os.path.exists(caminho_csv):
        print(f"Arquivo não encontrado: {caminho_csv}")
    else:
        musicas = []
        with open(caminho_csv, 'r', encoding='utf-8') as arquivo:
            leitor_csv = csv.reader(arquivo, delimiter=';')
            next(leitor_csv, None)

            for linha in leitor_csv:
                if len(linha) >= 2:
                    artista = linha[0]
                    nome_musica = linha[1]
                    musicas.append(f"{artista} - {nome_musica}")


        print(f"Iniciando o processamento de {len(musicas)} músicas...\n")

        for musica in musicas:
            baixar_e_cortar_audio(musica, pasta_audios)

        print(f"\nConcluído! Todos os áudios foram salvos em: {pasta_audios}")