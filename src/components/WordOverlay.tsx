import React from "react";

type WordOverlayProps = {
    gameState: string;
    isDrawer: boolean;
    drawerName: string;
    wordOptions: string[];
    revealedWord: string | null;
    finalRankings?: Array<{ id?: string; name: string; avatar?: string; score?: number }>;
    onWordSelect: (word: string) => void;
    onPlayAgain?: () => void;
    onLeaveRoom?: () => void;
};

const WordOverlay: React.FC<WordOverlayProps> = ({
    gameState,
    isDrawer,
    drawerName,
    wordOptions,
    revealedWord,
    finalRankings,
    onWordSelect,
    onLeaveRoom,
}) => {
    // word choice screen for drawer and waiting message for guessers
    if (gameState === "choosing") {
        if (isDrawer) {
            return (
                <div className="absolute inset-0 z-20 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-4">
                    <div className="bg-[rgba(30,95,210,0.95)] border border-white/25 p-5 rounded-xl shadow-2xl max-w-sm w-full text-center space-y-4">
                        <h3 className="text-xl font-bold text-white">Choose a Word to Draw</h3>
                        <p className="text-xs text-blue-100">Select one word before the timer runs out!</p>

                        <div className="flex flex-col gap-2.5">
                            {wordOptions.length === 0 ? (
                                <div className="py-4 space-y-2">
                                    <div className="size-8 border-3 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                                    <p className="text-xs text-blue-100 animate-pulse">Loading word options...</p>
                                </div>
                            ) : (
                                wordOptions.map((word) => (
                                    <button
                                        key={word}
                                        type="button"
                                        onClick={() => onWordSelect(word)}
                                        className="w-full bg-blue-500 hover:bg-blue-600 active:scale-98 text-white font-bold py-2.5 px-4 rounded-lg shadow cursor-pointer text-base capitalize transition-all"
                                    >
                                        {word}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center p-4">
                <div className="bg-[rgba(30,95,210,0.92)] border border-white/20 p-5 rounded-xl shadow-2xl max-w-sm w-full text-center space-y-3 text-white">
                    <div className="size-10 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                    <h3 className="text-lg font-bold">{drawerName || "Drawer"} is choosing a word...</h3>
                    <p className="text-xs text-blue-100">Get ready to guess!</p>
                </div>
            </div>
        );
    }

    // round ended and reveal secret word
    if (gameState === "round_end") {
        return (
            <div className="absolute inset-0 z-20 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center p-4">
                <div className="bg-[rgba(30,95,210,0.95)] border border-white/25 p-6 rounded-xl shadow-2xl max-w-sm w-full text-center space-y-3 text-white animate-fade-in">
                    <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">Round Over</p>
                    <p className="text-xs text-blue-200">The word was:</p>
                    <h2 className="text-3xl font-extrabold text-amber-300 tracking-wide uppercase bg-black/30 py-2 rounded-lg">
                        {revealedWord || "???"}
                    </h2>
                </div>
            </div>
        );
    }

    // final podium and top players list
    if (gameState === "game_over") {
        const top3 = (finalRankings || []).slice(0, 3);
        const medals = ["🥇", "🥈", "🥉"];

        return (
            <div className="absolute inset-0 z-20 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                <div className="bg-[rgba(30,95,210,0.98)] border border-yellow-400/40 p-6 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-5 text-white">
                    <div className="space-y-1">
                        <img src="/logo.gif" className="h-12 mx-auto" alt="" />
                        <h2 className="text-2xl font-black text-yellow-300 uppercase tracking-wide"> Game Over </h2>
                    </div>

                    <div className="space-y-2">
                        {top3.map((player, idx) => (
                            <div
                                key={player.id || idx}
                                className={`flex items-center justify-between p-2.5 rounded-lg font-bold ${
                                    idx === 0
                                        ? "bg-yellow-500/30 border border-yellow-400 text-yellow-200"
                                        : "bg-white/10"
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{medals[idx]}</span>
                                    <img
                                        src={player.avatar || "/images/a1.gif"}
                                        className="size-8 rounded-full object-cover"
                                        alt=""
                                    />
                                    <span className="truncate max-w-35 text-sm">{player.name}</span>
                                </div>
                                <span className="text-sm">{player.score ?? 0} pts</span>
                            </div>
                        ))}
                    </div>

                    {onLeaveRoom && (
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={onLeaveRoom}
                                className="w-full bg-red-500 hover:bg-red-600 active:scale-[0.98] transition text-white font-bold py-2.5 rounded-lg cursor-pointer text-sm shadow-md"
                            >
                                🚪 Leave Room
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return null;
};

export default WordOverlay;
