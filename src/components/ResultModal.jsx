export default function ResultModal({ isCorrect, onNext }) {
	const goToHome = () => {
		// Ana ekrana git fonksiyonu - App.jsx'te handle edilecek
		onNext('home');
	};

	const nextRound = () => {
		// Yeni tur başlat
		onNext('next');
	};

	return (
		<div className="result-modal-backdrop" role="dialog" aria-modal="true">
			<div className={`result-modal ${isCorrect ? 'success' : 'failure'}`}>
				<div className="result-icon">
					{isCorrect ? '🎉' : '😔'}
				</div>
				
				<div className="result-content">
					<h2 className="result-title">
						{isCorrect ? '🏆 Tebrikler!' : '💔 Maalesef!'}
					</h2>
					
					<p className="result-message">
						{isCorrect 
							? 'AI üretimini başarıyla tespit ettin! Harikasın!' 
							: 'Bu sefer olmadı ama vazgeçme! Bir sonraki turda daha dikkatli ol.'
						}
					</p>
					
					<div className="result-stats">
						{isCorrect ? (
							<div className="stat-success">
								<span className="stat-icon">✅</span>
								<span className="stat-text">Doğru Tahmin!</span>
							</div>
						) : (
							<div className="stat-failure">
								<span className="stat-icon">❌</span>
								<span className="stat-text">Yanlış Tahmin</span>
							</div>
						)}
					</div>
				</div>
				
				<div className="result-buttons">
					<button className="result-button secondary" onClick={goToHome}>
						<span className="button-icon">🏠</span>
						<span className="button-text">Ana Ekran</span>
					</button>
					
					<button className="result-button primary" onClick={nextRound}>
						<span className="button-icon">🚀</span>
						<span className="button-text">Yeni Tur</span>
					</button>
				</div>
			</div>
		</div>
	);
}


