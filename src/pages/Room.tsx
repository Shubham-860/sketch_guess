import React, {useEffect, useState} from 'react';
import {Link} from "react-router";

const Room = () => {
    const scrollChatsToBottom = () => {
        const chatList = document.getElementById("chat-list");

        chatList?.scrollTo({
            top: chatList.scrollHeight,
            behavior: "smooth",
        });
    };
    let players: any[] = [1, 2, 3];
    const colors = [
        // Row 1
        "#FFFFFF",
        "#BDBDBD",
        "#FF2020",
        "#FF6500",
        "#FFE000",
        "#00D000",
        "#00F08A",
        "#00AEEF",
        "#2525D9",
        "#A500C5",
        "#D95A9F",
        "#FFA080",

        // Row 2 - darker versions
        "#000000",
        "#555555",
        "#A80000",
        "#B83D00",
        "#B89F00",
        "#008000",
        "#008F52",
        "#0079A8",
        "#121278",
        "#620078",
        "#8F3A69",
        "#B85F45",
    ] as const;
    const brushSizes = [10, 20, 30, 40, 50] as const;
    type Colors = (typeof colors[number]);
    const [gameState, setGameState] = useState<'Waiting' | 'Playing' | 'Ended'>("Playing")
    const [timeLeft, setTimeLeft] = useState(90)
    const [chat, setChat] = useState("")
    const [chats, setChats] = useState(["asd", "asddas", "wefw"])
    const [color, setColor] = useState<Colors>("#FFFFFF")
    const [isBrushMenuOpen, setIsBrushMenuOpen] = useState(false)
    const [brush, setBrush] = useState<typeof brushSizes[number]>(10)

    const handleChatSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (chat.trim() === "") return;
        console.log(chat)
        setChats([...chats, chat])
        setChat("")
        scrollChatsToBottom()
    }

    useEffect(() => {
        if (gameState !== "Playing" || timeLeft === 0) {
            if (timeLeft === 0) setGameState("Ended")
            return
        }

        const timer = window.setTimeout(() => setTimeLeft((time) => time - 1), 1000)
        return () => window.clearTimeout(timer)
    }, [gameState, timeLeft])


    return (
        <section className={"container mx-auto p-2 md:p-10"}>
            {/*head*/}
            <Link to={"/"} className={""}>
                <img src="/logo.gif" className={"h-16"} alt="logo"/>
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
                <div className={"text-xl"}> {gameState}</div>
                <div>
                    <img src="/room/settings.gif" alt="settings" className={"size-14 "}/>
                </div>
            </div>
            {/*3 rows*/}

            <div className="grid grid-cols-2 gap-2 md:grid-cols-12 ">

                {/*left players*/}
                <div className="order-2 md:order-1 md:col-span-2 rounded">

                    {players.map((item, index) => (
                        <div key={index} className={"flex justify-between bg-white items-center mb-2 ps-1"}>
                            <div>
                                #1
                                {index === 0 && <img src="/room/owner.gif" className={"size-5"} alt=""/>}

                            </div>
                            <div className={"text-sm"}>
                                <p className={"text-blue-500"}>
                                    {item?.name || "RagonMax"}
                                </p>
                                <p>
                                    0 Points
                                </p>
                            </div>
                            <div className={"w-12 relative"}>
                                <img src="/images/avatar.png" alt="avtar" className={"top-0 left-0"}/>
                                {!item?.turn &&
                                    <img src="/room/crown.gif" alt="avtar"
                                         className={"w-6 absolute -top-3 z-10 left-0"}/>
                                }
                            </div>
                        </div>
                    ))}


                </div>



                {/*center settings and game*/}
                <div className="order-1 col-span-2 md:order-2 md:col-span-7 rounded">

                    <div className={"h-96 bg-white rounded"}></div>
                    <div className={"h-10 flex justify-between mt-2 rounded"}>
                        <div className={"flex gap-2"}>
                            <div className={"size-12 bg-white"} style={{backgroundColor: color}}></div>
                            <div className={"grid grid-cols-12 gap-0"}>
                                {colors.map((item, index) => (
                                    <div key={index}
                                         className="h-6 w-6"
                                         style={{backgroundColor: item}}
                                         onClick={() => setColor(item)}
                                    >
                                    </div>
                                ))}
                            </div>
                            <div className="relative">
                                <button
                                    type="button"
                                    className="size-12 rounded border border-gray-300 bg-white flex items-center justify-center cursor-pointer"
                                    onClick={() => setIsBrushMenuOpen((open) => !open)}
                                    aria-label="Choose brush size"
                                    aria-expanded={isBrushMenuOpen}
                                >
                                    <img src="/room/size.gif" className="brightness-0" alt=""
                                         style={{height: brush, width: brush, maxHeight: "100%", maxWidth: "100%"}}
                                    />
                                </button>

                                {isBrushMenuOpen && (
                                    <div
                                        className="absolute bottom-full left-1/2 z-20 mb-1 flex -translate-x-1/2 flex-col gap-1 rounded bg-white p-1 ">
                                        {brushSizes.map((size) => (
                                            <button
                                                key={size}
                                                type="button"
                                                className="size-12 rounded border cursor-pointer bg-white border-gray-300 flex justify-center items-center"
                                                onClick={() => {
                                                    setBrush(size)
                                                    setIsBrushMenuOpen(false)
                                                }}
                                                aria-label={`Select brush size ${size}`}
                                            >
                                                <img src="/room/size.gif" className={"brightness-0"}
                                                     style={{
                                                         height: size,
                                                         width: size,
                                                         maxHeight: "100%",
                                                         maxWidth: "100%"
                                                     }}
                                                     alt=""/>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={"flex justify-center gap-2"}>
                            <div className={"bg-white size-12"}><img src="/room/pen.gif" alt="pen" className={"size-12  rounded opacity-70 hover:opacity-100 hover:p-1 "}/></div>
                            <div className={"bg-white size-12"}><img src="/room/fill.gif" alt="fill" className={"size-12  rounded opacity-70 hover:opacity-100 hover:p-1 "}/></div>
                        </div>
                        <div className={"flex justify-center gap-2"}>
                            <div className={"bg-white size-12"}><img src="/room/undo.gif" alt="pen" className={"size-12  rounded opacity-70 hover:opacity-100 hover:p-1"}/></div>
                            <div className={"bg-white size-12"}><img src="/room/clear.gif" alt="fill" className={"size-12  rounded opacity-70 hover:opacity-100 hover:p-1"}/></div>
                        </div>
                    </div>
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
                                    <p key={i} className={i % 2 === 0 ? "bg-gray-100 p-1 wrap-break-word" : "p-1 wrap-break-word"}>
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
