import type {SchedulantView} from "@schedulant/types/schedulant-view.tsx";
import {useTimelineWidth} from "@schedulant/hooks/use-timeline-width.tsx";
import {useSchedulantContext} from "@schedulant/hooks/use-schedulant-context.ts";
import {numberToPixels} from "@schedulant/utils/dom.ts";

export const TimelineDrawingBoard = (props: {
    schedulantView: SchedulantView
}) => {
    const timelineWidth = useTimelineWidth();
    const {state} = useSchedulantContext();
    return (
        <table aria-hidden={true} className={"schedulant-timeline-drawing-board schedulant-scrollgrid-sync-table"}
               style={{width: numberToPixels(timelineWidth)}}>
            {props.schedulantView.renderTimelineDrawingBoardTable(state.collapseIds, timelineWidth)}
        </table>
    )
}