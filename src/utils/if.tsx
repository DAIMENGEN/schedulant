import type {ReactNode} from "react";

export const If = ({condition, children, fallback}: {
    condition: boolean;
    children: ReactNode;
    fallback?: ReactNode;
}) => {
    return <>{condition ? children : fallback}</>;
}