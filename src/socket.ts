import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_SERVER_URL);

export function getPlayerSession(customName?: string) {
    let playerId = sessionStorage.getItem("sketch_playerId");
    if (!playerId) {
        playerId = Math.random().toString(36).substring(2, 10);
        sessionStorage.setItem("sketch_playerId", playerId);
    }

    if (customName && customName.trim()) {
        sessionStorage.setItem("playerName", customName.trim());
    }

    let name = sessionStorage.getItem("playerName");
    if (!name) {
        name = "Player " + Math.floor(Math.random() * 1000);
        sessionStorage.setItem("playerName", name);
    }

    return { playerId, name };
}
