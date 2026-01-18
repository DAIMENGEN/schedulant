import type {Dayjs} from "dayjs";
import {useRef} from "react";
import {SchedulantApi} from "@schedulant/types/schedulant.ts";
import {useTimelineSlotLaneMount} from "@schedulant/hooks/mounts/use-timeline-slot-lane-mount.ts";

export const TimelineBodySlot = (props: {
    date: Dayjs,
    dataDate: string,
    classNames: string[],
    schedulantApi: SchedulantApi,
}) => {
    const timelineSlotLaneRef = useRef<HTMLTableCellElement>(null);
    useTimelineSlotLaneMount(timelineSlotLaneRef, props.schedulantApi, props.date);
    return (
        <td ref={timelineSlotLaneRef} key={props.date.format("YYYY-MM-DD")} data-date={props.dataDate}
            className={"schedulant-timeline-slot schedulant-timeline-slot-lane"}>
            <div className={`schedulant-timeline-slot-frame ${props.classNames?.join(" ")}`}></div>
        </td>
    )
}