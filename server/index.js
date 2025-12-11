import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/api/ping', (req, res) => {
  res.json({ ok: true, message: 'pong' })
})
app.get('/api/tables', (req, res) => {
  res.json({ tables: [[], [], []] })
})

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
