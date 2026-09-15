# Sketch Guess

A real-time multiplayer drawing and guessing game, similar to Skribbl.io. One player draws a word while the others try to guess it in the chat.

Live demo: https://sketch-guess-shubham.vercel.app/

## Features

- Create or join a game room using a shareable room code
- Real-time drawing synced across all players
- Player names and avatar selection
- In-room chat for guessing
- Drawer rotates each round
- Score tracking
- Works on both desktop and mobile (touch support)

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Socket.IO (client)

## Installation

1. Clone the repository
```
git clone https://github.com/Shubham-860/sketch_guess.git
cd sketch_guess
```

2. Install dependencies
```
npm install
```

3. Start the development server
```
npm run dev
```

4. Open the app in your browser at the local address shown in the terminal (usually http://localhost:5173)

Note: This is the frontend only. The backend (Express + Socket.IO) needs to be running separately for multiplayer features to work.

## Other Commands

Build for production
```
npm run build
```

Preview the production build
```
npm run preview
```

Run lint
```
npm run lint
```
