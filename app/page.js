export default function HomePage() {
  return (
    <div className="home">
      <h1>Backpropagation Playground</h1>
      <p>
        Explore the backpropagation algorithm through interactive, from-scratch neural network
        demos. Tweak learning rate, architecture, and training steps, and see gradients shape
        decision boundaries and fits in real-time.
      </p>
      <div className="cards">
        <a className="card" href="/examples/xor">
          <h3>XOR</h3>
          <p>Train a tiny MLP to solve the classic XOR problem.</p>
        </a>
        <a className="card" href="/examples/regression">
          <h3>Linear Regression</h3>
          <p>Fit a noisy line with gradient descent and MSE loss.</p>
        </a>
        <a className="card" href="/examples/classifier">
          <h3>2D Classifier</h3>
          <p>Classify two interleaving moons with a small MLP.</p>
        </a>
      </div>
      <section className="section">
        <h2>What you can control</h2>
        <ul>
          <li>Learning rate, epochs, batch size</li>
          <li>Hidden layer width and activation</li>
          <li>Random seed and dataset size</li>
        </ul>
      </section>
    </div>
  );
}
