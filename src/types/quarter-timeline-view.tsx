import { TimelineColgroup } from "@schedulant/components/timeline/timeline-colgroup.tsx";
import { TimelineHeaderSlot } from "@schedulant/components/timeline/timeline-header-slot.tsx";
import {TimelineView} from "@schedulant/types/timeline-view.tsx";
import type { ReactNode } from "react";
import type {Dayjs} from "dayjs";
import type {Position} from "@schedulant/types/base.ts";
import {TimelineBodySlot} from "@schedulant/components/timeline/timeline-body-slot.tsx";

export class QuarterTimelineView extends TimelineView {

    renderColgroup(): ReactNode {
        const schedulantApi = this.getSchedulantApi();
        const timelineApi = this.getTimelineApi();
        const quarters = timelineApi.getQuarters();
        const slotMinWidth = schedulantApi.getSlotMinWidth();
        return <TimelineColgroup dates={quarters} minWidth={slotMinWidth}/>;
    }

    renderBodySlots(): ReactNode {
        const timelineApi = this.getTimelineApi();
        const quarters = timelineApi.getQuarters();
        return (
            <tbody>
            <tr role={"row"}>
                {
                    quarters.map(date => (
                        <TimelineBodySlot key={`${date.year()}-Q${date.quarter()}`}
                                          date={date}
                                          dataDate={`${date.year()}-Q${date.quarter()}`}
                                          classNames={["schedulant-quarter"]}/>
                    ))
                }
            </tr>
            </tbody>
        );
    }

    renderHeaderSlots(): ReactNode {
        const timelineApi = this.getTimelineApi();
        const quarters = timelineApi.getQuarters();
        const years = timelineApi.populateYearsWithQuarters();
        return (
            <tbody>
            <tr role={"row"} className={"schedulant-timeline-header-row"}>
                {
                    years.map(date => (
                        <TimelineHeaderSlot key={date.year.year()}
                                            level={1}
                                            date={date.year}
                                            dataDate={date.year.year().toString()}
                                            colSpan={date.quarters.length}
                                            timeText={date.year.year().toString()}
                                            classNames={["schedulant-year"]}/>
                    ))
                }
            </tr>
            <tr role={"row"} className={"schedulant-timeline-header-row"}>
                {
                    quarters.map(date => (
                        <TimelineHeaderSlot key={`${date.year()}-Q${date.quarter()}`}
                                            level={2}
                                            date={date}
                                            dataDate={`${date.year()}-Q${date.quarter()}`}
                                            colSpan={1}
                                            timeText={`Q${date.quarter()}`}
                                            classNames={["schedulant-quarter"]}/>
                    ))
                }
            </tr>
            </tbody>
        );
    }

    calculateDate(timelineWidth: number, point: number): Dayjs {
        const timelineApi = this.getTimelineApi();
        const slotWidth = this.calculateSlotWidth(timelineWidth);
        const index = (point / slotWidth) - 1;
        const date = timelineApi.getQuarters().at(index);
        if (!date) {
            throw new RangeError("Calculated index is out of bounds.")
        }
        return date;
    }

    calculateSlotWidth(timelineWidth: number): number {
        const timelineApi = this.getTimelineApi();
        const quarters = timelineApi.getQuarters();
        return timelineWidth / quarters.length;
    }

    calculatePosition(timelineWidth: number, start: Dayjs, end: Dayjs): Position {
        const timelineApi = this.getTimelineApi();
        const quarters = timelineApi.getQuarters();
        const quarterCellWidth = timelineWidth / quarters.length;
        // Determine the start and end dates within the timeline range;
        const _start = start.isBefore(timelineApi.getStart()) ? timelineApi.getStart() : start;
        const _end = end.isAfter(timelineApi.getEnd()) ? timelineApi.getEnd() : end;
        // Calculate left position;
        const start_total_days = _start.endOf("quarter").diff(_start.startOf("quarter"), "day") + 1;
        const startDate = start.diff(_start.startOf("quarter"), "day");
        const width_1 = quarterCellWidth / start_total_days;
        const leftOffset = startDate * width_1;
        const quarterLeft = timelineApi.getQuarterPosition(_start) * quarterCellWidth;
        const left = start.isSameOrBefore(timelineApi.getStart(), "day") ? quarterLeft : quarterLeft + leftOffset;
        // Calculate right position;
        const end_total_days = _end.endOf("quarter").diff(_end.startOf("quarter"), "day") + 1;
        const endDate = _end.endOf("quarter").diff(_end, "day");
        const width_2 = quarterCellWidth / end_total_days;
        const rightOffset = endDate * width_2;
        const quarterRight = (timelineApi.getQuarterPosition(_end) + 1) * quarterCellWidth * -1;
        const right = end.isBefore(timelineApi.getEnd(), "day") ? quarterRight + rightOffset : quarterRight;

        return {left, right};
    }
}