export default function ImageCard({ item, onSelect, disabled }) {
	return (
		<section className="table-card">
			<h2>{item.title}</h2>
			<div className="image-box">
				<img src={item.imageUrl} alt={item.title} />
			</div>
			<p className="image-description">{item.description}</p>
			<div className="table-actions">
				<button className="select-btn" disabled={disabled} onClick={() => onSelect(item.id)}>
					Bu resmi seç
				</button>
			</div>
		</section>
	);
}

