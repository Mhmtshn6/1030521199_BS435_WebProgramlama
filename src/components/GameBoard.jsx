import ImageCard from './ImageCard.jsx';

export default function GameBoard({ items, onSelect, disabled, lockedIds = [], correctId, showResults = false }) {
	return (
		<main className="tables-grid">
			{items.map((it) => (
				<ImageCard
					key={it.id}
					item={it}
					onSelect={onSelect}
					disabled={disabled || lockedIds.includes(it.id)}
					isCorrect={showResults ? it.id === correctId : null}
					isSelected={lockedIds.includes(it.id)}
					showResults={showResults}
				/>
			))}
		</main>
	);
}


