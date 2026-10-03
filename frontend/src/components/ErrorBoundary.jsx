import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

/**
 * Catches render-time errors anywhere below it so a thrown error
 * shows a recovery screen instead of a blank white page.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('FlowAI: unhandled UI error', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="loading-screen p-6 text-center">
          <div className="panel max-w-md p-8">
            <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-full bg-[#fbefe9] text-[#a6573c]">
              <AlertTriangle size={24} />
            </div>
            <h1 className="m-0 text-2xl font-semibold tracking-tight text-[var(--ink)]">The view stopped responding</h1>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {this.state.error?.message || 'An unexpected error interrupted the interface.'}
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                onClick={this.handleReset}
                className="button-primary"
              >
                <RotateCcw size={16} /> Try again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="button-secondary"
              >
                Reload app
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
