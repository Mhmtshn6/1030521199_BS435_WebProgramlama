export default function StartScreen({
    onStart,
    difficultyOptions,
    categoryOptions,
    difficulty,
    category,
    onDifficultyChange,
    onCategoryChange,
}) {
    const difficultyIcons = {
        'Kolay': '🟢',
        'Orta': '🟡', 
        'Zor': '🔴'
    }

    const categoryIcons = {
        'Manzara': '🏞️',
        'Hayvan': '🐾',
        'Nesne': '📦'
    }

    const difficultyDescriptions = {
        'Kolay': 'Süresiz oyun, rahat düşün',
        'Orta': '4 saniye + ikinci şans',
        'Zor': '4 saniye, tek şans!'
    }

    return (
        <section className="start-screen">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-icon">🤖✨</div>
                <h1 className="hero-title">AI Dedektifi</h1>
                <p className="hero-subtitle">Gerçek mi? Yapay mı? Sen karar ver!</p>
            </div>

            {/* Game Stats */}
            <div className="game-stats">
                <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-text">
                        <span className="stat-number">3</span>
                        <span className="stat-label">Görsel</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🧠</div>
                    <div className="stat-text">
                        <span className="stat-number">1</span>
                        <span className="stat-label">AI Üretimi</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⚡</div>
                    <div className="stat-text">
                        <span className="stat-number">2</span>
                        <span className="stat-label">Şans</span>
                    </div>
                </div>
            </div>

            {/* Game Rules */}
            <div className="rules-section">
                <h3 className="rules-title">📋 Nasıl Oynanır?</h3>
                <div className="rules-grid">
                    <div className="rule-card">
                        <div className="rule-icon">🔍</div>
                        <div className="rule-content">
                            <h4>Analiz Et</h4>
                            <p>3 görselden hangisinin AI üretimi olduğunu bul</p>
                        </div>
                    </div>
                    <div className="rule-card">
                        <div className="rule-icon">💡</div>
                        <div className="rule-content">
                            <h4>İpucu Al</h4>
                            <p>Yanlış tahminde ipucu alıp ikinci şansını kullan</p>
                        </div>
                    </div>
                    <div className="rule-card">
                        <div className="rule-icon">🏆</div>
                        <div className="rule-content">
                            <h4>Skor Kazan</h4>
                            <p>Doğru tahminlerle skorunu yükselt</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Difficulty Selection */}
            <div className="selection-section">
                <h3 className="selection-title">⚙️ Oyun Ayarları</h3>
                
                <div className="difficulty-cards">
                    <label className="difficulty-label">Zorluk Seviyesi</label>
                    <div className="difficulty-options">
                        {difficultyOptions.map((opt) => (
                            <div 
                                key={opt}
                                className={`difficulty-card ${difficulty === opt ? 'selected' : ''}`}
                                onClick={() => onDifficultyChange(opt)}
                            >
                                <div className="difficulty-icon">{difficultyIcons[opt]}</div>
                                <div className="difficulty-info">
                                    <span className="difficulty-name">{opt}</span>
                                    <span className="difficulty-desc">{difficultyDescriptions[opt]}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="category-cards">
                    <label className="category-label">Kategori Seçimi</label>
                    <div className="category-options">
                        {categoryOptions.map((opt) => (
                            <div 
                                key={opt}
                                className={`category-card ${category === opt ? 'selected' : ''}`}
                                onClick={() => onCategoryChange(opt)}
                            >
                                <div className="category-icon">{categoryIcons[opt]}</div>
                                <span className="category-name">{opt}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Start Button */}
            <div className="start-section">
                <button className="start-button" onClick={onStart}>
                    <span className="start-icon">🚀</span>
                    <span className="start-text">Oyuna Başla</span>
                </button>
                <p className="start-hint">Hazır mısın? AI'yi yakalayalım!</p>
            </div>
        </section>
    );
}


