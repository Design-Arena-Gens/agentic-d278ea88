import './globals.css';

export const metadata = {
  title: 'Backpropagation Playground',
  description: 'Interactive backpropagation demos: XOR, regression, classifier',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container">
            <a href="/" className="brand">Backpropagation Playground</a>
            <nav className="nav">
              <a href="/examples/xor">XOR</a>
              <a href="/examples/regression">Regression</a>
              <a href="/examples/classifier">2D Classifier</a>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="site-footer">
          <div className="container">
            <span>Built for interactive learning. No frameworks beyond Next/React.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
