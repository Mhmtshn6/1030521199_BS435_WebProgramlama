import ImageCard from './ImageCard.jsx';

export default function GameBoard({ items, onSelect, disabled }) {
	return (
		<main className="tables-grid">
			{items.map((it) => (
				<ImageCard key={it.id} item={it} onSelect={onSelect} disabled={disabled} />
			))}
		</main>
	);
}


