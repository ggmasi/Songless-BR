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
  


  useEffect(() => {
    const indiceAleatorio = Math.floor(Math.random()*musicas.length);
    setMusicaTeste(musicas[indiceAleatorio]);
  }, []);

  if (!musicaTeste) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-xl font-bold animate-pulse text-green-400">Sorteando música...</p>
      </main>
    );
  }
  const nomeDaFaixaTeste = musicaTeste.titulo;

  const lidarComPalpite = (musicaEscolhida: any) => {
    if(statusJogo != "jogando") return;

    const acertou = musicaEscolhida.id === musicaTeste.id;
    const novaTentativa: Guess = {
      status: acertou ? "correct" : "incorrect",
      text: `${musicaEscolhida.artista} - ${musicaEscolhida.titulo}`,
    };

    const novasTentativas = [...tentativas, novaTentativa];
    setTentativas(novasTentativas);

    if(acertou){
      setStatusJogo("venceu");
    }else if(novasTentativas.length >= 6){
      setStatusJogo("perdeu");
    }
  };

  const pularTentiva = () =>{
    if(statusJogo !== "jogando") return;

    const novasTentativas = [... tentativas, {status: "skipped", text: ""} as Guess];
    setTentativas(novasTentativas);

    if(novasTentativas.length >= 6){
      setStatusJogo("perdeu");
    }
  };

  const rodadaAtual = tentativas.length;
  const linkYoutube = `https://www.youtube.com/results?search_query=${encodeURIComponent(musicaTeste.artista + " " + nomeDaFaixaTeste)}`;

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8 pt-20">
      <h1 className="text-4xl font-bold mb-2">Songless BR</h1>
      <p className="text-gray-400 text-center max-w-md">Adivinhe a música de hoje!</p>
      
      {statusJogo === "jogando" && (
        <AudioPlayer url={musicaTeste.url_audio} attempt={rodadaAtual} isGameOver={false}/>
      )}

      
      <GuessGrid guesses={tentativas}/>
      {statusJogo === "jogando" && (
        <div className="w-full max-w-md flex gap-2 mt-4">
          <SearchBar onGuess={lidarComPalpite}/>
          <button onClick={pularTentiva} className="px-6 py-4 bg-gray-700 hover:bg-gray-600 font-bold rounded-lg transition-colors border border-gray-600">
            Pular
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
          </div>
        </div>
        
        
      )}
      
      
    </main>
  );
}