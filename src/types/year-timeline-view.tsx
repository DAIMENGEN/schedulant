import type {ReactNode} from "react";
import {TimelineView} from "./timeline-view";
import {TimelineColgroup} from "@schedulant/components/timeline/timeline-colgroup.tsx";
import {TimelineBodySlot} from "@schedulant/components/timeline/timeline-body-slot.tsx";
import {TimelineHeaderSlot} from "@schedulant/components/timeline/timeline-header-slot.tsx";
import dayjs, {type Dayjs} from "dayjs";
import type {Position} from "@schedulant/types/base.ts";

export class YearTimelineView extends TimelineView {

    getTotalSlots(): number {
        return this.getTimelineApi().getYears().length;
    }

    renderColgroup(): ReactNode {
        const schedulantApi = this.getSchedulantApi();
        const timelineApi = this.getTimelineApi();
        const years = timelineApi.getYears();
        const slotMinWidth = schedulantApi.getSlotMinWidth();
        return <TimelineColgroup dates={years} minWidth={slotMinWidth}/>;
    }

    renderBodySlots(): ReactNode {
        const timelineApi = this.getTimelineApi();
        const years = timelineApi.getYears();
        return (
            <tbody>
            <tr role={"row"}>
                {
                    years.map(date => (
                        <TimelineBodySlot key={date.year()}
                                          date={date}
                                          dataDate={date.year().toString()}
                                          classNames={["schedulant-year", date.isSame(dayjs(), "year") ? "schedulant-this-year" : '']}
                                          schedulantApi={this.getSchedulantApi()}/>
                    ))
                }
            </tr>
            </tbody>
        );
    }

    renderHeaderSlots(): ReactNode {
        const timelineApi = this.getTimelineApi();
        const years = timelineApi.getYears();
        return (
            <tbody>
            <tr role={"row"} className={"schedulant-timeline-head-row"}>
                {
                    years.map(date => (
                        <TimelineHeaderSlot key={date.year()}
                                            level={1}
                                            date={date}
                                            dataDate={date.year().toString()}
                                            colSpan={1}
                                            timeText={date.year().toString()}
                                            classNames={["schedulant-year", date.isSame(dayjs(), "year") ? "schedulant-this-year" : '']}
                                            schedulantApi={this.getSchedulantApi()}/>
                    ))
                }
            </tr>
            </tbody>
        );
    }

    calculatePosition(timelineWidth: number, start: Dayjs, end: Dayjs): Position {
        const timelineApi = this.getTimelineApi();
        const years = timelineApi.getYears();
        const yearCellWidth = timelineWidth / years.length;
        // Determine the start and end dates within the timeline range;
        const _start = start.isBefore(timelineApi.getStart()) ? timelineApi.getStart() : start;
        const _end = end.isAfter(timelineApi.getEnd()) ? timelineApi.getEnd() : end;
        // Calculate left position;
        const start_total_days = _start.endOf("year").diff(_start.startOf("year"), "day") + 1;
        const startDate = _start.diff(_start.startOf("year"), "day");
        const width_1 = yearCellWidth / start_total_days;
        const leftOffset = startDate * width_1;
        const yearLeft = timelineApi.getYearPosition(_start) * yearCellWidth;
        const left = start.isSameOrBefore(timelineApi.getStart(), "day") ? yearLeft : yearLeft + leftOffset;
        // Calculate right position;
        const end_total_days = _end.endOf("year").diff(_end.startOf("year"), "day") + 1;
        const endDate = _end.endOf("year").diff(_end, "day");
        const width_2 = yearCellWidth / end_total_days;
        const rightOffset = endDate * width_2;
        const yearRight = (timelineApi.getYearPosition(_end) + 1) * yearCellWidth * -1;
        const right = end.isBefore(timelineApi.getEnd(), "day") ? yearRight + rightOffset : yearRight;

        return {left, right};
    }
}