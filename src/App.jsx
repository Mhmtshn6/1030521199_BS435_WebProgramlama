import './App.css'
import { useEffect, useState, useRef } from 'react'
import Header from './components/Header.jsx'
import GameBoard from './components/GameBoard.jsx'
import StartScreen from './components/StartScreen.jsx'
import ResultModal from './components/ResultModal.jsx'
import CelebrationScreen from './components/CelebrationScreen.jsx'
import { fetchRound, sendResult } from './api/client.js'

function App() {
    const difficultyOptions = ['Kolay', 'Orta', 'Zor']
    const categoryOptions = ['Manzara', 'Hayvan', 'Nesne']

    const [phase, setPhase] = useState('start')
    const [difficulty, setDifficulty] = useState(difficultyOptions[0])
    const [category, setCategory] = useState(categoryOptions[0])
    const [round, setRound] = useState(null)
    const [guesses, setGuesses] = useState([])
    const [hintMessage, setHintMessage] = useState('')
    const [score, setScore] = useState(0)
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [timeLeft, setTimeLeft] = useState(null)
    
    const timerRef = useRef(null)

    function getTimeLimit() {
        if (difficulty === 'Orta') return 4  // Orta: 4 saniye
        if (difficulty === 'Zor') return 4   // Zor: 4 saniye (ama tek şans)
        return null // Kolay: süresiz
    }

    async function beginRound() {
        setLoading(true)
        setError('')
        try {
            const nextRound = await fetchRound({ difficulty, category })
            setRound(nextRound)
            setGuesses([])
            setHintMessage('')
            setResult(null)
            setPhase('playing')
            const timeLimit = getTimeLimit()
            setTimeLeft(timeLimit)
        } catch (err) {
            setError('Sunucuya bağlanırken sorun oluştu. Lütfen backend\'in çalıştığından emin olun.')
            setPhase('start')
        } finally {
            setLoading(false)
        }
    }

    function handleSelect(id) {
        if (!round || result || guesses.includes(id)) return
        
        // Timer'ı durdur
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
        setTimeLeft(null)
        
        const attemptNumber = guesses.length + 1
        const nextGuesses = [...guesses, id]
        setGuesses(nextGuesses)
        
        if (id === round.correctId) {
            // Doğru tahmin!
            setScore((prev) => prev + 1)
            setResult('win')
            setPhase('celebrating') // Yeni phase: kutlama
            
            // 2 saniye sonra otomatik yeni tur başlat
            setTimeout(() => {
                beginRound()
            }, 2000)
            return
        }
        
        if (attemptNumber === 1) {
            setHintMessage(round.hint)
            const timeLimit = getTimeLimit()
            setTimeLeft(timeLimit)
        } else {
            setResult('lose')
            setPhase('result')
        }
    }

    function goToNextRound(action = 'next') {
        // Timer'ı temizle
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
        
        if (action === 'home') {
            // Ana ekrana git
            setPhase('start')
            setRound(null)
            setGuesses([])
            setHintMessage('')
            setResult(null)
            setTimeLeft(null)
            setError('')
            setScore(0) // Skoru sıfırla
        } else {
            // Yeni tur başlat
            if (result === 'lose' || result === 'timeout') {
                setScore(0)
            }
            beginRound()
        }
    }

    useEffect(() => {
        async function handleSendResult() {
            if (!round || !result || phase !== 'result') return
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
                console.error('Sonuç kaydedilemedi:', err)
            }
        }
        handleSendResult()
    }, [round, result, phase, guesses.length, score, difficulty, category])

    // Timer fonksiyonu
    function handleTimeUp() {
        if (!round) return
        const attemptNumber = guesses.length + 1
        
        if (difficulty === 'Zor') {
            // ZOR MOD: Süre bitince direkt ana ekrana dön (tek şans)
            setResult('timeout')
            setScore(0) // Skor sıfırla
            setTimeLeft(null)
            
            // Timer'ı temizle
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
            
            setTimeout(() => {
                setPhase('start')
                setRound(null)
                setGuesses([])
                setHintMessage('')
                setResult(null)
                setError('')
            }, 2000)
        } else if (difficulty === 'Orta') {
            if (attemptNumber === 1) {
                // ORTA MOD: İlk denemede süre bittiyse ipucu ver ve ikinci şans
                setGuesses(['timeout'])
                setHintMessage(round.hint)
                const timeLimit = getTimeLimit()
                setTimeLeft(timeLimit)
            } else {
                // ORTA MOD: İkinci denemede süre bittiyse direkt ana ekrana dön
                setResult('timeout')
                setScore(0) // Skor sıfırla
                setTimeLeft(null)
                
                // Timer'ı temizle
                if (timerRef.current) {
                    clearInterval(timerRef.current)
                    timerRef.current = null
                }
                
                setTimeout(() => {
                    setPhase('start')
                    setRound(null)
                    setGuesses([])
                    setHintMessage('')
                    setResult(null)
                    setError('')
                }, 2000)
            }
        }
    }

    useEffect(() => {
        // Timer'ı temizle
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
        
        // Oyun oynamıyorsa veya süre yoksa timer başlatma
        if (phase !== 'playing' || timeLeft === null || result) return
        
        // Timer başlat
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === null) return null
                if (prev <= 1) {
                    // Süre bitti, handleTimeUp çağır
                    setTimeout(handleTimeUp, 0)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
        }
    }, [phase, timeLeft, round, result, guesses.length])

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
                    {loading && <div className="status-panel"><span>Yükleniyor...</span></div>}
                    {error && <div className="error-banner">{error}</div>}
                    {phase === 'playing' && (
                        <>
                            <div className="status-panel">
                                <span>Deneme: {guesses.length + 1}/2</span>
                                {guesses.length === 1 && <span>İkinci şansın kaldı.</span>}
                                {timeLeft !== null && (
                                    <span className={timeLeft <= 3 ? 'timer-warning' : ''}>
                                        Süre: {timeLeft}s
                                    </span>
                                )}
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
                                    correctId={round.correctId}
                                    showResults={false}
                                />
                            )}
                        </>
                    )}
                    {phase === 'celebrating' && (
                        <CelebrationScreen score={score} />
                    )}
                    {phase === 'result' && round && (
                        <>
                            <GameBoard
                                items={round.items}
                                onSelect={() => {}}
                                disabled={true}
                                lockedIds={guesses}
                                correctId={round.correctId}
                                showResults={true}
                            />
                            <ResultModal isCorrect={result === 'win'} onNext={goToNextRound} />
                        </>
                    )}
                    {result === 'timeout' && (
                        <div className="timeout-message">
                            <div className="timeout-card">
                                <h3>⏰ {difficulty === 'Zor' ? 'Oyun Bitti!' : 'Süre Bitti!'}</h3>
                                <p>
                                    {difficulty === 'Zor' 
                                        ? 'Zor modda süre doldu! Ana ekrana dönülüyor...' 
                                        : 'Maalesef süre doldu. Ana ekrana dönülüyor...'
                                    }
                                </p>
                                <div className="loading-dots">
                                    <span>.</span><span>.</span><span>.</span>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
    </div>
  )
}

export default App
