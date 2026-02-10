import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px', fontFamily: 'sans-serif', color: '#fff', background: '#1a1a2e', minHeight: '100vh' }}>
                    <h1 style={{ color: '#ff6b9d' }}>⚠️ エラーが発生しました</h1>
                    <p style={{ marginTop: '20px' }}>{this.state.error?.message}</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            background: '#ff6b9d',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                        }}
                    >
                        リロード
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
