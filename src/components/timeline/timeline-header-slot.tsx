import type {Dayjs} from "dayjs";

export const TimelineHeaderSlot = (props: {
    date: Dayjs, 
    level: number, 
    colSpan: number, 
    timeText: string, 
    dataDate: string, 
    classNames: string[]
}) => {
    return (
        <th colSpan={props.colSpan} data-date={props.dataDate} className={"schedulant-timeline-slot schedulant-timeline-slot-label"}>
            <div className={`schedulant-timeline-slot-frame ${props.classNames.join(" ")}`} style={{border: "none", cursor: "pointer"}}>
                <span title={props.dataDate} className={"schedulant-timeline-slot-cushion schedulant-scrollgrid-sync-inner"}>
                    {props.timeText}
                </span>
            </div>
        </th>
    )
}