// packages/admin/src/components/ErrorBoundary.tsx
// Catches React rendering errors and shows a recoverable error page
// instead of letting Chrome hang with RESULT_CODE_HUNG.

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: '#09090b',
            color: '#fafafa',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            padding: 32,
          }}
        >
          <div
            style={{
              maxWidth: 560,
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: 32,
            }}
          >
            <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: 14, color: '#a1a1aa', marginBottom: 16 }}>
              The admin panel encountered an unexpected error. You can try again
              or reload the page.
            </p>
            <pre
              style={{
                color: '#ef4444',
                fontSize: 13,
                background: 'rgba(239,68,68,0.08)',
                borderRadius: 8,
                padding: 16,
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                marginBottom: 20,
                border: '1px solid rgba(239,68,68,0.15)',
              }}
            >
              {this.state.error?.message}
            </pre>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#6d28d9',
                  color: '#fff',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'transparent',
                  color: '#a1a1aa',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
