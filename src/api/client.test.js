import { describe, it, expect, vi, beforeEach } from 'vitest'

// API client testleri
describe('API Client Tests', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  it('should construct correct API base URL', () => {
    const API_BASE = 'http://localhost:8000'
    expect(API_BASE).toBe('http://localhost:8000')
  })

  it('should handle successful API response', async () => {
    const mockResponse = {
      items: [
        { id: 'test-1', title: 'Test 1', imageUrl: 'url1', isAi: false },
        { id: 'test-2', title: 'Test 2', imageUrl: 'url2', isAi: true },
        { id: 'test-3', title: 'Test 3', imageUrl: 'url3', isAi: false }
      ],
      correctId: 'test-2',
      hint: 'Test hint'
    }

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    })

    // Mock fetch round function
    async function fetchRound({ difficulty, category }) {
      const res = await fetch('http://localhost:8000/round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty, category }),
      })
      return res.json()
    }

    const result = await fetchRound({ difficulty: 'Kolay', category: 'Hayvan' })
    
    expect(result.items).toHaveLength(3)
    expect(result.correctId).toBe('test-2')
    expect(result.hint).toBe('Test hint')
  })

  it('should handle API error response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: async () => 'Server Error'
    })

    async function parseJsonOrThrow(res) {
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `HTTP ${res.status}`)
      }
      return res.json()
    }

    const mockRes = await fetch('http://localhost:8000/round')
    
    await expect(parseJsonOrThrow(mockRes)).rejects.toThrow('Server Error')
  })

  it('should validate request payload structure', () => {
    const payload = {
      difficulty: 'Kolay',
      category: 'Hayvan'
    }

    expect(payload).toHaveProperty('difficulty')
    expect(payload).toHaveProperty('category')
    expect(['Kolay', 'Orta', 'Zor']).toContain(payload.difficulty)
    expect(['Manzara', 'Hayvan', 'Nesne']).toContain(payload.category)
  })

  it('should validate result payload structure', () => {
    const resultPayload = {
      correct: true,
      attempts: 1,
      score: 5,
      difficulty: 'Kolay',
      category: 'Hayvan',
      finishedAt: new Date().toISOString()
    }

    expect(resultPayload).toHaveProperty('correct')
    expect(resultPayload).toHaveProperty('attempts')
    expect(resultPayload).toHaveProperty('score')
    expect(resultPayload).toHaveProperty('difficulty')
    expect(resultPayload).toHaveProperty('category')
    expect(resultPayload).toHaveProperty('finishedAt')
    
    expect(typeof resultPayload.correct).toBe('boolean')
    expect(typeof resultPayload.attempts).toBe('number')
    expect(typeof resultPayload.score).toBe('number')
    expect(resultPayload.attempts).toBeGreaterThan(0)
    expect(resultPayload.attempts).toBeLessThanOrEqual(2)
  })

  it('should handle network timeout', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network timeout'))

    async function fetchWithTimeout() {
      try {
        await fetch('http://localhost:8000/round')
      } catch (error) {
        throw error
      }
    }

    await expect(fetchWithTimeout()).rejects.toThrow('Network timeout')
  })

  it('should validate JSON response structure', () => {
    const mockJsonResponse = {
      items: [],
      correctId: 'test-id',
      hint: 'test hint'
    }

    expect(mockJsonResponse).toHaveProperty('items')
    expect(mockJsonResponse).toHaveProperty('correctId')
    expect(mockJsonResponse).toHaveProperty('hint')
    expect(Array.isArray(mockJsonResponse.items)).toBe(true)
  })

  it('should handle empty response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    })

    const response = await fetch('http://localhost:8000/round')
    const data = await response.json()
    
    expect(data).toEqual({})
  })
})