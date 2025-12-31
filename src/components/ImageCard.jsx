export default function ImageCard({ item, onSelect, disabled, isCorrect, isSelected, showResults }) {
	const handleClick = () => {
		if (!disabled) {
			onSelect(item.id);
		}
	};

	// Durumu belirle
	const getCardStatus = () => {
		if (!showResults && !isSelected) {
			return 'ready'; // Seçilebilir
		}
		if (!showResults && isSelected) {
			return 'selected'; // Seçildi ama sonuç henüz belli değil
		}
		if (showResults && isCorrect === true) {
			return 'correct'; // Doğru seçim
		}
		if (showResults && isCorrect === false && isSelected) {
			return 'wrong'; // Yanlış seçim
		}
		return 'neutral'; // Diğer durumlar
	};

	const cardStatus = getCardStatus();

	return (
		<div 
			className={`modern-image-card ${disabled ? 'disabled' : 'clickable'} ${cardStatus}`}
			onClick={handleClick}
		>
			<div className="image-container">
				<img 
					src={item.imageUrl} 
					alt={item.title}
					className="card-image"
					onError={(e) => {
						console.error('Görsel yüklenemedi:', item.imageUrl);
						e.target.style.display = 'none';
					}}
				/>
				
				{/* Hover Overlay */}
				{!disabled && cardStatus === 'ready' && (
					<div className="image-overlay">
						<div className="overlay-content">
							<div className="click-icon">👆</div>
							<span className="click-text">Tıkla</span>
						</div>
					</div>
				)}
				
				{/* Selection Indicators */}
				{cardStatus === 'selected' && (
					<div className="selection-indicator selected">
						<div className="indicator-icon">⭕</div>
					</div>
				)}
				
				{cardStatus === 'correct' && (
					<div className="selection-indicator correct">
						<div className="indicator-icon">✅</div>
					</div>
				)}
				
				{cardStatus === 'wrong' && (
					<div className="selection-indicator wrong">
						<div className="indicator-icon">❌</div>
					</div>
				)}
			</div>
			
			<div className="card-footer">
				<div className="card-status">
					{cardStatus === 'ready' && (
						<span className="status-ready">👆 Seçmek için tıkla</span>
					)}
					{cardStatus === 'selected' && (
						<span className="status-selected">⭕ Seçildi</span>
					)}
					{cardStatus === 'correct' && (
						<span className="status-correct">🎉 Doğru!</span>
					)}
					{cardStatus === 'wrong' && (
						<span className="status-wrong">💔 Yanlış</span>
					)}
					{cardStatus === 'neutral' && showResults && (
						<span className="status-neutral">⚪ Seçilmedi</span>
					)}
				</div>
			</div>
		</div>
	);
}

