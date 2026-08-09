import React from 'react';
import { Button } from './Button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-surface rounded-card border border-border">
          <h2 className="font-serif text-2xl text-black mb-2">Something went wrong</h2>
          <p className="font-sans text-muted text-sm mb-6 max-w-md">
            An unexpected application error occurred. You can refresh or return to the main dashboard.
          </p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Reload Application
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
