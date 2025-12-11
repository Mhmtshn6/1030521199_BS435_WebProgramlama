const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

async function parseJsonOrThrow(res) {
	if (!res.ok) {
		const text = await res.text()
		throw new Error(text || `HTTP ${res.status}`)
	}
	return res.json()
}

export async function fetchRound({ difficulty, category }) {
	const res = await fetch(`${API_BASE}/round`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ difficulty, category }),
	})
	return parseJsonOrThrow(res)
}

export async function sendResult({ correct, attempts, score, difficulty, category }) {
	const res = await fetch(`${API_BASE}/result`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			correct,
			attempts,
			score,
			difficulty,
			category,
			finishedAt: new Date().toISOString(),
		}),
	})
	return parseJsonOrThrow(res)
}


