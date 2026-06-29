import { useState, useEffect } from "react";
import {
  BagCanvas,
  ProductList,
  Toolbar,
  Summary,
  BagPreview,
} from "./components";
import { styles } from "./styles/appStyles";
import "./App.css";

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);

    // Patch pushState and replaceState to trigger re-renders on route changes
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (
      data: any,
      unused: string,
      url?: string | URL | null,
    ) {
      originalPushState.call(this, data, unused, url);
      handleLocationChange();
    };

    window.history.replaceState = function (
      data: any,
      unused: string,
      url?: string | URL | null,
    ) {
      originalReplaceState.call(this, data, unused, url);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);



  const isDebug = currentPath.includes("debug");

  return (
    <div style={styles.appContainer}>
      {/* Top Header / Navigation Bar */}
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <div style={styles.logoBox}>P</div>
          <div>
            <h1 style={styles.appName}>Pastael Configurator</h1>
            <span style={styles.appSubtitle}>POC Bag Packing System</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div style={styles.mainContentArea}>
        {isDebug ? (
          /* Debug View: Full 3-column display */
          <div style={styles.layoutGrid}>
            {/* Left Side: Bag Preview & Diagnostics */}
            <section style={styles.debugPreviewSection}>
              <BagPreview />
            </section>

            {/* Center: Interactive SVG/Fabric.js Canvas */}
            <section style={styles.canvasSectionBase}>
              <div style={styles.canvasHeaderRow}>
                <h3 style={styles.canvasTitle}>Interactive Layout</h3>
                <span style={styles.canvasSubtitle}>
                  Drag & drop items to edit placement
                </span>
              </div>
              <div style={styles.canvasWrapper}>
                <BagCanvas />
              </div>
              <div style={{ marginTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "12px" }}>
                <Toolbar />
              </div>
            </section>

            {/* Right Side: Product Selection & Summary */}
            <section style={styles.rightSectionBase}>
              <div style={styles.productListCard}>
                <ProductList />
              </div>
              <div style={styles.summaryCard}>
                <Summary />
              </div>
            </section>
          </div>
        ) : (
          /* Main Configurator View: 2-column layout containing visual canvas and selection/summary panels */
          <div style={styles.layoutGrid}>
            {/* Left/Center: Visual suitcase canvas preview */}
            <section style={{ ...styles.canvasSectionBase, flex: "1 1 70%" }}>
              <div style={styles.canvasHeaderRow}>
                <h3 style={styles.canvasTitle}>Interactive Layout</h3>
                <span style={styles.canvasSubtitle}>
                  See how packing cubes fit in your bag
                </span>
              </div>
              <div style={styles.canvasWrapper}>
                <BagCanvas />
              </div>
              <div style={{ marginTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "12px" }}>
                <Toolbar />
              </div>
            </section>

            {/* Right Side: Product Selection, Summary, and Diagnostics CTA */}
            <section style={{ ...styles.rightSectionBase, flex: "1 1 30%" }}>
              <div style={styles.productListCard}>
                <ProductList />
              </div>
              <div style={styles.summaryCard}>
                <Summary />
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
