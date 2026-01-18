import {TimelineBodySlot} from "@schedulant/components/timeline/timeline-body-slot.tsx";
import {
    TimelineColgroup
} from "@schedulant/components/timeline/timeline-colgroup.tsx";
import {TimelineView} from "@schedulant/types/timeline-view.tsx";
import type { ReactNode } from "react";
import { TimelineHeaderSlot } from "@schedulant/components/timeline/timeline-header-slot.tsx";
import dayjs, {type Dayjs} from "dayjs";
import type {Position} from "@schedulant/types/base.ts";

export class WeekTimelineView extends TimelineView {

    getTotalSlots(): number {
        return this.getTimelineApi().getWeeks().length;
    }

    renderColgroup(): ReactNode {
        const schedulantApi = this.getSchedulantApi();
        const timelineApi = this.getTimelineApi();
        const weeks = timelineApi.getWeeks();
        const slotMinWidth = schedulantApi.getSlotMinWidth();
        return <TimelineColgroup dates={weeks} minWidth={slotMinWidth}/>;
    }

    renderBodySlots(): ReactNode {
        const timelineApi = this.getTimelineApi();
        const weeks = timelineApi.getWeeks();
        return (
            <tbody>
            <tr role={"row"}>
                {
                    weeks.map(date => (
                        <TimelineBodySlot key={`${date.format("YYYY-MM-DD")}`}
                                          date={date}
                                          dataDate={`${date.format("YYYY-MM-DD")}`}
                                          classNames={["schedulant-week", date.isSame(dayjs(), "week") ? "schedulant-this-week" : '']}
                                          schedulantApi={this.getSchedulantApi()}/>
                    ))
                }
            </tr>
            </tbody>
        );
    }

    renderHeaderSlots(): ReactNode {
        const timelineApi = this.getTimelineApi();
        const weeks = timelineApi.getWeeks();
        return (
            <tbody>
            <tr role={"row"} className={"schedulant-timeline-head-row"}>
                {
                    weeks.map(date => (
                        <TimelineHeaderSlot key={`${date.format("YYYY-MM-DD")}`}
                                            level={2}
                                            date={date}
                                            dataDate={`${date.format("YYYY-MM-DD")}`}
                                            colSpan={1}
                                            timeText={`W${date.week().toString().padStart(2, '0')}`}
                                            classNames={["schedulant-week", date.isSame(dayjs(), "week") ? "schedulant-this-week" : '']}
                                            schedulantApi={this.getSchedulantApi()}/>
                    ))
                }
            </tr>
            </tbody>
        );
    }

    calculatePosition(timelineWidth: number, start: Dayjs, end: Dayjs): Position {
        const timelineApi = this.getTimelineApi();
        const weeks = timelineApi.getWeeks();
        const weekCellWidth = timelineWidth / weeks.length;
        // Determine the start and end dates within the timeline range;
        const _start = start.isBefore(timelineApi.getStart()) ? timelineApi.getStart() : start;
        const _end = end.isAfter(timelineApi.getEnd()) ? timelineApi.getEnd() : end;
        // Calculate ratio
        const ratio = weekCellWidth / 7;
        // Calculate left position;
        const startDate = _start.day();
        const weekLeft = timelineApi.getWeekPosition(_start) * weekCellWidth;
        const left = start.isSameOrBefore(timelineApi.getStart(), "day") ? weekLeft : weekLeft + (startDate * ratio);
        // Calculate right position;
        const endDate = 6 - _end.day();
        const weekRight = (timelineApi.getWeekPosition(_end) + 1) * weekCellWidth * -1;
        const right = end.isBefore(timelineApi.getEnd(), "day") ? weekRight + (endDate * ratio) : weekRight;
        return {left, right};
    }
}