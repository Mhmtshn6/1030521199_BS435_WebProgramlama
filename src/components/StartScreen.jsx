export default function StartScreen({
    onStart,
    difficultyOptions,
    categoryOptions,
    difficulty,
    category,
    onDifficultyChange,
    onCategoryChange,
}) {
    return (
        <section className="start-screen">
            <h2>Oyuna başlamak istiyor musunuz?</h2>
            <h3>Kurallar</h3>
            <ul className="rules">
                <li>Üç tablodan biri AI üretimi, ikisi gerçektir.</li>
            </ul>
            <div className="mode-form">
                <label>
                    Zorluk
                    <select value={difficulty} onChange={(e) => onDifficultyChange(e.target.value)}>
                        {difficultyOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </label>
                <label>
                    Kategori
                    <select value={category} onChange={(e) => onCategoryChange(e.target.value)}>
                        {categoryOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </label>
            </div>
            <button className="primary" onClick={onStart}>Başla</button>
        </section>
    );
}


