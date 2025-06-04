import {TimelineView} from "@schedulant/types/timeline-view.tsx";
import {SchedulantTimelineBodyTableSlot} from "@schedulant/components/timeline/schedulant-timeline-body-table-slot.tsx";
import { SchedulantTimelineHeaderTableSlot } from "@schedulant/components/timeline/schedulant-timeline-header-table-slot";
import type {Position} from "@schedulant/types/base.ts";
import type {Dayjs} from "dayjs";
import {
    SchedulantTimelineTableColgroup
} from "@schedulant/components/table-colgroup/schedulant-timeline-table-colgroup.tsx";
import type {ReactNode} from "react";

export class MonthTimelineView extends TimelineView {

    renderColgroup(): ReactNode {
        const schedulantApi = this.getSchedulantApi();
        const timelineApi = this.getTimelineApi();
        const months = timelineApi.getMonths();
        const slotMinWidth = schedulantApi.getSlotMinWidth();
        return <SchedulantTimelineTableColgroup dates={months} minWidth={slotMinWidth}/>;
    }

    renderBodySlots(): ReactNode {
        const timelineApi = this.getTimelineApi();
        const months = timelineApi.getMonths();
        return (
            <tbody>
            <tr role={"row"}>
                {
                    months.map(date => (
                        <SchedulantTimelineBodyTableSlot key={date.format("YYYY-MM")}
                                                         date={date}
                                                         dataDate={date.format("YYYY-MM")}
                                                         classNames={["schedulant-month"]}/>
                    ))
                }
            </tr>
            </tbody>
        );
    }

    renderHeaderSlots(): ReactNode {
        const timelineApi = this.getTimelineApi();
        const months = timelineApi.getMonths();
        const years = timelineApi.populateYearsWithMonths();
        return (
            <tbody>
            <tr role={"row"} className={"schedulant-timeline-header-row"}>
                {
                    years.map(date => (
                        <SchedulantTimelineHeaderTableSlot key={date.year.year()}
                                                           level={1}
                                                           date={date.year}
                                                           dataDate={date.year.year().toString()}
                                                           colSpan={date.months.length}
                                                           timeText={date.year.year().toString()}
                                                           classNames={[`schedulant-year`]}/>
                    ))
                }
            </tr>
            <tr role={"row"} className={"schedulant-timeline-header-row"}>
                {
                    months.map(date => (
                        <SchedulantTimelineHeaderTableSlot key={date.format("YYYY-MM")}
                                                           level={2}
                                                           date={date}
                                                           dataDate={date.format("YYYY-MM")}
                                                           colSpan={1}
                                                           timeText={date.format("MMM")}
                                                           classNames={["schedulant-month"]}/>
                    ))
                }
            </tr>
            </tbody>
        )
    }

    calculateDate(timelineWidth: number, point: number): Dayjs {
        const timelineApi = this.getTimelineApi();
        const slotWidth = this.calculateSlotWidth(timelineWidth);
        const index = (point / slotWidth) - 1;
        const date = timelineApi.getMonths().at(index);
        if (!date) {
            throw new RangeError("Calculated index is out of bounds.")
        }
        return date;
    }

    calculateSlotWidth(timelineWidth: number): number {
        const timelineApi = this.getTimelineApi();
        const months = timelineApi.getMonths();
        return timelineWidth / months.length;
    }

    calculatePosition(timelineWidth: number, start: Dayjs, end: Dayjs): Position {
        const timelineApi = this.getTimelineApi();
        const months = timelineApi.getMonths();
        const monthCellWidth = timelineWidth / months.length;
        // Determine the start and end dates within the timeline range;
        const _start = start.isBefore(timelineApi.getStart()) ? timelineApi.getStart() : start;
        const _end = end.isAfter(timelineApi.getEnd()) ? timelineApi.getEnd() : end;
        // Calculate left position;
        const startDate = _start.date() - 1;
        const width_1 = (monthCellWidth / _start.daysInMonth());
        const monthLeft = timelineApi.getMonthPosition(_start) * monthCellWidth;
        const left = start.isSameOrBefore(timelineApi.getStart(), "day") ? monthLeft : monthLeft + (startDate * width_1);
        // Calculate right position;
        const endDate = _end.daysInMonth() - _end.date();
        const width_2 = (monthCellWidth / _end.daysInMonth());
        const monthRight = (timelineApi.getMonthPosition(_end) + 1) * monthCellWidth * -1;
        const right = end.isBefore(timelineApi.getEnd(), "day") ?  monthRight + (endDate * width_2) : monthRight;
        return {left, right};
    }
}