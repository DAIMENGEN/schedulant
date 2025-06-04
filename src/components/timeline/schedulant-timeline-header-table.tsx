import type {SchedulantView} from "@schedulant/types/schedulant-view.tsx";

export const SchedulantTimelineHeaderTable = (props: {
    schedulantView: SchedulantView
}) => {
    return (
        <table aria-hidden={true} className={"schedulant-scrollgrid-sync-table"}>
            {props.schedulantView.renderTimelineTableColgroup()}
            {props.schedulantView.renderTimelineHeaderTableSlots()}
        </table>
    )
}