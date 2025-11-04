export default function ImageCard({ item, onSelect, disabled }) {
	return (
		<section className="table-card">
			<h2>{item.title}</h2>
			<table className="data-table">
				<thead>
					<tr>
						<th>Başlık 1</th>
						<th>Başlık 2</th>
						<th>Başlık 3</th>
					</tr>
				</thead>
				<tbody></tbody>
			</table>
			<div className="table-actions">
				<button className="select-btn" disabled={disabled} onClick={() => onSelect(item.id)}>
					Bu resmi seç
				</button>
			</div>
		</section>
	);
}


