export default function StartScreen({ onStart }) {
    return (
        <section className="start-screen">
            <h2>Oyuna başlamak istiyor musunuz?</h2>
            <h3>Kurallar</h3>
            <ul className="rules">
                <li>Üç tablodan biri AI üretimi, ikisi gerçektir.</li>
                
            </ul>
            <button className="primary" onClick={onStart}>Başla</button>
        </section>
    );
}


