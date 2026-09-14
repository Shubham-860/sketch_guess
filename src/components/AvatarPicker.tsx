export const avatars = [
    "/images/a1.gif",
    "/images/a2.gif",
    "/images/a3.gif",
    "/images/a4.gif",
    "/images/a5.gif",
    "/images/a6.gif",
    "/images/a7.gif",
] as const;

type AvatarPickerProps = {
    avatar: string;
    setAvatar: (avatar: string) => void;
};

const AvatarPicker = ({ avatar, setAvatar }: AvatarPickerProps) => (
    <div className="flex gap-2 justify-center flex-wrap">
        {avatars.map((src) => (
            <button
                key={src}
                type="button"
                onClick={() => setAvatar(src)}
                className={`size-14 rounded border-2 cursor-pointer bg-white/10 transition-all ${
                    avatar === src ? "border-blue-500 scale-105 shadow-md" : "border-transparent hover:border-white/40"
                }`}
            >
                <img src={src} alt="avatar option" className="w-full h-full object-cover rounded" />
            </button>
        ))}
    </div>
);

export default AvatarPicker;
