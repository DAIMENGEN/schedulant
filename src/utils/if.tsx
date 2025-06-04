import React, {type ReactNode, Suspense} from "react";

export const If: React.FC<{
    condition: boolean;
    children: ReactNode;
    fallback?: ReactNode;
}> = ({condition, children, fallback}) => {
    return (
        <Suspense fallback={fallback}>
            {condition ? children : fallback}
        </Suspense>
    )
}