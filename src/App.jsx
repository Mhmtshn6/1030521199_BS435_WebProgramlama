import './App.css'
import { useState } from 'react'
import Header from './components/Header.jsx'
import GameBoard from './components/GameBoard.jsx'
import StartScreen from './components/StartScreen.jsx'

function App() {
    const difficultyOptions = ['Kolay', 'Orta', 'Zor']
    const categoryOptions = ['Manzara', 'Portre', 'Nesne']

    const [phase, setPhase] = useState('start')
    const [difficulty, setDifficulty] = useState(difficultyOptions[0])
    const [category, setCategory] = useState(categoryOptions[0])

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
            {phase === 'start' && (
                <StartScreen
                    onStart={startGame}
                    difficultyOptions={difficultyOptions}
                    categoryOptions={categoryOptions}
                    difficulty={difficulty}
                    category={category}
                    onDifficultyChange={setDifficulty}
                    onCategoryChange={setCategory}
                />
            )}
            {phase === 'playing' && (
                <>
                    <div className="mode-summary">
                        <span>Zorluk: {difficulty}</span>
                        <span>Kategori: {category}</span>
                    </div>
                    <GameBoard items={items} onSelect={handleSelect} disabled={false} />
                </>
            )}
        </div>
    )
}

export default App
