import type {Dayjs} from "dayjs";

export const SchedulantTimelineBodyTableSlot = (props: {
    date: Dayjs,
    dataDate: string,
    classNames: string[]
}) => {
    return (
        <td key={props.date.format("YYYY-MM-DD")} data-date={props.dataDate} className={"schedulant-timeline-slot schedulant-timeline-slot-lane"}>
            <div className={`schedulant-timeline-slot-frame ${props.classNames?.join(" ")}`}></div>
        </td>
    )
}