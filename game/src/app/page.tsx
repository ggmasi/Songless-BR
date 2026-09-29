"use client"

import { useState, useEffect } from "react"
import SearchBar from "../components/SearchBar"
import AudioPlayer from "../components/AudioPlayer";
import GuessGrid, {Guess} from "../components/GuessGrid";
import musicas from "../data/bd_musicas.json";

export default function Home() {
  const [musicaTeste, setMusicaTeste] = useState<any>(null);
  const [tentativas, setTentativas] = useState<Guess[]>([]);
  const [statusJogo, setStatusJogo] = useState<"jogando" | "venceu" | "perdeu">("jogando");
  const [modoAtual, setModoAtual] = useState<"diario" | "infinito">("diario");
  const [carregando, setCarregando] = useState(true);

  const getDataDeHoje = () => new Date().toDateString();

  const carregarModoDiario = () => {
    const hoje = new Date();
    const dataAtual = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime();
    const dataBase = new Date(2024, 0, 1).getTime();
    const diasPassados = Math.floor((dataAtual-dataBase)/(1000*60*60*24));

    const indiceDoDia = diasPassados%musicas.length;

    setMusicaTeste(musicas[indiceDoDia]);
    setModoAtual("diario");

    const save = localStorage.getItem("songless_save_diario");
    if(save){
      const dadosSalvos = JSON.parse(save);
      if(dadosSalvos.data === getDataDeHoje()){
        setTentativas(dadosSalvos.tentativas);
        setStatusJogo(dadosSalvos.status);
        return;
      }
    }

    setTentativas([]);
    setStatusJogo("jogando");
  }

  const carregarModoInfinito = () => {
    const indiceAleatorio = Math.floor(Math.random() * musicas.length);
    setMusicaTeste(musicas[indiceAleatorio]);
    setModoAtual("infinito");
    setTentativas([]);
    setStatusJogo("jogando");
  }

  useEffect(() => {
    carregarModoDiario();
    setCarregando(false);
  }, [])

  const salvarProgressoDiario = (novasTentativas: Guess[], novoStatus: string) =>{
    if(modoAtual === "diario"){
      localStorage.setItem("songless_save_diario", JSON.stringify({
        data: getDataDeHoje(),
        tentativas: novasTentativas,
        status: novoStatus
      }));
    }
  };

  // const sortearMusica = () => {
  //   const indiceAleatorio = Math.floor(Math.random()*musicas.length);
  //   setMusicaTeste(musicas[indiceAleatorio]);
  //   setIsModoDiario(false);
  // }

  // const jogarModoInfinito = () => {
  //   setTentativas([]);
  //   setStatusJogo("jogando");
  //   sortearMusica();
  // }

  // useEffect(() => {
  //   carregarMusicaDiaria();
  // }, []);
  
  // if (!musicaTeste) {
  //   return (
  //     <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
  //       <p className="text-xl font-bold animate-pulse text-green-400">Sorteando música...</p>
  //     </main>
  //   );
  // }

  // const jogarNovamente = () => {
  //   setTentativas([]);
  //   setStatusJogo("jogando");
  //   sortearMusica();
  // }

  const lidarComPalpite = (musicaEscolhida: any) => {
    if(statusJogo != "jogando") return;

    const acertou = musicaEscolhida.id === musicaTeste.id;
    const acertouArtista = musicaEscolhida.artista === musicaTeste.artista;
    let statusDaTentiva: Guess["status"] = "incorrect"; 
    if(acertou){
      statusDaTentiva = "correct";
    }else if(acertouArtista){
      statusDaTentiva = "partial";
    }

    const novaTentativa: Guess = {
      status: statusDaTentiva,
      text: `${musicaEscolhida.artista} - ${musicaEscolhida.titulo}`,
    };

    const novasTentativas = [...tentativas, novaTentativa];
    let novoStatus: "jogando" | "venceu" | "perdeu" = statusJogo;

    if(acertou){
      novoStatus = "venceu";
    }else if(novasTentativas.length >= 6){
      novoStatus = "perdeu";
    }

    setTentativas(novasTentativas);
    setStatusJogo(novoStatus);

    salvarProgressoDiario(novasTentativas, novoStatus);
    
  };

  const pularTentiva = () =>{
    if(statusJogo !== "jogando") return;

    const novasTentativas = [... tentativas, {status: "skipped", text: ""} as Guess];
    const novoStatus = novasTentativas.length >= 6 ? "perdeu" : "jogando";

    setTentativas(novasTentativas);
    setStatusJogo(novoStatus);
    
    salvarProgressoDiario(novasTentativas, novoStatus);
  };
  
  if (carregando || !musicaTeste) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-xl font-bold animate-pulse text-green-400">Carregando...</p>
      </main>
    );
  }


  const nomeDaFaixaTeste = musicaTeste.titulo;


  const rodadaAtual = tentativas.length;
  const linkYoutube = `https://www.youtube.com/results?search_query=${encodeURIComponent(musicaTeste.artista + " " + nomeDaFaixaTeste)}`;

  const isUltimaTentativa = rodadaAtual === 5;

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8 pt-20">
      
      <h1 className="text-4xl font-bold tracking-tight mb-4">Songless BR</h1>
      <div className="flex bg-gray-800 rounded-lg p-1 mb-6 border border-gray-700 w-full max-w-md shadow-lg">
        <button
          onClick={carregarModoDiario}
          className={`flex-1 py-2 px-4 rounded-md font-bold transition-all ${
            modoAtual === "diario" 
              ? "bg-gray-700 text-green-400 shadow-sm" 
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          🎶 Diário
        </button>
        <button
          onClick={carregarModoInfinito}
          className={`flex-1 py-2 px-4 rounded-md font-bold transition-all ${
            modoAtual === "infinito" 
              ? "bg-gray-700 text-green-400 shadow-sm" 
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          ♾️ Infinito
        </button>
      </div>

      {statusJogo === "jogando" && (
        <AudioPlayer url={musicaTeste.url_audio} attempt={rodadaAtual} isGameOver={false}/>
      )}

      
      <GuessGrid guesses={tentativas}/>
      {statusJogo === "jogando" && (
        <div className="w-full max-w-md flex items-stretch gap-2 mt-4">
          <SearchBar onGuess={lidarComPalpite} palpitesFeitos={tentativas.filter(t => t.status !== "skipped").map(t => t.text)}/>
          <button onClick={pularTentiva} className={`px-6 py-4 font-bold rounded-lg transition-all border flex-shrink-0 
            ${
                isUltimaTentativa ? "bg-red-900/30 text-red-400 border-red-900/50 hover:bg-red-800/50 hover:text-red-200"
                : "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-white"
            }`}>
            {isUltimaTentativa ? "Desistir" : "Pular"}
          </button>
        </div>
      )} 
      {statusJogo !== "jogando" && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-md w-full flex flex-col items-center text-center shadow-2xl">
            <h2 className={`text-3xl font-bold mb-2 ${statusJogo === "venceu" ? "text-green-400" : "text-red-400"}`}>
              {statusJogo === "venceu" ? "Você acertou!" : "Fim de jogo!"}
            </h2>

            <p className="text-gray-300 mb-6">
              A música era: <br/>
              <strong className="text-white text-2xl mt-1 block">
                {musicaTeste.artista} - {nomeDaFaixaTeste}
              </strong>
            </p>

            <div className="mb-6 w-full bg-gray-900 rounded-lg p-4 border border-gray-700 flex justify-between items-center px-8">
              <span className="text-gray-400 font-medium">Tentativas:</span>
              <span className="text-2xl font-bold text-white">
                {statusJogo === "venceu" ? tentativas.length : "6"} / 6
              </span>
            </div>

            <div className="w-full mb-6">
              <AudioPlayer url={musicaTeste.url_audio} attempt={6} isGameOver={true}/>
            </div>
            {modoAtual === "infinito" ? (
              <button onClick={carregarModoInfinito} className="w-full py-4 mb-3 bg-gtay-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors border border-gray-600">
                Jogar Novamente
              </button>
            ): (
              <button onClick={carregarModoInfinito} className="w-full py-4 mb-3 bg-gtay-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors border border-gray-600">
                Jogar Modo Infinito
              </button>
            )}
            

          </div>
        </div>
        
        
      )}
      
      
    </main>
  );
}