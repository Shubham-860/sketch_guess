import React from 'react';

// @ts-ignore
const PlayerList = ({players}) => {
    return (
        <div className="order-2 md:order-1 md:col-span-2 rounded">

            {players.map((item: { name: any; turn: any; }, index: React.Key | null | undefined) => (
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
    );
};

export default PlayerList;