import {type Dispatch, type MouseEventHandler, type MutableRefObject, type RefObject, useCallback, useRef} from "react";
import {getHTMLTableElementByClassName, numberToPixels} from "@schedulant/utils/dom.ts";
import type {Action} from "@schedulant/context/schedulant-state";

export type ResizerMouseUp = MouseEventHandler<HTMLDivElement>;

export type ResizerMouseDown = MouseEventHandler<HTMLDivElement>;

export type ResizerMouseDownFunc = (cellRef: MutableRefObject<HTMLDivElement | null>) => ResizerMouseDown;

export const useResourceAreaResizer = (
    dispatch: Dispatch<Action>,
    scheduleElRef: RefObject<HTMLDivElement>,
    resourceAreaColElRef: RefObject<HTMLTableColElement>
) => {
    const indexRef = useRef<number>(-1);
    const head = useCallback(() => getHTMLTableElementByClassName("schedulant-datagrid-head"), []);
    const body = useCallback(() => getHTMLTableElementByClassName("schedulant-datagrid-body"), []);
    const handleDatagridResize = useCallback((event: MouseEvent) => {
        event.preventDefault();
        const resourceAreaCol = resourceAreaColElRef.current;
        if (resourceAreaCol) {
            const rect = resourceAreaCol.getBoundingClientRect();
            const offset = event.clientX - rect.left;
            resourceAreaCol.style.width = numberToPixels(offset);
            dispatch({type: "SET_RESOURCE_AREA_WIDTH", width: resourceAreaCol.style.width});
        }
    }, [dispatch, resourceAreaColElRef]);

    const datagridResizerMouseUp: ResizerMouseUp = useCallback(event => {
        event.preventDefault();
        const scheduleEl = scheduleElRef.current;
        if (scheduleEl) {
            scheduleEl.removeEventListener("mousemove", handleDatagridResize);
        } else {
            console.error("scheduleEl", scheduleEl);
        }
    }, [handleDatagridResize, scheduleElRef]);

    const datagridResizerMouseDown: ResizerMouseDown = useCallback(event => {
        event.preventDefault();
        const scheduleEl = scheduleElRef.current;
        if (scheduleEl) {
            scheduleEl.addEventListener("mousemove", handleDatagridResize);
        } else {
            console.error("scheduleEl", scheduleEl);
        }
    }, [handleDatagridResize, scheduleElRef]);

    const handleDatagridCellResize = useCallback((event: MouseEvent) => {
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

    const datagridCellResizerMouseUp: ResizerMouseUp = useCallback(event => {
        event.preventDefault();
        indexRef.current = -1;
        const datagridHead = head();
        const datagridBody = body();
        datagridHead.removeEventListener("mousemove", handleDatagridCellResize);
        datagridBody.removeEventListener("mousemove", handleDatagridCellResize);
    }, [indexRef, head, body, handleDatagridCellResize]);

    const datagridCellResizerMouseDownFunc: ResizerMouseDownFunc = useCallback((cellRef: MutableRefObject<HTMLDivElement | null>) => event => {
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
            datagridHead.addEventListener("mousemove", handleDatagridCellResize);
            datagridBody.addEventListener("mousemove", handleDatagridCellResize);
        } else {
            console.error("trElement", trElement);
        }
    }, [head, body, handleDatagridCellResize, indexRef]);

    return {
        datagridResizerMouseUp,
        datagridResizerMouseDown,
        datagridCellResizerMouseUp,
        datagridCellResizerMouseDownFunc
    }
}