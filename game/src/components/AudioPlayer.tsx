"use function";
"use client";

import {useState, useRef, useEffect} from "react";

interface AudioPlayerProps{
    url: string;
    attempt: number;
    isGameOver: boolean;
}

export default function AudioPlayer({ url, attempt, isGameOver = false }: AudioPlayerProps){
    const [tocando, setTocando] = useState(false);
    const [progresso, setProgresso] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const temposLiberados = [0.1, 0.5, 2, 4, 8, 15];
    const tempoMax = isGameOver ? 30 : temposLiberados[Math.min(attempt, 5)];
    const tempoTotal = isGameOver ? 30 : 15;

    useEffect(() => {
        if(audioRef.current){
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setProgresso(0);
            setTocando(false);
        }
    }, [url]);

    const togglePlay = () => {
        if(audioRef.current){
            if(tocando){
                audioRef.current.pause();
            }else{
                if(audioRef.current.currentTime >= tempoMax){
                    audioRef.current.currentTime = 0;
                    setProgresso(0);
                }
                audioRef.current.play();
            }
            setTocando(!tocando);
        }
    };

    const handleTimeUpdate = () =>{
        if(audioRef.current){
            const tempoAtual = audioRef.current.currentTime
            if(tempoAtual >= tempoMax){
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                setProgresso(0);
                setTocando(false);
            }else{
                setProgresso(tempoAtual)
            }
        }
    };

    return (
        <div className="mt-4 mb-2 flex flex-col items-center w-full max-w-md">

            {!isGameOver && (
                <div className="text-gray-400 mb-4 text-sm font-medium tracking-wide">
                    TRECHO LIBERADO: <span className="text-white font-bold">{tempoMax}s</span>
                </div>
            )}

            <div className="w-full h-4 bg-gray-800 rounded-sm relative mb-6 overflow-hidden border border-gray-700">
                <div className="absolute top-0 left-0 h-full bg-gray-600 transition-all duration-300" style={{width: `${(tempoMax/tempoTotal)*100}%`}}/>
           
                <div className="absolute top-0 left-0 h-full bg-green-500" style={{width: `${(progresso/tempoTotal)*100}%`}}/>

                {!isGameOver && temposLiberados.slice(0, 5).map((tempo, index) => (
                    <div key={index} className="absolute top-0 h-full w-px bg-gray-900 z-10" style={{left: `${(tempo/tempoTotal)*100}%`}}/>
                ))}
            </div>

            <audio ref={audioRef} src={url} onTimeUpdate={handleTimeUpdate} onEnded={() => {setTocando(false); setProgresso(0);}}/>
            <button onClick={togglePlay} className="w-16 h-16 flex items-center justify-center bg-green-500 hover:bg-green-400 text-black rounded-full transition-transform transform hover:scale-105 shadow-lg shadow-green-500/20">
                {tocando ? (
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                ) : (
                    <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                )}
            </button>
        </div>
    )
}