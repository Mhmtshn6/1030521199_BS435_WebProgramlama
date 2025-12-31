export default function CelebrationScreen({ score }) {
	return (
		<div className="celebration-screen">
			<div className="celebration-content">
				<div className="celebration-icon">🎉</div>
				<h2 className="celebration-title">Tebrikler!</h2>
				<p className="celebration-message">Doğru tahmin! AI'yi yakaladın!</p>
				<div className="celebration-score">
					<span className="score-label">Skorun:</span>
					<span className="score-value">{score}</span>
				</div>
				<div className="celebration-next">
					<div className="loading-animation">
						<div className="loading-dot"></div>
						<div className="loading-dot"></div>
						<div className="loading-dot"></div>
					</div>
					<p className="next-message">Yeni soru geliyor...</p>
				</div>
			</div>
		</div>
	);
}