"use client"

import { useState, useRef } from "react";
import musicas from "../data/bd_musicas.json";

interface SearchBarProps{
    onGuess: (musica: any) => void;
    palpitesFeitos: string[];
}

const removerAcentos = (texto: string) => {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export default function SearchBar({ onGuess, palpitesFeitos }: SearchBarProps){
    const [busca, setBusca] = useState("");
    const [resultados, setResultados] = useState<typeof musicas>([]);
    const [alturaMaxima, setAlturaMaxima] = useState("240px");

    const searchRef = useRef<HTMLDivElement>(null);

    const handleBusca = (texto: string) =>{
        setBusca(texto);

        if(searchRef.current){
            const caixa = searchRef.current.getBoundingClientRect();
            const espacoAbaixo = window.innerHeight-caixa.bottom-20;
            setAlturaMaxima(`${Math.max(espacoAbaixo, 120)}px`);
        }

        if(texto.length > 2){
            const textoLimpo = removerAcentos(texto.toLowerCase());

            const filtrados = musicas.filter((musica) => {
                const nomeFaixa = musica.titulo || "";
                const nomeOriginal = `${musica.artista} - ${nomeFaixa}`;
                if(palpitesFeitos.includes(nomeOriginal)) return false;
                
                const nomeCompleto = removerAcentos(nomeOriginal.toLowerCase());
                return nomeCompleto.includes(textoLimpo);
            });

            setResultados(filtrados.slice(0, 40));
        }else{
            setResultados([]);
        }
    };

    const handleSelecionar = (musica: any) => {
        onGuess(musica)
        setBusca("");
        setResultados([]);
    };

    return (
        <div className="w-full relative z-20" ref={searchRef}>
            <input type="text" value={busca} onChange={(e) => handleBusca(e.target.value)} placeholder="Procure por artista ou música..." className="w-full p-4 rounded-lg bg-gray-800 text-white border-gray-700 focus:outline-none focus:border-green-500 transition-colors"/>

            {resultados.length > 0 && (
                <ul className="absolute top-full mt-2 left-0 w-full overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 custom-scrollbar" style={{ maxHeight: alturaMaxima }}>
                        {resultados.map((musica: any, index: number) => {
                        const nomeFaixa = musica.titulo || "Música Desconhecida";
                        return(
                            <li key={musica.url_audio || index} onClick={()=> handleSelecionar(musica)} className="p-4 border-b border-gray-700 last:border-0 hover:bg-gray-700 cursor-pointer transition-colors">
                                <div className="font-bold text-white">{nomeFaixa}</div>
                                <div className="text-sm text-gray-400">{musica.artista}</div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}