import { useEffect } from "react";
import { router, type Href } from "expo-router";

type RedirectOptions = {
    method?: "replace" | "push";
    onComplete?: () => void;
};

export default function useRedirectEffect(route: string | Href | null, options?: RedirectOptions) {
    const method = options?.method;
    const onComplete = options?.onComplete;

    useEffect(() => {
        if (!route) return;

        const target = route as Href;
        if ((method ?? "replace") === "push") {
            router.push(target);
        } else {
            router.replace(target);
        }
        onComplete?.();
    }, [route, method, onComplete]);
}
