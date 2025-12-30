import React, {useCallback, useState} from "react";
import type {ResourceApi} from "@schedulant/types/resource.ts";

export type DragDropState = {
    draggedResource: ResourceApi | null;
    dragOverResource: ResourceApi | null;
    dropPosition: 'before' | 'after' | 'child' | null;
}

export const useMoveResource = (onReorder: (el: HTMLElement, draggedId: string, targetId: string, position: 'before' | 'after' | 'child') => void) => {
    const [dragState, setDragState] = useState<DragDropState>({
        draggedResource: null,
        dragOverResource: null,
        dropPosition: null,
    });

    const handleDragStart = useCallback((resourceApi: ResourceApi) => (e: React.DragEvent) => {
        e.stopPropagation();
        setDragState(prev => ({
            ...prev,
            draggedResource: resourceApi,
        }));
        // Set drag image
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', resourceApi.getId());
        }
    }, []);

    const handleDragOver = useCallback((resourceApi: ResourceApi) => (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!dragState.draggedResource || dragState.draggedResource.getId() === resourceApi.getId()) {
            return;
        }

        // Prevent dragging a parent into its own child
        let current: ResourceApi | undefined = resourceApi;
        while (current) {
            if (current.getId() === dragState.draggedResource.getId()) {
                return;
            }
            const parentOption = current.getParent();
            current = parentOption.isDefined() ? parentOption.get() : undefined;
        }

        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = rect.height;

        let position: 'before' | 'after' | 'child';
        if (y < height * 0.25) {
            position = 'before';
        } else if (y > height * 0.75) {
            position = 'after';
        } else {
            position = 'child';
        }

        setDragState(prev => ({
            ...prev,
            dragOverResource: resourceApi,
            dropPosition: position,
        }));
    }, [dragState.draggedResource]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragState(prev => ({
            ...prev,
            dragOverResource: null,
            dropPosition: null,
        }));
    }, []);

    const handleDrop = useCallback((resourceApi: ResourceApi) => (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!dragState.draggedResource || !dragState.dropPosition) {
            return;
        }

        if (dragState.draggedResource.getId() !== resourceApi.getId()) {
            onReorder(
                e.currentTarget as HTMLElement,
                dragState.draggedResource.getId(),
                resourceApi.getId(),
                dragState.dropPosition
            );
        }

        setDragState({
            draggedResource: null,
            dragOverResource: null,
            dropPosition: null,
        });
    }, [dragState, onReorder]);

    const handleDragEnd = useCallback(() => {
        setDragState({
            draggedResource: null,
            dragOverResource: null,
            dropPosition: null,
        });
    }, []);

    return {
        dragState,
        handleDragStart,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleDragEnd,
    };
};