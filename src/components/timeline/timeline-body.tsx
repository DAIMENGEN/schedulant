import type {SchedulantView} from "@schedulant/types/schedulant-view.tsx";

export const TimelineBody = (props: {
    schedulantView: SchedulantView
}) => {
    return (
        <div id={"schedulant-timeline-slots"} className={"schedulant-timeline-slots"}>
            <table aria-hidden={true}>
                {props.schedulantView.renderTimelineTableColgroup()}
                {props.schedulantView.renderTimelineBodyTableSlots()}
            </table>
        </div>
    )
}