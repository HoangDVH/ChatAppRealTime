import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("UI crashed:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
          <h1 className="text-xl font-semibold">Có lỗi khi hiển thị trang</h1>
          <p className="text-sm text-red-600 max-w-xl break-words">
            {this.state.error.message}
          </p>
          <button
            className="rounded-md bg-violet-600 px-4 py-2 text-white"
            onClick={() => {
              this.setState({ error: null });
              window.location.href = "/signin";
            }}
          >
            Tải lại trang đăng nhập
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
