import React, { Component, ReactNode } from "react";
import ErrorScreen from "@/view/components/ErrorScreen";

type Props = {
    children: ReactNode;
    onReset?: () => void;
};

type State = {
    hasError: boolean;
    error?: Error;
};

export default class AppErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };
    private previousGlobalHandler?: (error: Error, isFatal?: boolean) => void;
    private previousUnhandledRejection?: ((event: PromiseRejectionEvent) => void) | null;

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidMount() {
        const globalUtils = (globalThis as unknown as { ErrorUtils?: { setGlobalHandler?: Function; getGlobalHandler?: Function } })
            .ErrorUtils;
        if (globalUtils?.getGlobalHandler && globalUtils?.setGlobalHandler) {
            this.previousGlobalHandler = globalUtils.getGlobalHandler();
            globalUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
                this.setState({ hasError: true, error });
                if (this.previousGlobalHandler) {
                    this.previousGlobalHandler(error, isFatal);
                }
            });
        }

        if ("onunhandledrejection" in globalThis) {
            this.previousUnhandledRejection = (globalThis as { onunhandledrejection?: ((event: PromiseRejectionEvent) => void) | null }).onunhandledrejection;
            (globalThis as { onunhandledrejection?: (event: PromiseRejectionEvent) => void }).onunhandledrejection = (
                event: PromiseRejectionEvent
            ) => {
                const reason = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
                this.setState({ hasError: true, error: reason });
                this.previousUnhandledRejection?.(event);
            };
        }
    }

    componentWillUnmount() {
        const globalUtils = (globalThis as unknown as { ErrorUtils?: { setGlobalHandler?: Function } }).ErrorUtils;
        if (globalUtils?.setGlobalHandler && this.previousGlobalHandler) {
            globalUtils.setGlobalHandler(this.previousGlobalHandler);
        }

        if ("onunhandledrejection" in globalThis) {
            (globalThis as { onunhandledrejection?: ((event: PromiseRejectionEvent) => void) | null }).onunhandledrejection =
                this.previousUnhandledRejection ?? null;
        }
    }

    componentDidCatch(error: Error) {
        console.error("Erro não tratado na UI:", error);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: undefined });
        this.props.onReset?.();
    };

    render() {
        if (this.state.hasError) {
            return (
                <ErrorScreen
                    message="Ocorreu um erro inesperado. Tente novamente."
                    onRetry={this.handleRetry}
                />
            );
        }

        return this.props.children;
    }
}
