import {type RefObject, useEffect} from "react";

export const useResourceAreaWidth = (resourceAreaColRef: RefObject<HTMLTableColElement | null>, resourceAreaWidth?: string) => {
    useEffect(() => {
        const resourceAreaCol = resourceAreaColRef.current;
        if (resourceAreaCol && resourceAreaWidth) {
            resourceAreaCol.style.width = resourceAreaWidth;
        }
    }, [resourceAreaColRef, resourceAreaWidth]);
}