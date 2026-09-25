export type GuessStatus = "empty" | "skipped" | "incorrect" | "correct";

export interface Guess{
    status: GuessStatus;
    text: string;
}

interface GuessGridProps{
    guesses: Guess[];
}

export default function GuessGrid({guesses} : GuessGridProps){
    const totalAttempts = 6;

    const displayGuesses = [...guesses];

    while(displayGuesses.length < totalAttempts){
        displayGuesses.push({status: "empty", text: ""});
    }

    return(
        <div className="w-full max-w-md mt-6 mb-4 flex flex-col gap-2">
            {displayGuesses.map((guess, index) =>{
                let bgColor = "bg-gray-900";
                let borderColor = "border-gray-700";
                let textColor = "text-white";

                if(guess.status === "skipped"){
                    bgColor = "bg-gray-700";
                    borderColor = "border-gray-600";
                    textColor = "text-gray-400 font-semibold tracking-widest";
                }else if(guess.status === "incorrect"){
                    bgColor = "bg-red-900/30";
                    borderColor = "border-red-500/50";
                    textColor = "text-red-200 line-through";
                } else if (guess.status === "correct") {
                    bgColor = "bg-green-900/30";
                    borderColor = "border-green-500";
                    textColor = "text-green-400 font-bold";
                }

                return(
                    <div key={index} className={`w-full h-12 flex items-center px-4 border ${bgColor} ${borderColor} ${textColor} rounded-md transition-colors`}>
                        {guess.status === "skipped" && "PULOU"}
                        {guess.status === "empty" && ""}
                        {(guess.status === "incorrect" || guess.status === "correct") && guess.text}
                    </div> 
                );
            })}
        </div>
    );
}

