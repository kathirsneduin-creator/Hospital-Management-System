import { Component } from 'react';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Surface the real error in the console so it's easy to diagnose —
    // this is what used to just be a silent blank screen.
    console.error('[App crashed]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg px-6">
          <div className="max-w-md w-full text-center card-outline p-8">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={26} />
            </div>
            <h1 className="font-heading text-xl font-bold text-primary-dark">Something went wrong</h1>
            <p className="text-sm text-muted mt-2">
              The app hit an unexpected error. Open your browser console (F12) for the exact message —
              this is most often a missing or invalid <code>.env</code> value.
            </p>
            {this.state.error?.message && (
              <pre className="text-xs text-left bg-gray-50 border border-gray-200 rounded-lg p-3 mt-4 overflow-x-auto text-red-600">
                {this.state.error.message}
              </pre>
            )}
            <button onClick={() => window.location.reload()} className="btn btn-primary mt-5">
              <RefreshCcw size={16} /> Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
