import './App.css'
import { useState } from 'react'
import Header from './components/Header.jsx'
import GameBoard from './components/GameBoard.jsx'
import StartScreen from './components/StartScreen.jsx'

//SINAV HAFTASI

function App() {
    const [phase, setPhase] = useState('start')
    const items = [
        { id: 't1', title: 'Tablo 1' },
        { id: 't2', title: 'Tablo 2' },
        { id: 't3', title: 'Tablo 3' },
    ]

    function handleSelect() {}
    function startGame() { setPhase('playing') }

    return (
        <div className="app-root">
            <Header />
            {phase === 'start' && <StartScreen onStart={startGame} />}
            {phase === 'playing' && (
                <GameBoard items={items} onSelect={handleSelect} disabled={false} />
            )}
        </div>
    )
}

export default App
