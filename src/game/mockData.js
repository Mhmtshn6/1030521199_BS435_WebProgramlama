export function generateMockRound() {
	const base = [
		{ id: 'a', title: 'Görsel 1', url: 'https://picsum.photos/seed/real1/360/220', ai: false },
		{ id: 'b', title: 'Görsel 2', url: 'https://picsum.photos/seed/real2/360/220', ai: false },
		{ id: 'c', title: 'Görsel 3', url: 'https://picsum.photos/seed/real3/360/220', ai: false },
	]
	const aiIndex = Math.floor(Math.random() * 3)
	const items = base.map((it, idx) => ({ ...it, ai: idx === aiIndex }))
	const correctId = items[aiIndex].id
	return { items, correctId }
}


