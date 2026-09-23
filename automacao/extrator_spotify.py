import os
import spotipy
import re
import csv
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv

load_dotenv()

def limpar_nome_musica(nome):
    """
    Remove sufixos indesejados como 'Ao Vivo', 'Remastered', 'Acústico', 'Bonus Track', etc.
    Só remove se estiverem após um hífen ou dentro de parênteses/colchetes.
    """
    # Padrão: Começa com (hífen OU parêntese OU colchete), tem a palavra-chave no meio, e termina com (fechamento OU fim do texto)
    padrao = r'(?:\s*-\s*|\s*[\(\[]).*?\b(ao vivo|live|remaster|ac[uú]stico|acoustic|b[oô]nus track|radio edit|mtv unplugged|vers[aã]o|version)\b.*?(?:[\)\]]|$)'
    
    # Substitui todo o bloco (ex: " - Acústico MTV" ou " (Bonus Track)") por nada
    nome_limpo = re.sub(padrao, '', nome, flags=re.IGNORECASE)
    
    # Remove espaços extras duplos que podem ter sobrado e corta as pontas
    nome_limpo = re.sub(r'\s+', ' ', nome_limpo)
    
    return nome_limpo.strip()

# 1. Coloque suas credenciais aqui (veja como obter abaixo)
CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")


def extrair_musicas_spotify(playlist_url):
    """
    Conecta na API do Spotify e extrai todas as músicas de uma playlist.
    """
    # Autenticação
    auth_manager = SpotifyOAuth(
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
        redirect_uri=REDIRECT_URI,
        scope="playlist-read-private"
    )
    sp = spotipy.Spotify(auth_manager=auth_manager)
    
    # Extrai o ID da playlist a partir da URL
    playlist_id = playlist_url.split('/')[-1].split('?')[0]
    
    musicas = []
    
    print("Conectando ao Spotify e baixando a lista...")
    
    # Faz a primeira requisição (limite de 100 músicas por vez)
    resultados = sp.playlist_tracks(playlist_id)
    faixas = resultados['items']

    print(f"O Spotify encontrou {len(faixas)} itens nesta lista.")
    
    # Loop de paginação para pegar o resto da playlist se tiver mais de 100
    while resultados['next']:
        resultados = sp.next(resultados)
        faixas.extend(resultados['items'])
        
    for item in faixas:
        track_data = item.get('track')

        if track_data is None:
            track_data = item.get('item')

        if track_data is None:
            continue

        if track_data.get('type') == 'track' and 'artists' in track_data and track_data['artists']: # Evita erros caso alguma música tenha sido removida da playlist
            nome_original = track_data.get('name', 'Desconhecido')
            nome_musica_limpo = limpar_nome_musica(nome_original)

            nome_artista = track_data['artists'][0].get('name', 'Desconhecido')
            string_final = f"{nome_artista} - {nome_musica_limpo}"

            musicas.append(string_final)

    # for item in faixas:
    #     # DEBUG: Se o item não tiver a chave 'track', imprime ele inteiro para nós vermos!
    #     if 'track' not in item:
    #         print("\n--- ESTRUTURA MISTERIOSA DO SPOTIFY ---")
    #         print(item)
    #         print("---------------------------------------\n")
    #         break # Interrompe o script no primeiro erro para não encher a tela
            
    #     track = item.get('track')

    #     if track is None:
    #         continue

    #     if track and 'artists' in track and track['artists']:
    #         nome_musica = track.get('name', 'Desconhecido')
    #         nome_artista = track['artists'][0].get('name', 'Desconhecido') 
            
    #         musicas.append(f"{nome_artista} - {nome_musica}")



            
    print(f"Sucesso! {len(musicas)} músicas extraídas.")
    return musicas

# Exemplo: URL de uma playlist gigantesca de músicas brasileiras
minhas_playlists = {
        "BR":["https://open.spotify.com/playlist/1NMXgwI87dFGPgvbNy3ie8",
            "https://open.spotify.com/playlist/1GFjF53jNeU5GDKJT3ETPg",
            "https://open.spotify.com/playlist/3st21eKo4Fsjc7roB1X1Xz",
            "https://open.spotify.com/playlist/3olPaeXTuGx6aziVOiqHa8",
            "https://open.spotify.com/playlist/2tLpew1AMhmdvYMKYI5HsE"],

        "INT":[]

    } 

if __name__ == "__main__":

    pasta_script = os.path.dirname(os.path.abspath(__file__))
    caminho_arquivo = os.path.join(pasta_script, "meu_catalogo_base.csv")

    musicas_existentes = set()

    if os.path.exists(caminho_arquivo):
        with open(caminho_arquivo, 'r', encoding='utf-8') as arquivo_leitura:
            leitor_csv = csv.reader(arquivo_leitura, delimiter=';')
            next(leitor_csv, None)
            for linha in leitor_csv:
                if len(linha) >= 2:
                    musica_identificador = f"{linha[0] - linha[1]}"
                    musicas_existentes.add(musica_identificador)

    print(f"Catálogo atual tem {len(musicas_existentes)} músicas únicas.")

    arquivo_existe = os.path.exists(caminho_arquivo)
    
    # Salva em um arquivo de texto para você revisar antes de baixar os áudios
    with open(caminho_arquivo, "a", encoding="utf-8", newline='') as arquivo_escrita:
        escritor_csv = csv.writer(arquivo_escrita, delimiter=';')

        if not arquivo_existe:
            escritor_csv.writerow(['Artista', 'Musica', 'Categoria'])

        for categoria_tag, lista_urls in minhas_playlists.items():
            for url in lista_urls:
                print(f"\n--- Extraindo playlist: {url} ---")

                try:
                    catalogo_gerado = extrair_musicas_spotify(url)
                    novasAdd = 0
                
                    for musica in catalogo_gerado:
                        if musica not in musicas_existentes:
                            partes = musica.split(" - ", 1)
                            if(len(partes) == 2):
                                artista = partes[0]
                                nome_musica = partes[1]
                                escritor_csv.writerow([artista, nome_musica, categoria_tag])

                                musicas_existentes.add(musica)
                                novasAdd += 1

                    print(f"> {novasAdd} músicas inéditas salvas no catálogo!")
                except Exception as e:
                    print(f"X Erro ao processar a playlist {url}. Pulando para a próxima...")
                    print(f"  Detalhe técnico: {e}")

            
    print("Catálogo salvo no arquivo 'meu_catalogo_base.csv'.")