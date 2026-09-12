import {createRoot} from 'react-dom/client'
import './index.css'
import Home from './pages/Home.tsx'
import {BrowserRouter, Route, Routes} from "react-router"
import Room from "./pages/Room.tsx";

createRoot(document.getElementById('root')!).render(
    <section className="bg-[url('/images/background.png')] min-h-dvh font-sans">


        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/room" element={<Room/>}/>
            </Routes>
        </BrowserRouter>
    </section>
)
