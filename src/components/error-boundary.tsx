import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('PDF Viewer error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <h2 className="text-lg font-semibold">出现了一些问题</h2>
                        <p className="text-muted-foreground">请刷新页面重试</p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}