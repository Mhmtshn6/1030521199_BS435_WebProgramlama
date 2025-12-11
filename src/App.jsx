import './App.css'
import { useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import GameBoard from './components/GameBoard.jsx'
import StartScreen from './components/StartScreen.jsx'
import ResultModal from './components/ResultModal.jsx'
import { generateMockRound } from './game/mockData.js'
import { fetchRound, sendResult } from './api/client.js'

function App() {
    const difficultyOptions = ['Kolay', 'Orta', 'Zor']
    const categoryOptions = ['Manzara', 'Portre', 'Nesne']

    const [phase, setPhase] = useState('start')
    const [useBackend, setUseBackend] = useState(false)
    const [difficulty, setDifficulty] = useState(difficultyOptions[0])
    const [category, setCategory] = useState(categoryOptions[0])
    const [round, setRound] = useState(null)
    const [guesses, setGuesses] = useState([])
    const [hintMessage, setHintMessage] = useState('')
    const [score, setScore] = useState(0)
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function beginRound() {
        setLoading(true)
        setError('')
        try {
            let nextRound
            if (useBackend) {
                nextRound = await fetchRound({ difficulty, category })
            } else {
                nextRound = generateMockRound({ difficulty, category })
            }
            setRound(nextRound)
            setGuesses([])
            setHintMessage('')
            setResult(null)
            setPhase('playing')
        } catch (err) {
            setError('Sunucuya bağlanırken sorun oluştu. Mock veriyle devam ediyoruz.')
            const fallback = generateMockRound({ difficulty, category })
            setRound(fallback)
            setGuesses([])
            setHintMessage('')
            setResult(null)
            setPhase('playing')
        } finally {
            setLoading(false)
        }
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

    useEffect(() => {
        async function handleSendResult() {
            if (!useBackend || !round || !result || phase !== 'result') return
            const payload = {
                correct: result === 'win',
                attempts: guesses.length,
                score,
                difficulty,
                category,
            }
            try {
                await sendResult(payload)
            } catch (err) {
                // Sessiz geç; UI'yı kilitleme
            }
        }
        handleSendResult()
    }, [useBackend, round, result, phase, guesses.length, score, difficulty, category])

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
                    useBackend={useBackend}
                    onToggleBackend={setUseBackend}
                />
            )}
            {phase !== 'start' && (
                <>
                    <div className="mode-summary">
                        <span>Zorluk: {difficulty}</span>
                        <span>Kategori: {category}</span>
                        <span>Skor: {score}</span>
                        <span>Kaynak: {useBackend ? 'Backend' : 'Mock'}</span>
                    </div>
                    {loading && <div className="status-panel"><span>Yükleniyor...</span></div>}
                    {error && <div className="error-banner">{error}</div>}
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
