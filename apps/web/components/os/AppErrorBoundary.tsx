import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  appName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in app:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center select-none space-y-4">
          <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-red-400">
              Application Error
            </h2>
            <p className="text-sm text-white/50 mt-1 max-w-xs mx-auto">
              {this.props.appName || "This application"} has encountered a
              critical error.
            </p>
          </div>
          {this.state.error && (
            <pre className="bg-black/40 p-2 rounded text-xs text-red-300 overflow-auto max-w-full max-h-32 text-left">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-md text-sm transition-colors border border-white/10"
          >
            <RefreshCw className="h-4 w-4" />
            Restart Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
