"use client"

import { useState } from "react";
import musicas from "../data/bd_musicas.json";

interface SearchBarProps{
    onGuess: (musica: any) => void;
}

export default function SearchBar({ onGuess }: SearchBarProps){
    const [busca, setBusca] = useState("");
    const [resultados, setResultados] = useState<typeof musicas>([]);

    const handleBusca = (texto: string) =>{
        setBusca(texto);

        if(texto.length > 2){
            const textoLimpo = texto.toLowerCase();

            const filtrados = musicas.filter((musica) => {
                const nomeCompleto = `${musica.artista} - ${musica.titulo}`.toLowerCase();
                return nomeCompleto.includes(textoLimpo);
            });

            setResultados(filtrados.slice(0, 8));
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
        <div className='w-full max-w-md relative mt-8'>
            <input type="text" value={busca} onChange={(e) => handleBusca(e.target.value)} placeholder="Procure por artista ou música..." className="w-full p-4 rounded-lg bg-gray-800 text-white border-gray-700 focus:outline-none focus:border-green-500 transition-colors"/>

            {resultados.length > 0 && (
                <ul className="absolute top-full left-0 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-xl z-10">
                    {resultados.map((musica) => (
                        <li key={musica.id} onClick={()=> handleSelecionar(musica)} className="p-4 border-b border-gray-700 last:border-0 hover:bg-gray-700 cursor-pointer transition-colors">
                            <div className="font-bold text-white">{musica.titulo}</div>
                            <div className="text-sm text-gray-400">{musica.artista}</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}