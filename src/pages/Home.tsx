import {useEffect, useState} from 'react';
import {Link} from "react-router";
import {socket} from "../socket.ts";

const slides = ['/home/step1.gif', '/home/step2.gif', '/home/step3.gif', '/home/step4.gif', '/home/step5.gif'];

const Home = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [name, setName] = useState("")
    const [joinGame, setJoinGame] = useState(true)

    // useEffect(() => {
    //     socket.on("connect", () => {
    //         console.log("connecting to server", socket.id);
    //     })
    //     socket.on("connect_error", (err) => {
    //         console.log("Connection failed ", err.message);
    //     })
    // }, []);

    return (
        <section className="mx-auto">
            {/*head*/}
            <div className={"p-5"}>
                <img className="mx-auto" src="/logo.gif" alt={"logo"}/>
                <img className="mx-auto mt-3" src="/images/bg2.gif" alt={"logo"}/>
            </div>

            {/*middle*/}
            <div className="bg-[rgba(10,50,149,0.7)] w-xs md:w-sm mx-auto p-3 my-4">

                <div className={"flex justify-center"}>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        className="w-full rounded border bg-white p-1 text-black outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className={"bg-[rgba(10,35,149,0.7)] my-3 rounded"}>
                    <img src="/images/avatar.png" className={"w-28 mx-auto"} alt="Default Avatar"/>
                </div>

                <div>
                    {joinGame &&
                        <Link
                            to="/room"
                            className="mb-2 block w-full cursor-pointer bg-green-500 p-1.5 text-xl text-white md:p-3 md:text-3xl font-semibold text-center rounded"
                        >
                            Start
                        </Link>}
                    <Link
                        to="/room"
                        className="block w-full cursor-pointer bg-blue-400 p-1.5 text-xl text-white md:p-3 md:text-2xl text-center rounded"
                    >
                        Create Private Room
                    </Link>
                </div>
            </div>

            {/*bottom*/}

            <div className="bg-[rgba(10,35,149,0.7)] mx-auto pt-3 text-white">
                <div className="container mx-auto justify-center flex w-full flex-col md:flex-row gap-5">

                    {/*about*/}
                    <div className={"w-full max-w-96 p-5"}>
                        <div className={"flex w-full p-2 text-xl font-bold"}>
                            <img src="/home/questionmark.gif" className={"size-6"} alt="Default Avatar"/>
                            <span className={"mx-auto"}>About</span>
                        </div>
                        <p className={"text-sm"}>
                            Sketch Guess is a free online multiplayer drawing and guessing game.
                            <br/><br/>
                            A normal game consists of a few rounds. In each round, one player draws a chosen word while
                            the other players try to guess it and earn points!
                            <br/><br/>
                            The player with the most points at the end of the game will be crowned the winner!
                            <br/><br/>
                            Have fun and happy sketching!
                        </p>
                    </div>


                    {/*carousel*/}
                    <div className={"w-full max-w-80 p-5"}>
                        <div className={"flex w-full p-2 text-xl font-bold"}>
                            <img src="/home/how.gif" className={"size-6"} alt="Default Avatar"/>
                            <span className={"mx-auto"}>How to play</span>
                        </div>
                        <div>

                            <div className="relative w-full mx-auto">
                                <div className="relative overflow-hidden rounded-base h-64">
                                    <img src={slides[currentSlide]}
                                         className="absolute block w-full h-full object-contain"
                                         alt={`How to play - step ${currentSlide + 1}`}/>
                                </div>

                                <div className="absolute z-30 flex -translate-x-1/2 bottom-5 left-1/2 gap-3">
                                    {slides.map((_, index) => (
                                        <button key={index} type="button" onClick={() => setCurrentSlide(index)}
                                                className={`size-3 rounded-full cursor-pointer ${index === currentSlide ? 'bg-white' : 'bg-white/50'}`}
                                                aria-label={`Go to slide ${index + 1}`}
                                                aria-current={index === currentSlide}/>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Home;
