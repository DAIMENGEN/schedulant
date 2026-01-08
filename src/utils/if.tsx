import {type ReactNode, Suspense} from "react";

export const If = ({condition, children, fallback}: {
    condition: boolean;
    children: ReactNode;
    fallback?: ReactNode;
}) => {
    return (
        <Suspense fallback={fallback}>
            {condition ? children : fallback}
        </Suspense>
    )
}