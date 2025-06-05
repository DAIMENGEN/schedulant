import type {ReactNode} from "react";
import {TimelineView} from "@schedulant/types/timeline-view.tsx";
import {
    TimelineColgroup
} from "@schedulant/components/timeline/timeline-colgroup.tsx";
import {TimelineBodySlot} from "@schedulant/components/timeline/timeline-body-slot.tsx";
import {TimelineHeaderSlot} from "@schedulant/components/timeline/timeline-header-slot.tsx";
import type {Position} from "@schedulant/types/base";
import type {Dayjs} from "dayjs";

export class DayTimelineView extends TimelineView {

    renderColgroup(): ReactNode {
        const scheduleApi = this.getSchedulantApi();
        const timelineApi = this.getTimelineApi();
        const days = timelineApi.getDays();
        const slotMinWidth = scheduleApi.getSlotMinWidth();
        return <TimelineColgroup dates={days} minWidth={slotMinWidth}/>;
    }

    renderBodySlots(): ReactNode {
        const timelineApi = this.getTimelineApi();
        const days = timelineApi.getDays();
        return (
            <tbody>
            <tr role={"row"}>
                {
                    days.map(date => (
                        <TimelineBodySlot key={date.format("YYYY-MM-DD")}
                                          date={date}
                                          dataDate={date.format("YYYY-MM-DD")}
                                          classNames={["schedulant-day", timelineApi.isHoliday(date) ? "schedulant-holiday" : '']}/>
                    ))
                }
            </tr>
            </tbody>
        );
    }

    renderHeaderSlots(): ReactNode {
        const timelineApi = this.getTimelineApi();
        const days = timelineApi.getDays();
        const months = timelineApi.populateMonthsWithDays();
        const years = timelineApi.populateYearsWithDays();
        return (
            <tbody>
            <tr role={"row"} className={"schedulant-timeline-head-row"}>
                {
                    years.map(date => (
                        <TimelineHeaderSlot key={date.year.year()}
                                            level={1}
                                            date={date.year}
                                            dataDate={date.year.year().toString()}
                                            colSpan={date.days.length}
                                            timeText={date.year.year().toString()}
                                            classNames={["schedulant-year"]}/>
                    ))
                }
            </tr>
            <tr role={"row"} className={"schedulant-timeline-head-row"}>
                {
                    months.map(date => (
                        <TimelineHeaderSlot key={`${date.month.format("YYYY-MM")}`}
                                            level={2}
                                            date={date.month}
                                            dataDate={date.month.format("YYYY-MM")}
                                            colSpan={date.days.length}
                                            timeText={date.month.format("MMM")}
                                            classNames={["schedulant-month"]}/>
                    ))
                }
            </tr>
            <tr role={"row"} className={"schedulant-timeline-head-row"}>
                {
                    days.map(date => (
                        <TimelineHeaderSlot key={date.format("YYYY-MM-DD")}
                                            level={3}
                                            date={date}
                                            dataDate={date.format("YYYY-MM-DD")}
                                            colSpan={1}
                                            timeText={date.format("ddd")}
                                            classNames={["schedulant-day", timelineApi.isHoliday(date) ? "schedulant-holiday" : '']}/>
                    ))
                }
            </tr>
            <tr role={"row"} className={"schedulant-timeline-head-row"}>
                {
                    days.map(date => (
                        <TimelineHeaderSlot key={date.format("YYYY-MM-DD")}
                                            level={4}
                                            date={date}
                                            dataDate={date.format("YYYY-MM-DD")}
                                            colSpan={1}
                                            timeText={date.format("DD")}
                                            classNames={["schedulant-day", timelineApi.isHoliday(date) ? "schedulant-holiday" : '']}/>
                    ))
                }
            </tr>
            </tbody>
        );
    }

    calculateDate(timelineWidth: number, point: number): Dayjs {
        const timelineApi = this.getTimelineApi();
        const slotWidth = this.calculateSlotWidth(timelineWidth);
        const index = Math.ceil((point / slotWidth) - 1);
        const date = timelineApi.getDays().at(index);
        if (!date) {
            throw new RangeError("Calculated index is out of bounds.")
        }
        return date;
    }

    calculateSlotWidth(timelineWidth: number): number {
        const timelineApi = this.getTimelineApi();
        const days = timelineApi.getDays();
        return timelineWidth / days.length;
    }

    calculatePosition(timelineWidth: number, start: Dayjs, end: Dayjs): Position {
        const timeline = this.getTimelineApi();
        const dayCellWidth = timelineWidth / timeline.getDays().length;
        const dayLeft = timeline.getDayPosition(start.isBefore(timeline.getStart()) ? timeline.getStart() : start) * dayCellWidth;
        const dayRight = (timeline.getDayPosition(end.isAfter(timeline.getEnd()) ? timeline.getEnd() : end) + 1) * dayCellWidth * -1;
        return {left: dayLeft, right: dayRight};
    }
}