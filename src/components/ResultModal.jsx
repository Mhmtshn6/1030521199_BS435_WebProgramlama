export default function ResultModal({ isCorrect, onNext }) {
	return (
		<div className="modal-backdrop" role="dialog" aria-modal="true">
			<div className="modal">
				<h3>{isCorrect ? 'Tebrikler! Doğru tahmin.' : 'Maalesef! Yanlış seçim.'}</h3>
				<p>{isCorrect ? 'Yeni bir tur başlatmak ister misiniz?' : 'Bir sonraki turda daha dikkatli bak!'}
				</p>
				<button className="primary" onClick={onNext}>Yeni Tur</button>
			</div>
		</div>
	);
}


