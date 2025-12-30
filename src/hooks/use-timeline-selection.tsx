import {useCallback, useEffect, useRef, useState} from "react";
import type {SchedulantView} from "@schedulant/types/schedulant-view.tsx";

export type SelectionBox = {
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
};

export const useTimelineSelection = (
    schedulantView: SchedulantView,
    containerRef: React.RefObject<HTMLDivElement>
) => {
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
    const selectionStartRef = useRef<{ x: number; y: number } | null>(null);

    const schedulantApi = schedulantView.getScheduleApi();
    const isSelectable = schedulantApi.isSelectable();

    const handleMouseDown = useCallback(
        (e: MouseEvent) => {
            if (!isSelectable || !containerRef.current) return;

            // Only start selection on left click and not on interactive elements
            if (e.button !== 0) return;

            const target = e.target as HTMLElement;
            // Don't start selection if clicking on events, milestones, checkpoints, or other interactive elements
            if (
                target.closest('.schedulant-timeline-event-harness') ||
                target.closest('.schedulant-timeline-milestone-harness') ||
                target.closest('.schedulant-timeline-checkpoint-harness') ||
                target.closest('.schedulant-timeline-event') ||
                target.classList.contains('schedulant-event-resizer')
            ) {
                return;
            }

            const rect = containerRef.current.getBoundingClientRect();
            const startX = e.clientX - rect.left + containerRef.current.scrollLeft;
            const startY = e.clientY - rect.top + containerRef.current.scrollTop;

            selectionStartRef.current = {x: startX, y: startY};
            setIsSelecting(true);
            setSelectionBox({
                startX,
                startY,
                currentX: startX,
                currentY: startY
            });

            // Clear any text selection
            if (window.getSelection) {
                const selection = window.getSelection();
                if (selection) {
                    selection.removeAllRanges();
                }
            }

            e.preventDefault();
        },
        [isSelectable, containerRef]
    );

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isSelecting || !selectionStartRef.current || !containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const currentX = e.clientX - rect.left + containerRef.current.scrollLeft;
            const currentY = e.clientY - rect.top + containerRef.current.scrollTop;

            setSelectionBox({
                startX: selectionStartRef.current.x,
                startY: selectionStartRef.current.y,
                currentX,
                currentY
            });

            e.preventDefault();
        },
        [isSelecting, containerRef]
    );

    const handleMouseUp = useCallback(
        (e: MouseEvent) => {
            if (!isSelecting) return;

            setIsSelecting(false);

            selectionStartRef.current = null;

            // Clear selection box after a short delay for visual feedback
            setTimeout(() => {
                setSelectionBox(null);
            }, 100);

            e.preventDefault();
        },
        [isSelecting, selectionBox, containerRef, schedulantView]
    );

    useEffect(() => {
        if (!isSelectable || !containerRef.current) return;

        const container = containerRef.current;

        container.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            container.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isSelectable, handleMouseDown, handleMouseMove, handleMouseUp, containerRef]);

    return {
        isSelecting,
        selectionBox
    };
};

