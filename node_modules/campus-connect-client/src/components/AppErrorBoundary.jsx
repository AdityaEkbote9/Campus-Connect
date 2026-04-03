import { Component } from "react";

export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || "Something went wrong while rendering Campus Connect."
    };
  }

  componentDidCatch(error) {
    // Surface the runtime error in the browser console for easier local debugging.
    console.error("Campus Connect render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="shell">
          <main className="content">
            <section className="page">
              <div className="panel">
                <p className="eyebrow">UI error</p>
                <h1>Campus Connect hit a render problem</h1>
                <p className="helper-text">
                  {this.state.message}
                </p>
                <button
                  type="button"
                  className="primary-button inline-flex"
                  onClick={() => window.location.assign("/")}
                >
                  Go to home
                </button>
              </div>
            </section>
          </main>
        </div>
      );
    }

    return this.props.children;
  }
}
