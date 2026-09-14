import React, {useEffect, useRef, useState} from 'react';
import {Link, useNavigate, useParams} from "react-router";
import PlayerList from "../components/PlayerList.tsx";
import Toolbar from "../components/Toolbar.tsx";
import Canvas, {type CanvasHandle} from "../components/Canvas.tsx";
import AvatarPicker, {avatars} from "../components/AvatarPicker.tsx";
import {getPlayerSession, socket} from "../socket.ts";

const Room = () => {
    const navigate = useNavigate();
    const {roomId} = useParams<{ roomId: string }>();

    // Check if player profile already exists in session
    const [playerProfile, setPlayerProfile] = useState<{ name: string; avatar: string } | null>(() => {
        const name = sessionStorage.getItem("playerName");
        const avatar = sessionStorage.getItem("playerAvatar");
        return name && avatar ? { name, avatar } : null;
    });
    const [inputName, setInputName] = useState("");
    const [selectedAvatar, setSelectedAvatar] = useState<string>(avatars[0]);

    const scrollChatsToBottom = () => {
        const chatList = document.getElementById("chat-list");

        chatList?.scrollTo({
            top: chatList.scrollHeight,
            behavior: "smooth",
        });
    };

    const colors = [
        "#FFFFFF", "#BDBDBD", "#FF2020", "#FF6500", "#FFE000", "#00D000", "#00F08A", "#00AEEF", "#2525D9", "#A500C5", "#D95A9F", "#FFA080", "#000000", "#555555", "#A80000", "#B83D00", "#B89F00", "#008000", "#008F52", "#0079A8", "#121278", "#620078", "#8F3A69", "#B85F45",
    ] as const;
    const brushSizes = [1, 5, 10, 20, 30] as const;

    type Colors = (typeof colors[number]);

    const [players, setPlayers] = useState<any[]>([])
    const [gameState, setGameState] = useState<'Waiting' | 'Playing' | 'Ended'>("Playing")
    const [timeLeft, setTimeLeft] = useState(90)
    const [chat, setChat] = useState("")
    const [chats, setChats] = useState(["asd", "asddas", "wefw"])
    const [color, setColor] = useState<Colors>("#000000")
    const [isBrushMenuOpen, setIsBrushMenuOpen] = useState(false)
    const [brush, setBrush] = useState<typeof brushSizes[number]>(10)

    const canvasHandleRef = useRef<CanvasHandle>(null);

    const handleChatSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (chat.trim() === "") return;
        console.log(chat)
        setChats([...chats, chat])
        setChat("")
        scrollChatsToBottom()
    }

    const handleJoinSubmit = () => {
        const finalName = inputName.trim() || "Player " + Math.floor(Math.random() * 1000);
        sessionStorage.setItem("playerName", finalName);
        sessionStorage.setItem("playerAvatar", selectedAvatar);
        setPlayerProfile({ name: finalName, avatar: selectedAvatar });
    };

    useEffect(() => {
        if (!roomId) {
            navigate("/");
            return;
        }

        if (!playerProfile) return; // Wait until player chooses name & avatar

        const { playerId } = getPlayerSession();

        socket.emit("join_room", {
            roomId, 
            name: playerProfile.name, 
            avatar: playerProfile.avatar, 
            playerId
        }, (res: any) => {
            if (!res.success) {
                alert(res?.error || "Room not found or expired");
                navigate("/");
                return;
            }

            setPlayers(res.players);

            if (res.strokes && res.strokes.length > 0) {
                canvasHandleRef.current?.loadStrokes(res.strokes);
            }
        });

        const handlePlayerJoined = (updated: any[]) => setPlayers(updated);
        const handlePlayerLeft = (updated: any[]) => setPlayers(updated);

        socket.on("player_joined", handlePlayerJoined);
        socket.on("player_left", handlePlayerLeft);

        return () => {
            socket.off("player_joined", handlePlayerJoined);
            socket.off("player_left", handlePlayerLeft);
        };
    }, [roomId, playerProfile, navigate]);

    useEffect(() => {
        if (gameState !== "Playing" || timeLeft === 0) {
            if (timeLeft === 0) setGameState("Ended")
            return
        }

        const timer = window.setTimeout(() => setTimeLeft((time) => time - 1), 1000)
        return () => window.clearTimeout(timer)
    }, [gameState, timeLeft])

    useEffect(() => {
        const handleDrawStart = (data: { x: number; y: number; color: string; size: number }) => {
            canvasHandleRef.current?.remoteDrawStart({
                x: data.x, y: data.y,
            }, data.color, data.size);
        }

        const handleDrawMove = (point: { x: number; y: number }) => canvasHandleRef.current?.remoteDrawMove(point);

        const handleDrawEnd = () => canvasHandleRef.current?.remoteDrawEnd()

        const handleCanvasClear = () => canvasHandleRef.current?.clear();

        const handleCanvasUndo = () => canvasHandleRef.current?.undo();

        socket.on("draw_start", handleDrawStart);
        socket.on("draw_move", handleDrawMove);
        socket.on("draw_end", handleDrawEnd);
        socket.on("canvas_clear", handleCanvasClear);
        socket.on("draw_undo", handleCanvasUndo);

        return () => {
            socket.off("draw_start", handleDrawStart);
            socket.off("draw_move", handleDrawMove);
            socket.off("draw_end", handleDrawEnd);
            socket.off("canvas_clear", handleCanvasClear);
            socket.off("draw_undo", handleCanvasUndo);
        }
    }, [roomId]);

    // GATE: If player doesn't have a profile yet (direct link joiner), show avatar & name picker
    if (!playerProfile) {
        return (
            <section className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-[rgba(10,50,149,0.85)] w-full max-w-sm mx-auto p-5 rounded-lg text-white shadow-xl flex flex-col gap-4">
                    <img src="/logo.gif" className="h-14 mx-auto" alt="logo" />
                    <h2 className="text-center font-bold text-xl">Join Room {roomId}</h2>

                    <div className="bg-[rgba(10,35,149,0.7)] p-2 rounded">
                        <AvatarPicker avatar={selectedAvatar} setAvatar={setSelectedAvatar} />
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
        <section className={"container mx-auto p-2 md:p-10"}>
            {/*head*/}
            <Link to={"/"} className={"w-full"}>
                <img src="/logo.gif" className={"h-16 mx-auto md:ms-0"} alt="logo"/>
            </Link>

            {/*info*/}
            <div className={"bg-white flex justify-between items-center h-16 mt-5 mb-2 px-2 rounded "}>
                <div className={"flex items-center"}>
                    <div
                        className={"bg-[url('/room/clock.gif')] -top-3 -left-3 size-16 flex bg-no-repeat bg-contain justify-center items-center "}>
                        {/*<img src="/room/clock.gif" alt="settings" className={"size-10 relative"}/>*/}
                        <span className={"font-bold text-xl mt-1"}>
                         {timeLeft}
                        </span>
                    </div>

                    <span className={"font-bold text-xl"}>
                        - Round 1 of 3
                    </span>

                </div>
                <div>
                    <img src="/room/settings.gif" alt="settings" className={"size-14 "}/>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            const link = `${window.location.origin}/room/${roomId}`;
                            navigator.clipboard.writeText(link)
                                .then(() => console.log("Room link copied to clipboard:", link))
                                .catch(err => console.error(err));
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1.5 rounded cursor-pointer font-medium"
                    >
                        📋 Copy Room Link
                    </button>
                    <div className={"text-xl"}> {gameState}</div>
                </div>
            </div>

            {/*3 rows*/}

            <div className="grid grid-cols-2 gap-2 md:grid-cols-12 ">

                {/*left players*/}
                <PlayerList players={players}/>


                {/*center settings and game*/}
                <div className="order-1 col-span-2 md:order-2 md:col-span-7 rounded">

                    {/*canvas*/}

                    <div className={"h-96 bg-white rounded"}>
                        <Canvas color={color} brush={brush} ref={canvasHandleRef}
                                onDrawStart={(point, strokeColor, size) =>
                                    socket.emit("draw_start", {...point, color: strokeColor, size})}
                                onDrawMove={(point) => socket.emit("draw_move", point)}
                                onDrawEnd={() => socket.emit("draw_end")}

                        />

                    </div>

                    <Toolbar
                        color={color} colors={colors} setColor={setColor}
                        brush={brush} setBrush={setBrush} brushSizes={brushSizes} isBrushMenuOpen={isBrushMenuOpen}
                        setIsBrushMenuOpen={setIsBrushMenuOpen}
                        onUndo={() => {
                            canvasHandleRef.current?.undo();
                            socket.emit("draw_undo");
                        }}
                        onClear={() => {
                            canvasHandleRef.current?.clear();
                            socket.emit("canvas_clear");
                        }}
                    />

                </div>


                {/*right chat and guess*/}
                <div className="order-3 min-h-96 max-h-96 bg-white md:col-span-3 md:h-full rounded">
                    <div className="flex h-full flex-col">
                        <div className={"pt-1 flex-1"}>
                            <div className="ps-1">
                                <p className="text-orange-500">Ragonmax is the owner</p>
                            </div>
                            <div id="chat-list" className={"max-h-80 overflow-y-auto"}>
                                {chats.map((item, i) =>
                                    <p key={i}
                                       className={i % 2 === 0 ? "bg-gray-100 p-1 wrap-break-word" : "p-1 wrap-break-word"}>
                                        {item}
                                    </p>)}
                            </div>
                        </div>
                        <form onSubmit={handleChatSubmit} className={"m-0.5"}>
                            <input
                                type="text"
                                name="chat"
                                id="chat"
                                value={chat}
                                placeholder="Type your guess here..."
                                className="w-full border bg-white p-1 rounded outline-none focus:ring-blue-500 focus:border-blue-500 focus:ring-2 "
                                onChange={(e) => setChat(e.target.value)}
                            /></form>
                    </div>
                </div>
            </div>

        </section>
    );
};

export default Room;
