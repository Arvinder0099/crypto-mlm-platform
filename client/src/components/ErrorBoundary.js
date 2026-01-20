import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('UI ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
          <h2>Something went wrong</h2>
          <p>Please refresh or try another page.</p>
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {String(this.state.error || '')}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;