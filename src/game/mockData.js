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

const imagesByCategory = {
	Manzara: [
		{
			id: 'a',
			title: 'Dağ manzarası',
			description: 'Uzakta karla kaplı dağlar ve ön planda göl.',
			imageUrl: 'https://picsum.photos/seed/mountain-real-1/480/320',
		},
		{
			id: 'b',
			title: 'Orman patikası',
			description: 'Ağaçların arasından geçen dar bir yol.',
			imageUrl: 'https://picsum.photos/seed/forest-real-2/480/320',
		},
		{
			id: 'c',
			title: 'Sahilde gün batımı',
			description: 'Ufukta turuncu tonlarda güneş batışı.',
			imageUrl: 'https://picsum.photos/seed/beach-real-3/480/320',
		},
	],
	Portre: [
		{
			id: 'a',
			title: 'Genç kadın portresi',
			description: 'Stüdyoda çekilmiş yumuşak ışıklı portre.',
			imageUrl: 'https://picsum.photos/seed/portrait-real-1/480/320',
		},
		{
			id: 'b',
			title: 'Yaşlı adam portresi',
			description: 'Yüz çizgileri belirgin, karakteristik bir ifade.',
			imageUrl: 'https://picsum.photos/seed/portrait-real-2/480/320',
		},
		{
			id: 'c',
			title: 'Profil portre',
			description: 'Yandan görünüm, saç detayları önde.',
			imageUrl: 'https://picsum.photos/seed/portrait-real-3/480/320',
		},
	],
	Nesne: [
		{
			id: 'a',
			title: 'Metal kahve fincanı',
			description: 'Parlak yansımalar içeren metal bir fincan.',
			imageUrl: 'https://picsum.photos/seed/object-real-1/480/320',
		},
		{
			id: 'b',
			title: 'Masa lambası',
			description: 'Ahşap masa üzerinde duran basit bir lamba.',
			imageUrl: 'https://picsum.photos/seed/object-real-2/480/320',
		},
		{
			id: 'c',
			title: 'Kitap yığını',
			description: 'Farklı renklerde kapaklara sahip birkaç kitap.',
			imageUrl: 'https://picsum.photos/seed/object-real-3/480/320',
		},
	],
}

export function generateMockRound({ difficulty, category }) {
	const baseList = imagesByCategory[category] ?? imagesByCategory.Manzara
	const aiIndex = Math.floor(Math.random() * baseList.length)
	const items = baseList.map((item, idx) => ({
		...item,
		isAi: idx === aiIndex,
	}))
	const correctId = items[aiIndex].id
	const categoryHints = hintByCategory[category] ?? []
	const difficultyHints = hintByDifficulty[difficulty] ?? []
	const combined = [...categoryHints, ...difficultyHints]
	const hint = combined[Math.floor(Math.random() * combined.length)] ?? 'Detayları incele.'
	return { items, correctId, hint }
}

