import './App.css'
import { useState } from 'react'
import Header from './components/Header.jsx'
import GameBoard from './components/GameBoard.jsx'
import StartScreen from './components/StartScreen.jsx'
import ResultModal from './components/ResultModal.jsx'
import { generateMockRound } from './game/mockData.js'

function App() {
    const difficultyOptions = ['Kolay', 'Orta', 'Zor']
    const categoryOptions = ['Manzara', 'Portre', 'Nesne']

    const [phase, setPhase] = useState('start')
    const [difficulty, setDifficulty] = useState(difficultyOptions[0])
    const [category, setCategory] = useState(categoryOptions[0])
    const [round, setRound] = useState(null)
    const [guesses, setGuesses] = useState([])
    const [hintMessage, setHintMessage] = useState('')
    const [score, setScore] = useState(0)
    const [result, setResult] = useState(null)

    function beginRound() {
        const nextRound = generateMockRound({ difficulty, category })
        setRound(nextRound)
        setGuesses([])
        setHintMessage('')
        setResult(null)
        setPhase('playing')
    }

    function handleSelect(id) {
        if (!round || result || guesses.includes(id)) return
        const attemptNumber = guesses.length + 1
        const nextGuesses = [...guesses, id]
        setGuesses(nextGuesses)
        if (id === round.correctId) {
            setScore((prev) => prev + 1)
            setResult('win')
            setPhase('result')
            return
        }
        if (attemptNumber === 1) {
            setHintMessage(round.hint)
        } else {
            setResult('lose')
            setPhase('result')
        }
    }

    function goToNextRound() {
        if (result === 'lose') {
            setScore(0)
        }
        beginRound()
    }

    return (
        <div className="app-root">
            <Header />
            {phase === 'start' && (
                <StartScreen
                    onStart={beginRound}
                    difficultyOptions={difficultyOptions}
                    categoryOptions={categoryOptions}
                    difficulty={difficulty}
                    category={category}
                    onDifficultyChange={setDifficulty}
                    onCategoryChange={setCategory}
                />
            )}
            {phase !== 'start' && (
                <>
                    <div className="mode-summary">
                        <span>Zorluk: {difficulty}</span>
                        <span>Kategori: {category}</span>
                        <span>Skor: {score}</span>
                    </div>
                    {phase === 'playing' && (
                        <>
                            <div className="status-panel">
                                <span>Deneme: {guesses.length + 1}/2</span>
                                {guesses.length === 1 && <span>İkinci şansın kaldı.</span>}
                            </div>
                            {hintMessage && (
                                <div className="hint-card">
                                    <strong>İpucu:</strong> {hintMessage}
                                </div>
                            )}
                            {round && (
                                <GameBoard
                                    items={round.items}
                                    onSelect={handleSelect}
                                    disabled={false}
                                    lockedIds={guesses}
                                />
                            )}
                        </>
                    )}
                    {phase === 'result' && round && (
                        <>
                            <GameBoard
                                items={round.items}
                                onSelect={() => {}}
                                disabled={true}
                                lockedIds={guesses}
                            />
                            <ResultModal isCorrect={result === 'win'} onNext={goToNextRound} />
                        </>
                    )}
                </>
            )}
        </div>
    )
}

export default App
