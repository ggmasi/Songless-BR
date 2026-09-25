import os
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

load_dotenv()

R2_ENDPOINT = os.getenv("R2_ENDPOINT")
R2_ACCESS_KEY = os.getenv("R2_ACCESS_KEY")
R2_SECRET_KEY = os.getenv("R2_SECRET_KEY")

NOME_DO_BUCKET = "songless-br-audios"

s3 = boto3.client(
    's3',
    endpoint_url=R2_ENDPOINT,
    aws_access_key_id=R2_ACCESS_KEY,
    aws_secret_access_key=R2_SECRET_KEY,
    region_name='auto'
)

def arquivo_existe_no_r2(nome_arquivo):
    try:
        s3.head_object(Bucket=NOME_DO_BUCKET, Key=nome_arquivo)
        return True
    except ClientError:
        return False


if __name__ == '__main__':
    pasta_script = os.path.dirname(os.path.abspath(__file__))
    pasta_audios = os.path.join(pasta_script, "audios_recortados")

    arquivos = [f for f in os.listdir(pasta_audios) if f.endswith('.ogg')]

    print(f"Iniciando verificação de {len(arquivos)} arquivos para o R2...\n")

    for arquivo in arquivos:
        if arquivo_existe_no_r2(arquivo):
            print(f"[-] Já existe na nuvem: {arquivo}")
            continue

        caminho_local = os.path.join(pasta_audios, arquivo)
        print(f"[+] Fazendo upload: {arquivo}...")

        try:
            s3.upload_file(
                Filename=caminho_local,
                Bucket=NOME_DO_BUCKET,
                Key=arquivo,
                ExtraArgs={'ContentType': 'audio/ogg'}
            )

            print(f"    Sucesso!")
        except Exception as e:
            print(f"    X Erro no upload de {arquivo}: {e}")

    print("\nUpload concluído! Seus áudios estão na nuvem.")