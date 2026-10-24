import { Component } from "react";
export default class ErrorBoundary extends Component {
  state = { e: null };
  static getDerivedStateFromError(e) {
    return { e };
  }
  componentDidCatch(e) {
    console.error("FinSim error:", e);
  }
  render() {
    const { e } = this.state;
    if (!e) return this.props.children;
    if (this.props.fallback !== undefined) return this.props.fallback;
    return (
      <div style={{ padding: 40, maxWidth: 700, margin: "40px auto" }}>
        <h2>Something went wrong on this page</h2>
        <p style={{ color: "#5f6f8c", margin: "8px 0 16px" }}>
          {String(e.message || e)}
        </p>
        <a href="/" style={{ color: "#2563eb" }}>
          Back to Home
        </a>
      </div>
    );
  }
}
