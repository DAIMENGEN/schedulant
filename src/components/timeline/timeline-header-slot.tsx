import type {Dayjs} from "dayjs";
import type {SchedulantApi} from "@schedulant/types/schedulant.ts";
import {useRef} from "react";
import {useTimelineSlotLabelMount} from "@schedulant/hooks/mounts/use-timeline-slot-label-mount.ts";

export const TimelineHeaderSlot = (props: {
    date: Dayjs,
    level: number,
    colSpan: number,
    timeText: string,
    dataDate: string,
    classNames: string[],
    schedulantApi: SchedulantApi,
}) => {
    const timelineSlotLabelRef = useRef<HTMLTableCellElement>(null);
    useTimelineSlotLabelMount(timelineSlotLabelRef, props.schedulantApi, props.date, props.level, props.timeText);
    return (
        <th ref={timelineSlotLabelRef} key={props.date.format("YYYY-MM-DD")} colSpan={props.colSpan}
            data-date={props.dataDate} className={"schedulant-timeline-slot schedulant-timeline-slot-label"}>
            <div className={`schedulant-timeline-slot-frame ${props.classNames.join(" ")}`}>
                <span title={props.dataDate}
                      className={"schedulant-timeline-slot-cushion schedulant-scrollgrid-sync-inner"}>
                    {props.timeText}
                </span>
            </div>
        </th>
    )
}