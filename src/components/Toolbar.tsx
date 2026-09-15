import type {Dispatch, SetStateAction} from 'react';

type ToolbarProps<Color extends string, Brush extends number> = {
    color: Color;
    colors: readonly Color[];
    setColor: (color: Color) => void;
    brush: Brush;
    brushSizes: readonly Brush[];
    setBrush: (brush: Brush) => void;
    isBrushMenuOpen: boolean;
    setIsBrushMenuOpen: Dispatch<SetStateAction<boolean>>;
    onUndo: () => void;
    onClear: () => void;
};

const Toolbar = <Color extends string, Brush extends number>(
    {color, colors, setColor, brush, brushSizes, setBrush, isBrushMenuOpen, setIsBrushMenuOpen, onUndo, onClear}
    : ToolbarProps<Color, Brush>) => {
    return (
        <div className={"min-h-10 gap-2 flex flex-wrap justify-between my-2 rounded"}>

            <div className={"flex gap-2 w-full md:w-fit justify-between md:justify-start"}>
                <div className={"size-12 bg-white"} style={{backgroundColor: color}}></div>
                <div className={"grid grid-cols-12 gap-0"}>
                    {colors.map((item) => (
                        <button key={item} type="button"
                                className="h-6 w-6"
                                style={{backgroundColor: item}}
                                onClick={() => setColor(item)}
                                aria-label={`Select ${item}`}
                        />
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
                                             height: size * 1.5,
                                             width: size * 1.5,
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

            {/* TODO: Implement pen/fill tool switching when bucket fill backend support is added */}
            {/*
            <div className={"flex justify-center gap-2"}>
                <div className={"bg-white size-12"}><img src="/room/pen.gif" alt="pen"
                                                         className={"size-12 rounded opacity-70 hover:opacity-100 hover:p-1 "}/>
                </div>
                <div className={"bg-white size-12"}><img src="/room/fill.gif" alt="fill"
                                                         className={"size-12 rounded opacity-70 hover:opacity-100 hover:p-1 "}/>
                </div>
            </div>
            */}

            <div className={"flex justify-center gap-2"}>
                <button onClick={onUndo}
                        className={"bg-white size-12"}>
                    <img src="/room/undo.gif" alt="pen"
                         className={"size-12  rounded opacity-70 hover:opacity-100 hover:p-1"}/>
                </button>
                <button onClick={onClear}
                        className={"bg-white size-12"}>
                    <img src="/room/clear.gif" alt="fill"
                         className={"size-12  rounded opacity-70 hover:opacity-100 hover:p-1"}/>
                </button>
            </div>

        </div>
    );
};

export default Toolbar;
