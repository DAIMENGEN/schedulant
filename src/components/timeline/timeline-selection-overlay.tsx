import type {SelectionBox} from "@schedulant/hooks/use-timeline-selection.tsx";

export const TimelineSelectionOverlay = (props: {
    selectionBox: SelectionBox | null;
    isSelecting: boolean;
}) => {
    if (!props.isSelecting || !props.selectionBox) {
        return null;
    }

    const {startX, startY, currentX, currentY} = props.selectionBox;

    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    return (
        <div
            className="schedulant-timeline-selection-overlay"
            style={{
                position: 'absolute',
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                height: `${height}px`,
                pointerEvents: 'none',
                zIndex: 1000
            }}
        />
    );
};

