const hintByCategory = {
	Manzara: [
		'Horizon çizgisinde tutarsızlık var mı bak.',
		'Ağaç ve taş gibi tekrar eden dokulara odaklan.',
	],
	Portre: [
		'Gözlerdeki ışık yansımaları doğal mı kontrol et.',
		'Yüz simetrisi fazla kusursuz mu incele.',
	],
	Nesne: [
		'Yansımalar fiziksel olarak doğru mu değerlendir.',
		'Metal veya plastik yüzeylerde garip desenler var mı bak.',
	],
}

const hintByDifficulty = {
	Kolay: ['Parlak alanlara dikkat et.', 'Belirsiz kenarlar var mı kontrol et.'],
	Orta: ['Gölge yönleri birbiriyle uyumlu mu bak.', 'Farklı materyallerin geçişlerini incele.'],
	Zor: ['Doku tekrarlarında hata var mı arama.', 'Işık kaynaklarını karşılaştır.'],
}

export function generateMockRound({ difficulty, category }) {
	const base = [
		{ id: 'a', title: `${category} Tablosu 1` },
		{ id: 'b', title: `${category} Tablosu 2` },
		{ id: 'c', title: `${category} Tablosu 3` },
	]
	const aiIndex = Math.floor(Math.random() * base.length)
	const items = base.map((item, idx) => ({ ...item, ai: idx === aiIndex }))
	const correctId = items[aiIndex].id
	const categoryHints = hintByCategory[category] ?? []
	const difficultyHints = hintByDifficulty[difficulty] ?? []
	const combined = [...categoryHints, ...difficultyHints]
	const hint = combined[Math.floor(Math.random() * combined.length)] ?? 'Detayları incele.'
	return { items, correctId, hint }
}


