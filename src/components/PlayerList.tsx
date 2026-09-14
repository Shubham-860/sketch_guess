import React from 'react';

export type PlayerItem = {
    id?: string;
    name: string;
    avatar?: string;
    score?: number;
    isHost?: boolean;
    turn?: boolean;
    isDrawing?: boolean;
    connected?: boolean;
};

type PlayerListProps = {
    players: PlayerItem[];
};

const PlayerList: React.FC<PlayerListProps> = ({ players = [] }) => {
    // 1. Sort players by score descending
    const sortedPlayers = [...players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    // Find the highest score to award the crown
    const highestScore = sortedPlayers.length > 0 ? (sortedPlayers[0]?.score ?? 0) : 0;

    return (
        <div className="order-2 md:order-1 md:col-span-2 rounded">
            {sortedPlayers.map((item, index) => {
                // Crown goes to leader with points (or 1st place)
                const hasCrown = index === 0 && highestScore > 0;
                const isOffline = item.connected === false;

                return (
                    <div 
                        key={item.id || index} 
                        className={`flex justify-between bg-white items-center mb-2 p-1.5 rounded shadow-xs transition-opacity ${
                            isOffline ? "opacity-60" : "opacity-100"
                        }`}
                    >
                        {/* Rank and Host badge */}
                        <div className="flex flex-col items-center justify-center w-6 shrink-0">
                            <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                            {item.isHost && (
                                <img 
                                    src="/room/owner.gif" 
                                    className="size-4 mt-0.5" 
                                    alt="Host" 
                                    title="Room Host" 
                                />
                            )}
                        </div>

                        {/* Name, offline red dot, and Score */}
                        <div className="text-sm flex-1 mx-2 overflow-hidden">
                            <div className="flex items-center gap-1.5">
                                <p className={`font-semibold truncate ${isOffline ? "text-gray-500" : "text-blue-600"}`}>
                                    {item?.name || "Player"}
                                </p>
                                {isOffline && (
                                    <span 
                                        className="size-2 rounded-full bg-red-500 inline-block shrink-0 animate-pulse" 
                                        title="Disconnected / Reconnecting..." 
                                    />
                                )}
                                {(item.turn || item.isDrawing) && (
                                    <img 
                                        src="/room/pen.gif" 
                                        className="size-4 shrink-0" 
                                        alt="Drawing" 
                                        title="Drawing now" 
                                    />
                                )}
                            </div>
                            <p className="text-xs text-gray-500">
                                {item?.score ?? 0} Points
                            </p>
                        </div>

                        {/* Avatar and Crown */}
                        <div className="w-11 h-11 relative shrink-0">
                            <img 
                                src={item?.avatar || "/images/a1.gif"} 
                                alt={item?.name || "avatar"} 
                                className="w-full h-full object-cover rounded"
                            />
                            {hasCrown && (
                                <img 
                                    src="/room/crown.gif" 
                                    alt="crown"
                                    className="w-6 absolute -top-3.5 -left-1.5 z-10 drop-shadow"
                                    title="1st Place Leader"
                                />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PlayerList;
