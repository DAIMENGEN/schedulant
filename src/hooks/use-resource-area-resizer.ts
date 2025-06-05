import {type MouseEventHandler, type MutableRefObject, useCallback, useRef} from "react";
import {getHTMLTableElementByClassName, numberToPixels} from "@schedulant/utils/dom.ts";

export const useResourceAreaResizer = () => {
    const indexRef = useRef<number>(-1);
    const head = useCallback(() => getHTMLTableElementByClassName("schedulant-datagrid-head"), []);
    const body = useCallback(() => getHTMLTableElementByClassName("schedulant-datagrid-body"), []);
    const handleMouseMove = useCallback((event: MouseEvent) => {
        event.preventDefault();
        const index = indexRef.current;
        const datagridHead = head();
        const datagridBody = body();
        const headerColgroup = datagridHead.firstElementChild;
        const bodyColgroup = datagridBody.firstElementChild;
        const headerColElements = headerColgroup?.children;
        const bodyColElements = bodyColgroup?.children
        if (headerColElements && bodyColElements) {
            const targetHeaderColElement = headerColElements[index] as HTMLTableColElement;
            const targetBodyColElement = (bodyColElements[index] as HTMLTableColElement);
            const headerColElementOffset = event.clientX - targetHeaderColElement.getBoundingClientRect().left;
            const bodyColElementOffset = event.clientX - targetBodyColElement.getBoundingClientRect().left;
            targetHeaderColElement.style.width = numberToPixels(headerColElementOffset);
            targetBodyColElement.style.width = numberToPixels(bodyColElementOffset);
        }
    }, [body, head, indexRef]);
    const handleMouseUp = useCallback((event: MouseEvent) => {
        event.preventDefault();
        indexRef.current = -1;
        const datagridHead = head();
        const datagridBody = body();
        datagridHead.removeEventListener("mousemove", handleMouseMove);
        datagridBody.removeEventListener("mousemove", handleMouseMove);
    }, [indexRef, head, body, handleMouseMove]);
    const handleMouseDown: DatagridBodyCellResizerMouseDown = useCallback((cellRef: MutableRefObject<HTMLDivElement | null>) => event => {
        event.preventDefault();
        const targetCellElement = cellRef.current?.parentElement;
        const trElement = cellRef.current?.parentElement?.parentElement;
        if (trElement) {
            let cellElements = trElement.getElementsByTagName("td");
            if (cellElements.length === 0) {
                cellElements = trElement.getElementsByTagName("th");
            }
            for (let i = 0; i < cellElements.length; i++) {
                if (cellElements[i] == targetCellElement) {
                    indexRef.current = i;
                }
            }
            const datagridHead = head();
            const datagridBody = body();
            datagridHead.addEventListener("mousemove", handleMouseMove);
            datagridBody.addEventListener("mousemove", handleMouseMove);
        } else {
            console.error("trElement", trElement);
        }
    }, [head, body, handleMouseMove, indexRef]);
    return {
        handleMouseDown,
        handleMouseUp
    }
}

export type DatagridBodyCellResizerMouseDown = (cellRef: MutableRefObject<HTMLDivElement | null>) => MouseEventHandler<HTMLDivElement>