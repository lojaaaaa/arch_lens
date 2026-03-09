import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

import { Button } from './button';

type ErrorBoundaryProps = {
    children: ReactNode;
    fallback?: ReactNode;
};

type ErrorBoundaryState = {
    hasError: boolean;
    error: Error | null;
};

export class ErrorBoundary extends Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    override render() {
        if (this.state.hasError && this.state.error) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
                    <h1 className="text-destructive text-lg font-semibold">
                        Произошла ошибка
                    </h1>
                    <p className="text-muted-foreground max-w-md text-center text-sm">
                        {this.state.error.message}
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={this.handleReload}
                    >
                        Перезагрузить страницу
                    </Button>
                </div>
            );
        }
        return this.props.children;
    }
}
