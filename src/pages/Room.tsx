import React, {useEffect, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router';
import PlayerList from '../components/PlayerList.tsx';
import Toolbar from '../components/Toolbar.tsx';
import Canvas, {type CanvasHandle} from '../components/Canvas.tsx';
import AvatarPicker, {avatars} from '../components/AvatarPicker.tsx';
import LobbySettings from '../components/LobbySettings.tsx';
import WordOverlay from '../components/WordOverlay.tsx';
import {getPlayerSession, socket} from '../socket.ts';

export type ChatMessage = {
    id: string;
    type: 'chat' | 'correct' | 'close' | 'join' | 'leave' | 'reconnect' | 'host' | 'system';
    sender: string | null;
    text: string;
    timestamp: number;
    playerId?: string;
};

const Room = () => {
    const navigate = useNavigate();
    const {roomId} = useParams<{ roomId: string }>();

    // Check if player profile already exists in session
    const [playerProfile, setPlayerProfile] = useState<{ name: string; avatar: string } | null>(() => {
        const name = sessionStorage.getItem('playerName');
        const avatar = sessionStorage.getItem('playerAvatar');
        return name && avatar ? {name, avatar} : null;
    });
    const [inputName, setInputName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState<string>(avatars[0]);

    const scrollChatsToBottom = () => {
        const chatList = document.getElementById('chat-list');
        chatList?.scrollTo({
            top: chatList.scrollHeight,
            behavior: 'smooth',
        });
    };

    const colors = [
        '#FFFFFF', '#BDBDBD', '#FF2020', '#FF6500', '#FFE000', '#00D000', '#00F08A', '#00AEEF', '#2525D9', '#A500C5', '#D95A9F', '#FFA080', '#000000', '#555555', '#A80000', '#B83D00', '#B89F00', '#008000', '#008F52', '#0079A8', '#121278', '#620078', '#8F3A69', '#B85F45',
    ] as const;
    const brushSizes = [1, 5, 10, 20, 30] as const;

    type Colors = (typeof colors[number]);

    const [players, setPlayers] = useState<any[]>([]);
    const [isHost, setIsHost] = useState(false);
    const [gameState, setGameState] = useState<string>('lobby');
    const [timeLeft, setTimeLeft] = useState(60);
    const [chat, setChat] = useState('');
    const [chats, setChats] = useState<ChatMessage[]>([]);
    const [color, setColor] = useState<Colors>('#000000');
    const [isBrushMenuOpen, setIsBrushMenuOpen] = useState(false);
    const [brush, setBrush] = useState<typeof brushSizes[number]>(10);

    // Turn & Round state
    const [drawerId, setDrawerId] = useState<string | null>(null);
    const [drawerName, setDrawerName] = useState<string>('');
    const [currentRound, setCurrentRound] = useState<number>(1);
    const [totalRounds, setTotalRounds] = useState<number>(3);

    const [wordOptions, setWordOptions] = useState<string[]>([]);
    const [currentWord, setCurrentWord] = useState<string>('');
    const [wordBlanks, setWordBlanks] = useState<string>('');
    const [wordLength, setWordLength] = useState<number>(0);
    const [revealedWord, setRevealedWord] = useState<string | null>(null);
    const [finalRankings, setFinalRankings] = useState<any[]>([]);
    const [hasGuessedCorrectly, setHasGuessedCorrectly] = useState(false);
    const [copied, setCopied] = useState(false);

    const canvasHandleRef = useRef<CanvasHandle>(null);
    const playersRef = useRef<any[]>([]);

    useEffect(() => {
        playersRef.current = players;
    }, [players]);

    const myPlayerId = sessionStorage.getItem('sketch_playerId');
    const isDrawer = Boolean(
        (drawerId && drawerId === myPlayerId) ||
        (drawerName && playerProfile?.name && drawerName.toLowerCase() === playerProfile.name.toLowerCase())
    );
    const canDraw = gameState === 'lobby' || (gameState === 'drawing' && isDrawer);

    const handleChatSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!chat.trim() || isDrawer || hasGuessedCorrectly) return;

        socket.emit('guess', {text: chat.trim()});
        setChat('');
    };

    const handleJoinSubmit = () => {
        const finalName = inputName.trim() || 'Player ' + Math.floor(Math.random() * 1000);
        sessionStorage.setItem('playerName', finalName);
        sessionStorage.setItem('playerAvatar', selectedAvatar);
        setPlayerProfile({name: finalName, avatar: selectedAvatar});
    };

    const handleStartGame = (settings: {
        rounds: number;
        drawTime: number;
        wordCount: number;
        customWords: string[];
    }) => {
        socket.emit('start_game', {roomId, ...settings}, (res: any) => {
            if (!res?.success) {
                alert(res?.error || 'Failed to start game');
            }
        });
    };

    const handleWordSelect = (word: string) => {
        socket.emit('word_chosen', {word});
        setCurrentWord(word);
        setGameState('drawing');
    };

    const handleLeaveRoom = () => {
        socket.emit('leave_room');
        navigate('/');
    };

    useEffect(() => {
        if (!roomId || !playerProfile) return;

        const {playerId} = getPlayerSession();

        socket.emit('join_room', {
            roomId,
            name: playerProfile.name,
            avatar: playerProfile.avatar,
            playerId
        }, (res: any) => {
            if (!res.success) {
                alert(res?.error || 'Room not found or expired');
                navigate('/');
                return;
            }

            if (res.playerId) {
                sessionStorage.setItem('sketch_playerId', res.playerId);
            }

            if (res.isHost !== undefined) {
                setIsHost(Boolean(res.isHost));
            } else if (res.players) {
                const me = res.players.find((p: any) => p.id === (res.playerId || playerId) || p.name === playerProfile.name);
                if (me) setIsHost(Boolean(me.isHost));
            }

            setPlayers(res.players || []);
            playersRef.current = res.players || [];
            if (res.gameState) setGameState(res.gameState);

            if (res.strokes && res.strokes.length > 0) {
                canvasHandleRef.current?.loadStrokes(res.strokes);
            }
        });

        const updatePlayerState = (updated: any[]) => {
            playersRef.current = updated;
            setPlayers(updated);
            const currentId = sessionStorage.getItem('sketch_playerId');
            const me = updated.find((p) => p.id === currentId || p.name === playerProfile.name);
            if (me && me.isHost !== undefined) {
                setIsHost(Boolean(me.isHost));
            }
        };

        const handlePlayerJoined = (updated: any[]) => updatePlayerState(updated);
        const handlePlayerLeft = (updated: any[]) => updatePlayerState(updated);

        const handleChatMessage = (msg: ChatMessage) => {
            setChats((prev) => [...prev, msg]);
            if (msg.type === 'correct') {
                const currentPId = sessionStorage.getItem('sketch_playerId');
                const isMe = 
                    (msg.playerId && msg.playerId === currentPId) ||
                    msg.sender === playerProfile.name ||
                    msg.text === `${playerProfile.name} guessed the word!`;
                if (isMe) {
                    setHasGuessedCorrectly(true);
                }
            }
            setTimeout(scrollChatsToBottom, 50);
        };

        const handleTimer = ({timeLeft}: { timeLeft: number }) => setTimeLeft(timeLeft);
        const handleGameStateChanged = ({state}: { state: string }) => {
            setGameState(state);
        };
        const handleRoomClosed = ({message}: { message: string }) => {
            alert(message || 'Room has been closed by the host.');
            navigate('/');
        };

        const handleRoundStart = (data: { drawerId: string; drawerName: string; turn: number; totalTurns: number }) => {
            setDrawerId(data.drawerId);
            setDrawerName(data.drawerName);

            // Backend calculates: totalTurns = rounds * connectedPlayers
            const playerCount = playersRef.current.length || 2;
            setCurrentRound(Math.ceil(data.turn / playerCount));
            setTotalRounds(Math.round(data.totalTurns / playerCount));

            setCurrentWord('');
            setWordBlanks('');
            setWordLength(0);
            setRevealedWord(null);
            setHasGuessedCorrectly(false);
            setGameState('choosing');
            canvasHandleRef.current?.clear();
        };

        // Backend emits: { words: room.wordOptions }
        const handleWordOptions = (data: { words?: string[] } | string[]) => {
            const words = Array.isArray(data) ? data : (data?.words || []);
            setWordOptions(words);
            setGameState('choosing');
        };

        // Backend emits: { blanks: string, length: number }
        const handleWordPicked = ({blanks, length}: { blanks: string; length: number }) => {
            setWordBlanks(blanks);
            setWordLength(length);
            setGameState('drawing');
        };

        // Backend emits: { word: string }
        const handleYourWord = ({word}: { word: string }) => {
            setCurrentWord(word);
            setGameState('drawing');
        };

        const handleRoundEnd = ({word, players: updatedPlayers}: { word: string; players: any[] }) => {
            setRevealedWord(word);
            setGameState('round_end');
            if (updatedPlayers) updatePlayerState(updatedPlayers);
        };

        const handleGameOver = ({players: updatedPlayers}: { players: any[] }) => {
            setFinalRankings(updatedPlayers);
            setGameState('game_over');
            if (updatedPlayers) updatePlayerState(updatedPlayers);
        };

        socket.on('player_joined', handlePlayerJoined);
        socket.on('player_left', handlePlayerLeft);
        socket.on('chat_message', handleChatMessage);
        socket.on('timer', handleTimer);
        socket.on('game_state_changed', handleGameStateChanged);
        socket.on('room_closed', handleRoomClosed);
        socket.on('round_start', handleRoundStart);
        socket.on('word_options', handleWordOptions);
        socket.on('word_picked', handleWordPicked);
        socket.on('your_word', handleYourWord);
        socket.on('round_end', handleRoundEnd);
        socket.on('game_over', handleGameOver);

        return () => {
            socket.off('player_joined', handlePlayerJoined);
            socket.off('player_left', handlePlayerLeft);
            socket.off('chat_message', handleChatMessage);
            socket.off('timer', handleTimer);
            socket.off('game_state_changed', handleGameStateChanged);
            socket.off('room_closed', handleRoomClosed);
            socket.off('round_start', handleRoundStart);
            socket.off('word_options', handleWordOptions);
            socket.off('word_picked', handleWordPicked);
            socket.off('your_word', handleYourWord);
            socket.off('round_end', handleRoundEnd);
            socket.off('game_over', handleGameOver);
        };
    }, [roomId, playerProfile, navigate]);

    useEffect(() => {
        const handleDrawStart = (data: { x: number; y: number; color: string; size: number }) => {
            canvasHandleRef.current?.remoteDrawStart({
                x: data.x, y: data.y,
            }, data.color, data.size);
        };

        const handleDrawMove = (point: { x: number; y: number }) => canvasHandleRef.current?.remoteDrawMove(point);
        const handleDrawEnd = () => canvasHandleRef.current?.remoteDrawEnd();
        const handleCanvasClear = () => canvasHandleRef.current?.clear();
        const handleCanvasUndo = () => canvasHandleRef.current?.undo();

        socket.on('draw_start', handleDrawStart);
        socket.on('draw_move', handleDrawMove);
        socket.on('draw_end', handleDrawEnd);
        socket.on('canvas_clear', handleCanvasClear);
        socket.on('draw_undo', handleCanvasUndo);

        return () => {
            socket.off('draw_start', handleDrawStart);
            socket.off('draw_move', handleDrawMove);
            socket.off('draw_end', handleDrawEnd);
            socket.off('canvas_clear', handleCanvasClear);
            socket.off('draw_undo', handleCanvasUndo);
        };
    }, [roomId]);

    // GATE: If player doesn't have a profile yet (direct link joiner), show avatar & name picker
    if (!playerProfile) {
        return (
            <section className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-[rgba(30,95,210,0.92)] border border-white/20 w-full max-w-sm mx-auto p-5 rounded-xl text-white shadow-2xl flex flex-col gap-4 backdrop-blur-xs">
                    <img src="/logo.gif" className="h-14 mx-auto" alt="logo"/>
                    <h2 className="text-center font-bold text-xl">Join Room {roomId}</h2>

                    <div className="bg-[rgba(24,80,185,0.75)] p-2 rounded">
                        <AvatarPicker avatar={selectedAvatar} setAvatar={setSelectedAvatar}/>
                    </div>

                    <input
                        type="text"
                        placeholder="Enter your name"
                        className="w-full rounded border bg-white p-2 text-black outline-none focus:ring-2 focus:ring-blue-500"
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleJoinSubmit();
                        }}
                    />

                    <button
                        type="button"
                        onClick={handleJoinSubmit}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold p-2.5 rounded cursor-pointer transition active:scale-95"
                    >
                        Join Game
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="container mx-auto p-2 md:p-10">
            {/*head*/}
            <button type="button" onClick={handleLeaveRoom} className="cursor-pointer">
                <img src="/logo.gif" className="h-16 mx-auto md:ms-0" alt="logo"/>
            </button>

            {/*info banner*/}
            <div className="bg-white flex justify-between items-center h-16 mt-5 mb-2 px-3 rounded shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="bg-[url('/room/clock.gif')] size-14 flex bg-no-repeat bg-contain justify-center items-center">
                        <span className="font-bold text-xl mt-1">
                            {gameState === 'lobby' ? '--' : timeLeft}
                        </span>
                    </div>

                    <span className="font-bold text-sm text-gray-700 hidden sm:inline">
                        Round {currentRound} of {totalRounds}
                    </span>
                </div>

                {/* Header - Center Word Hint / Announcement */}
                <div className="text-center font-bold flex-1 px-2">
                    {gameState === 'lobby' && (
                        <span className="text-sm text-gray-400">Waiting in Lobby</span>
                    )}
                    {gameState === 'choosing' && (
                        <span className="text-sm text-blue-600 animate-pulse">
                            {isDrawer ? 'Choose a word to draw!' : `${drawerName} is choosing a word...`}
                        </span>
                    )}
                    {gameState === 'drawing' && isDrawer && (
                        <span className="text-base sm:text-lg text-green-600 tracking-wide">
                            Word: <strong className="uppercase">{currentWord}</strong>
                        </span>
                    )}
                    {gameState === 'drawing' && !isDrawer && (
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-lg sm:text-xl font-mono tracking-widest text-gray-900">
                                {wordBlanks}
                            </span>
                            <span className="text-xs text-gray-400 font-normal">({wordLength})</span>
                        </div>
                    )}
                    {gameState === 'round_end' && (
                        <span className="text-sm text-amber-600">
                            Word was: <strong className="uppercase">{revealedWord}</strong>
                        </span>
                    )}
                    {gameState === 'game_over' && (
                        <span className="text-sm text-yellow-600">Game Over</span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            const link = `${window.location.origin}/room/${roomId}`;
                            navigator.clipboard.writeText(link)
                                .then(() => {
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                })
                                .catch(err => console.error(err));
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm px-3 py-1.5 rounded cursor-pointer font-medium transition"
                    >
                        {copied ? '✓ Copied!' : '📋 Copy Link'}
                    </button>
                    <button
                        type="button"
                        onClick={handleLeaveRoom}
                        className="bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm px-3 py-1.5 rounded cursor-pointer font-medium transition"
                    >
                        🚪 Leave
                    </button>
                </div>
            </div>

            {/*3 rows*/}
            <div className="grid grid-cols-2 gap-2 md:grid-cols-12">

                {/*left players*/}
                <PlayerList
                    players={players.map((p) => ({
                        ...p,
                        isDrawing: p.id === drawerId,
                    }))}
                />

                {/*center settings and game*/}
                <div className="order-1 col-span-2 md:order-2 md:col-span-7 rounded">

                    {/*canvas*/}
                    <div className="relative h-96 bg-white rounded overflow-hidden">
                        <Canvas
                            readOnly={!canDraw}
                            color={color}
                            brush={brush}
                            ref={canvasHandleRef}
                            onDrawStart={(point, strokeColor, size) => {
                                if (!canDraw) return;
                                socket.emit('draw_start', {...point, color: strokeColor, size});
                            }}
                            onDrawMove={(point) => {
                                if (!canDraw) return;
                                socket.emit('draw_move', point);
                            }}
                            onDrawEnd={() => {
                                if (!canDraw) return;
                                socket.emit('draw_end');
                            }}
                        />

                        {/* Lobby Settings / Waiting Overlay */}
                        {gameState === 'lobby' && (
                            <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                                <LobbySettings
                                    isHost={isHost}
                                    playerCount={players.length}
                                    onStartGame={handleStartGame}
                                />
                            </div>
                        )}

                        {/* Word Selection / Round End / Game Over Overlay */}
                        <WordOverlay
                            gameState={gameState}
                            isDrawer={isDrawer}
                            drawerName={drawerName}
                            wordOptions={wordOptions}
                            revealedWord={revealedWord}
                            finalRankings={finalRankings}
                            onWordSelect={handleWordSelect}
                            onLeaveRoom={handleLeaveRoom}
                        />

                    </div>

                    {canDraw && (
                        <Toolbar
                            color={color}
                            colors={colors}
                            setColor={setColor}
                            brush={brush}
                            setBrush={setBrush}
                            brushSizes={brushSizes}
                            isBrushMenuOpen={isBrushMenuOpen}
                            setIsBrushMenuOpen={setIsBrushMenuOpen}
                            onUndo={() => {
                                canvasHandleRef.current?.undo();
                                socket.emit('draw_undo');
                            }}
                            onClear={() => {
                                canvasHandleRef.current?.clear();
                                socket.emit('canvas_clear');
                            }}
                        />
                    )}

                </div>

                {/*right chat and guess*/}
                <div className="order-3 min-h-96 max-h-96 bg-white md:col-span-3 md:h-full rounded flex flex-col">
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div id="chat-list" className="flex-1 overflow-y-auto p-2 space-y-1.5 text-sm">
                            {chats.length === 0 && (
                                <p className="text-gray-400 text-xs italic text-center mt-2">Chat and guesses will appear here...</p>
                            )}
                            {chats.map((item) => {
                                switch (item.type) {
                                    case 'correct':
                                        return (
                                            <p key={item.id} className="text-green-700 font-bold bg-green-100 p-1.5 rounded text-xs">
                                                {item.text}
                                            </p>
                                        );
                                    case 'close':
                                        return (
                                            <p key={item.id} className="text-amber-700 font-semibold bg-amber-100 p-1.5 rounded text-xs">
                                                {item.text}
                                            </p>
                                        );
                                    case 'join':
                                    case 'reconnect':
                                        return (
                                            <p key={item.id} className="text-blue-600 font-medium text-xs">
                                                {item.text}
                                            </p>
                                        );
                                    case 'leave':
                                        return (
                                            <p key={item.id} className="text-red-500 font-medium text-xs">
                                                {item.text}
                                            </p>
                                        );
                                    case 'host':
                                        return (
                                            <p key={item.id} className="text-orange-600 font-bold text-xs">
                                                {item.text}
                                            </p>
                                        );
                                    case 'system':
                                        return (
                                            <p key={item.id} className="text-gray-500 italic text-center text-xs my-1 bg-gray-50 py-0.5 rounded">
                                                {item.text}
                                            </p>
                                        );
                                    case 'chat':
                                    default:
                                        return (
                                            <p key={item.id} className="break-words leading-tight">
                                                <span className="font-bold text-gray-800">{item.sender}: </span>
                                                <span className="text-gray-700">{item.text}</span>
                                            </p>
                                        );
                                }
                            })}
                        </div>
                        <form onSubmit={handleChatSubmit} className="p-1.5 border-t border-gray-200">
                            <input
                                type="text"
                                name="chat"
                                id="chat"
                                value={chat}
                                disabled={isDrawer && gameState === 'drawing' ? true : hasGuessedCorrectly}
                                placeholder={
                                    isDrawer && gameState === 'drawing'
                                        ? 'You are drawing, you cannot guess!'
                                        : hasGuessedCorrectly
                                            ? 'You guessed the word! '
                                            : 'Type your guess here...'
                                }
                                className={`w-full border px-2 py-1 text-sm rounded outline-none transition ${
                                    hasGuessedCorrectly
                                        ? 'border-green-400 bg-green-50 text-green-700 cursor-not-allowed'
                                        : isDrawer && gameState === 'drawing'
                                            ? 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                                            : 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500'
                                }`}
                                onChange={(e) => setChat(e.target.value)}
                            />
                        </form>
                    </div>
                </div>
            </div>

        </section>
    );
};

export default Room;
