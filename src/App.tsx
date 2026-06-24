import { BagCanvas, ProductList, Toolbar, Summary, BagPreview } from './components';
import './App.css';

function App() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      padding: '20px', 
      boxSizing: 'border-box',
      fontFamily: 'Inter, sans-serif'
    }}>
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Bag Packing Configurator POC</h1>
      </header>

      <main style={{ display: 'flex', flex: 1, gap: '20px', minHeight: 0 }}>
        {/* Left Side: Bag Preview */}
        <section style={{ 
          flex: '1 1 25%', 
          border: '1px solid #ddd', 
          padding: '15px', 
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}>
          <BagPreview />
        </section>

        {/* Center: Interactive SVG Layout */}
        <section style={{ 
          flex: '1 1 50%', 
          border: '1px solid #ddd', 
          padding: '15px', 
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <BagCanvas />
        </section>

        {/* Right Side: Product Selection & Summary */}
        <section style={{ 
          flex: '1 1 25%', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px' 
        }}>
          <div style={{ 
            flex: 1, 
            border: '1px solid #ddd', 
            padding: '15px', 
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <ProductList />
          </div>
          <div style={{ 
            border: '1px solid #ddd', 
            padding: '15px', 
            borderRadius: '8px' 
          }}>
            <Summary />
          </div>
        </section>
      </main>

      {/* Bottom: Toolbar */}
      <footer style={{ marginTop: '20px' }}>
        <Toolbar />
      </footer>
    </div>
  );
}

export default App;
