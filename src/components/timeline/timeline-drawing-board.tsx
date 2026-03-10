import type {SchedulantView} from "@schedulant/types/schedulant-view.tsx";
import {useTimelineWidth} from "@schedulant/hooks/use-timeline-width.tsx";
import {numberToPixels} from "@schedulant/utils/dom.ts";
import type {ResourceApi} from "@schedulant/types/resource.ts";
import type {Virtualizer} from "@tanstack/react-virtual";

export const TimelineDrawingBoard = (props: {
    schedulantView: SchedulantView,
    virtualizer: Virtualizer<HTMLDivElement, Element>,
    visibleResources: ResourceApi[],
}) => {
    const timelineWidth = useTimelineWidth();
    const virtualItems = props.virtualizer.getVirtualItems();
    const totalSize = props.virtualizer.getTotalSize();
    return (
        <table aria-hidden={true} className={"schedulant-timeline-drawing-board schedulant-scrollgrid-sync-table"}
               style={{width: numberToPixels(timelineWidth)}}>
            {props.schedulantView.renderTimelineDrawingBoardTable(props.visibleResources, virtualItems, totalSize, timelineWidth)}
        </table>
    )
}