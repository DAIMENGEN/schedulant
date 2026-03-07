import {useCallback, useRef, useState} from "react";
import type {ResourceApi} from "@schedulant/types/resource.ts";
import {
    type DragStartEvent,
    type DragMoveEvent,
    type DragEndEvent,
    type UniqueIdentifier,
} from "@dnd-kit/core";

export type DropPosition = "before" | "after" | "child";

export type DragDropState = {
    activeId: UniqueIdentifier | null;
    overId: UniqueIdentifier | null;
    dropPosition: DropPosition | null;
};

function computeDropPosition(
    pointerY: number,
    rect: { top: number; height: number }
): DropPosition {
    const y = pointerY - rect.top;
    const height = rect.height;
    if (y < height * 0.25) return "before";
    if (y > height * 0.75) return "after";
    return "child";
}

function isAncestor(
    draggedId: string,
    targetResourceApi: ResourceApi
): boolean {
    let current: ResourceApi | undefined = targetResourceApi;
    while (current) {
        if (current.getId() === draggedId) return true;
        const parentOption = current.getParent();
        current = parentOption.isDefined() ? parentOption.get() : undefined;
    }
    return false;
}

export const useMoveResource = (
    flatResources: ResourceApi[],
    onReorder: (el: HTMLElement, draggedId: string, targetId: string, position: DropPosition) => void
) => {
    const [dragState, setDragState] = useState<DragDropState>({
        activeId: null,
        overId: null,
        dropPosition: null,
    });

    const dropPositionRef = useRef<DropPosition | null>(null);
    const overIdRef = useRef<UniqueIdentifier | null>(null);

    const resourceLookupRef = useRef(
        new Map(flatResources.map((r) => [r.getId(), r]))
    );
    resourceLookupRef.current = new Map(flatResources.map((r) => [r.getId(), r]));

    const handleDragStart = useCallback((event: DragStartEvent) => {
        dropPositionRef.current = null;
        overIdRef.current = null;
        setDragState({
            activeId: event.active.id,
            overId: null,
            dropPosition: null,
        });
    }, []);

    const handleDragMove = useCallback((event: DragMoveEvent) => {
        const {active, over, activatorEvent, delta} = event;
        if (!over || active.id === over.id) {
            if (overIdRef.current !== null) {
                overIdRef.current = null;
                dropPositionRef.current = null;
                setDragState((prev) => ({...prev, overId: null, dropPosition: null}));
            }
            return;
        }

        const targetResource = resourceLookupRef.current.get(String(over.id));
        if (!targetResource || isAncestor(String(active.id), targetResource)) {
            if (overIdRef.current !== null) {
                overIdRef.current = null;
                dropPositionRef.current = null;
                setDragState((prev) => ({...prev, overId: null, dropPosition: null}));
            }
            return;
        }

        const pointerY = (activatorEvent as MouseEvent).clientY + delta.y;
        const dropPosition = computeDropPosition(pointerY, {
            top: over.rect.top,
            height: over.rect.height,
        });

        if (overIdRef.current !== over.id || dropPositionRef.current !== dropPosition) {
            overIdRef.current = over.id;
            dropPositionRef.current = dropPosition;
            setDragState((prev) => ({
                ...prev,
                overId: over.id,
                dropPosition,
            }));
        }
    }, []);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const {active, over} = event;
        const finalDropPosition = dropPositionRef.current;
        const finalOverId = overIdRef.current;

        if (over && active.id !== over.id && finalDropPosition && finalOverId) {
            const overNode = document.querySelector(
                `[data-resource-id="${String(finalOverId)}"]`
            );
            onReorder(
                (overNode as HTMLElement) || document.body,
                String(active.id),
                String(finalOverId),
                finalDropPosition,
            );
        }

        dropPositionRef.current = null;
        overIdRef.current = null;
        setDragState({activeId: null, overId: null, dropPosition: null});
    }, [onReorder]);

    const handleDragCancel = useCallback(() => {
        dropPositionRef.current = null;
        overIdRef.current = null;
        setDragState({activeId: null, overId: null, dropPosition: null});
    }, []);

    return {
        dragState,
        handleDragStart,
        handleDragMove,
        handleDragEnd,
        handleDragCancel,
    };
};