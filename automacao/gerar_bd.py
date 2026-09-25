import os
import csv
import json
import re
from dotenv import load_dotenv

load_dotenv()

URL_BASE_R2 = os.getenv("URL_R2")

def gerar_nome_arquivo(nome_musica):
    nome_limpo = re.sub(r'[^\w\s-]', '', nome_musica).strip().lower()
    return re.sub(r'[-\s]+', '_', nome_limpo)

if __name__ == "__main__":
    pasta_script = os.path.dirname(os.path.abspath(__file__))
    caminho_csv = os.path.join(pasta_script, "meu_catalogo_base.csv")
    caminho_json = os.path.join(pasta_script, "bd_musicas.json")

    bd = []

    with open(caminho_csv, 'r', encoding='utf-8') as arquivo_csv:
        leitor = csv.reader(arquivo_csv, delimiter=';')
        next(leitor, None)

        id_contador = 1

        for linha in leitor:
            if len(linha) >= 3:
                artista = linha[0]
                titulo = linha[1]
                categoria = linha[2]

                nome_formatado = gerar_nome_arquivo(f"{artista} - {titulo}")
                url_audio = f"{URL_BASE_R2}/{nome_formatado}.ogg"

                musica_obj = {
                    "id": id_contador,
                    "artista": artista,
                    "titulo": titulo,
                    "categoria": categoria,
                    "url_audio": url_audio
                }

                bd.append(musica_obj)
                id_contador +=1

    with open(caminho_json, 'w', encoding='utf-8') as arquivo_json:
        json.dump(bd, arquivo_json, ensure_ascii=False, indent=4)


    pasta_raiz = os.path.dirname(pasta_script)
    pasta_destino_json = os.path.join(pasta_raiz, "jogo", "src", "data")
    os.makedirs(pasta_destino_json, exist_ok=True)
    caminho_json = os.path.join(pasta_destino_json, "bd_musicas.json")

    print(f"Sucesso! Banco de dados gerado com {len(bd)} músicas.")
    print(f"Arquivo salvo em: {caminho_json}")