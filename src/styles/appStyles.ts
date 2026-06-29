import React from "react";

export const styles = {
  appContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    background: "#0c0d12",
    color: "#f8f9fa",
    fontFamily: "'Outfit', 'Inter', sans-serif",
    overflow: "hidden",
  } as React.CSSProperties,

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 40px",
    background: "rgba(18, 20, 29, 0.75)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    zIndex: 10,
  } as React.CSSProperties,

  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  } as React.CSSProperties,

  logoBox: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #6366f1, #a855f7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "1.2rem",
    boxShadow: "0 0 15px rgba(99, 102, 241, 0.4)",
  } as React.CSSProperties,

  appName: {
    margin: 0,
    fontSize: "1.4rem",
    fontWeight: 700,
    background: "linear-gradient(to right, #ffffff, #a5b4fc)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  } as React.CSSProperties,

  appSubtitle: {
    fontSize: "0.75rem",
    color: "#64748b",
    display: "block",
  } as React.CSSProperties,

  navContainer: {
    display: "flex",
    gap: "8px",
    background: "rgba(255, 255, 255, 0.03)",
    padding: "6px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
  } as React.CSSProperties,

  navButtonBase: {
    padding: "8px 20px",
    borderRadius: "8px",
    border: "none",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  } as React.CSSProperties,

  mainContentArea: {
    flex: 1,
    padding: "24px 40px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  } as React.CSSProperties,

  layoutGrid: {
    display: "flex",
    flex: 1,
    gap: "24px",
    minHeight: 0,
  } as React.CSSProperties,

  debugPreviewSection: {
    flex: "1 1 25%",
    background: "rgba(18, 20, 29, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "20px",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    backdropFilter: "blur(8px)",
  } as React.CSSProperties,

  canvasSectionBase: {
    background: "rgba(18, 20, 29, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "20px",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    backdropFilter: "blur(8px)",
  } as React.CSSProperties,

  canvasHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  } as React.CSSProperties,

  canvasTitle: {
    margin: 0,
    fontSize: "1.2rem",
    fontWeight: 600,
  } as React.CSSProperties,

  canvasSubtitle: {
    fontSize: "0.8rem",
    color: "#64748b",
  } as React.CSSProperties,

  canvasWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  } as React.CSSProperties,

  rightSectionBase: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    minHeight: 0,
  } as React.CSSProperties,

  productListCard: {
    flex: 1,
    background: "rgba(18, 20, 29, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "20px",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    backdropFilter: "blur(8px)",
  } as React.CSSProperties,

  summaryCard: {
    background: "rgba(18, 20, 29, 0.5)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "20px",
    borderRadius: "16px",
    backdropFilter: "blur(8px)",
  } as React.CSSProperties,

  infoCta: {
    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)",
    border: "1px solid rgba(99, 102, 241, 0.2)",
    borderRadius: "16px",
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  } as React.CSSProperties,

  infoCtaTitle: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#a5b4fc",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  } as React.CSSProperties,

  infoCtaText: {
    margin: 0,
    fontSize: "0.8rem",
    color: "#cbd5e1",
    lineHeight: 1.4,
  } as React.CSSProperties,

  infoCtaLink: {
    color: "#a855f7",
    fontWeight: 600,
    textDecoration: "underline",
  } as React.CSSProperties,

  footer: {
    padding: "16px 40px",
    background: "rgba(10, 11, 18, 0.9)",
    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
    zIndex: 10,
  } as React.CSSProperties,

  footerContent: {
    width: "100%",
    margin: "0 auto",
  } as React.CSSProperties,
};
