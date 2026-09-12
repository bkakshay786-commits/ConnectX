import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("ConnectX error boundary", error, info.componentStack);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
          <p className="font-display text-lg font-semibold text-cx-text">
            Something went wrong
          </p>
          <p className="mt-2 max-w-sm font-body text-sm text-cx-muted">
            Reload ConnectX to continue. If this keeps happening, the team will need the
            console error.
          </p>
          <button
            className="mt-6 rounded-full bg-primary-fill px-5 py-2.5 font-display text-sm font-semibold text-primary-on-fill"
            type="button"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
