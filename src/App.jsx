import './App.css'

function App() {

  return (
    <div className="app-root">
      <header>
        <h1>Ai Resmi Seçme Oyunu Projesi </h1>
        <p>Aşağıdaki resimlerden hangisi yapay zeka tarafından üretilmiştir</p>
      </header>

      <main className="tables-grid">
        {[0, 1, 2].map((i) => (
          <section className="table-card" key={i}>
            <h2>Tablo {i + 1}</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Başlık 1</th>
                  <th>Başlık 2</th>
                  <th>Başlık 3</th>
                </tr>
              </thead>
              <tbody>
              </tbody>
            </table>

            <div className="table-actions">
              <button className="select-btn" onClick={() => { }}>
                Bu resmi seç
              </button>
            </div>
          </section>
        ))}
      </main>

      
    </div>
  )
}

export default App
