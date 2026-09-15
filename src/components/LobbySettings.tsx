import React, { useState } from "react";

type LobbySettingsProps = {
    isHost: boolean;
    playerCount: number;
    onStartGame: (settings: {
        rounds: number;
        drawTime: number;
        wordCount: number;
        customWords: string[];
    }) => void;
};

const LobbySettings: React.FC<LobbySettingsProps> = ({ isHost, playerCount, onStartGame }) => {
    const [rounds, setRounds] = useState(3);
    const [drawTime, setDrawTime] = useState(60);
    const [wordCount, setWordCount] = useState(3);
    const [customWordsText, setCustomWordsText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleStart = () => {
        if (playerCount < 2) return;
        setIsSubmitting(true);
        const customWords = customWordsText
            .split(/[\n,]+/)
            .map((w) => w.trim())
            .filter((w) => w.length > 0);

        onStartGame({
            rounds,
            drawTime,
            wordCount,
            customWords,
        });

        // Safety timeout so button doesn't permanently freeze if server rejects
        setTimeout(() => setIsSubmitting(false), 2000);
    };

    if (!isHost) {
        return (
            <div className="flex flex-col items-center justify-center p-6 bg-[rgba(30,95,210,0.92)] text-white rounded-xl shadow-2xl text-center space-y-4 border border-white/20">
                <img src="/logo.gif" className="h-12" alt="Sketch Guess" />
                <div className="space-y-1">
                    <h3 className="text-xl font-bold">Waiting for Host...</h3>
                    <p className="text-sm text-blue-100">
                        The room host is configuring the game settings.
                    </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 rounded-full text-xs text-white">
                    <span className="size-2 rounded-full bg-green-400 animate-pulse" />
                    <span>{playerCount} {playerCount === 1 ? "player" : "players"} connected</span>
                </div>
                <p className="text-xs text-blue-200 italic">
                    Tip: You can freely doodle on the canvas while waiting!
                </p>
            </div>
        );
    }

    return (
        <div className="bg-[rgba(30,95,210,0.95)] text-white p-5 rounded-xl shadow-2xl max-w-md w-full mx-auto space-y-4 border border-white/20 backdrop-blur-xs">
            <div className="flex items-center justify-between border-b border-white/20 pb-2">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <img src="/room/settings.gif" className="size-6" alt="" />
                    Game Settings
                </h3>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                    {playerCount} {playerCount === 1 ? "player" : "players"}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
                {/* Rounds */}
                <div className="flex flex-col gap-1">
                    <label className="font-semibold text-xs text-blue-100">Rounds</label>
                    <select
                        value={rounds}
                        onChange={(e) => setRounds(Number(e.target.value))}
                        className="bg-white text-black p-1.5 rounded outline-none font-medium cursor-pointer"
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
                            <option key={r} value={r}>
                                {r} {r === 1 ? "Round" : "Rounds"}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Draw Time */}
                <div className="flex flex-col gap-1">
                    <label className="font-semibold text-xs text-blue-100">Draw Time (seconds)</label>
                    <select
                        value={drawTime}
                        onChange={(e) => setDrawTime(Number(e.target.value))}
                        className="bg-white text-black p-1.5 rounded outline-none font-medium cursor-pointer"
                    >
                        {[30, 45, 60, 75, 80, 90, 120, 150, 180].map((t) => (
                            <option key={t} value={t}>
                                {t}s
                            </option>
                        ))}
                    </select>
                </div>

                {/* Word Count */}
                <div className="col-span-2 flex flex-col gap-1">
                    <label className="font-semibold text-xs text-blue-100">Word Choices for Drawer</label>
                    <select
                        value={wordCount}
                        onChange={(e) => setWordCount(Number(e.target.value))}
                        className="bg-white text-black p-1.5 rounded outline-none font-medium cursor-pointer"
                    >
                        {[2, 3, 4, 5].map((count) => (
                            <option key={count} value={count}>
                                {count} Words
                            </option>
                        ))}
                    </select>
                </div>

                {/* Custom Words */}
                <div className="col-span-2 flex flex-col gap-1">
                    <label className="font-semibold text-xs text-blue-100">
                        Custom Words <span className="text-[10px] text-blue-200 font-normal">(Optional, comma or line separated)</span>
                    </label>
                    <textarea
                        rows={2}
                        value={customWordsText}
                        onChange={(e) => setCustomWordsText(e.target.value)}
                        placeholder="e.g. pikachu, iron man, taj mahal"
                        className="bg-white text-black p-1.5 rounded text-xs outline-none resize-none"
                    />
                </div>
            </div>

            <button
                type="button"
                disabled={isSubmitting || playerCount < 2}
                onClick={handleStart}
                className="w-full bg-green-500 hover:bg-green-600 active:scale-[0.98] transition text-white font-bold py-2.5 rounded cursor-pointer text-base shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting 
                    ? "Starting..." 
                    : playerCount < 2 
                        ? "Need at least 2 players to start" 
                        : "🎮 Start Game"}
            </button>
        </div>
    );
};

export default LobbySettings;
