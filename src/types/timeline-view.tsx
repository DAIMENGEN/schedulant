import type {SchedulantApi} from "@schedulant/types/schedulant.ts";
import type {ResourceApi} from "@schedulant/types/resource.ts";
import type {TimelineApi} from "@schedulant/types/timeline.ts";
import type {ReactNode} from "react";
import type {Dayjs} from "dayjs";
import type {Position} from "@schedulant/types/base.ts";
import {SchedulantTimelineLane} from "@schedulant/components/timeline/schedulant-timeline-lane.tsx";
import {SchedulantTimelineEventHarness} from "@schedulant/components/timeline/schedulant-timeline-event-harness.tsx";
import {
    SchedulantTimelineMilestoneHarness
} from "@schedulant/components/timeline/schedulant-timeline-milestone-harness.tsx";
import {
    SchedulantTimelineCheckpointHarness
} from "@schedulant/components/timeline/schedulant-timeline-checkpoint-harness.tsx";

export abstract class TimelineView {

    private readonly schedulantApi: SchedulantApi;

    constructor(schedulantApi: SchedulantApi) {
        this.schedulantApi = schedulantApi;
    }

    getSchedulantApi(): SchedulantApi {
        return this.schedulantApi;
    }

    getTimelineApi(): TimelineApi {
        return this.schedulantApi.getTimelineApi();
    }

    renderLane(resourceApi: ResourceApi, timelineWidth: number): ReactNode {
        return (
            <SchedulantTimelineLane schedulantApi={this.schedulantApi} resourceApi={resourceApi}
                                    timelineWidth={timelineWidth}/>
        )
    }

    renderEvents(resourceApi: ResourceApi, timelineWidth: number): ReactNode {
        const timelineApi = this.schedulantApi.getTimelineApi();
        const eventApis = resourceApi.getEventApis();
        return (
            <div className={"schedulant-timeline-events schedulant-scrollgrid-sync-inner"}>
                {
                    eventApis.filter(eventApi => !eventApi.getStart().isAfter(timelineApi.getEnd()) && !eventApi.getEnd().getOrElse(timelineApi.getEnd()).isBefore(timelineApi.getStart())).map(eventApi => {
                        const position = this.calculatePosition(timelineWidth, eventApi.getStart(), eventApi.getEnd().getOrElse(timelineApi.getEnd()));
                        return (
                            <SchedulantTimelineEventHarness key={eventApi.getId()}
                                                            eventApi={eventApi}
                                                            position={position}
                                                            resourceApi={resourceApi}
                                                            schedulantApi={this.schedulantApi}
                                                            timelineWidth={timelineWidth}/>
                        )
                    })
                }
            </div>
        )
    }

    renderMilestones(resource: ResourceApi, timelineWidth: number): ReactNode {
        const timelineApi = this.schedulantApi.getTimelineApi();
        const milestoneApis = resource.getMilestoneApis();
        return (
            <div className={"schedulant-timeline-milestones schedulant-scrollgrid-sync-inner"}>
                {
                    milestoneApis.filter(milestoneApi => (milestoneApi.getTime().isAfter(timelineApi.getStart(), "day") || milestoneApi.getTime().isSame(timelineApi.getStart(), "day")) && milestoneApi.getTime().isSameOrBefore(timelineApi.getEnd(), "day")).map(milestoneApi => {
                        const position = this.calculatePosition(timelineWidth, milestoneApi.getTime(), milestoneApi.getTime());
                        return <SchedulantTimelineMilestoneHarness key={milestoneApi.getId()}
                                                                   position={position}
                                                                   milestoneApi={milestoneApi}
                                                                   timelineWidth={timelineWidth}
                                                                   schedulantApi={this.schedulantApi}/>
                    })
                }
            </div>
        );
    }

    renderCheckpoints(resource: ResourceApi, timelineWidth: number): ReactNode {
        const timelineApi = this.schedulantApi.getTimelineApi();
        const checkpointApis = resource.getCheckpointApis();
        return (
            <div className={"schedulant-timeline-checkpoints schedulant-scrollgrid-sync-inner"}>
                {
                    checkpointApis.filter(checkpointApi => (checkpointApi.getTime().isAfter(timelineApi.getStart(), "day") || checkpointApi.getTime().isSame(timelineApi.getStart(), "day")) && checkpointApi.getTime().isSameOrBefore(timelineApi.getEnd(), "day")).map(checkpointApi => {
                        const position = this.calculatePosition(timelineWidth, checkpointApi.getTime(), checkpointApi.getTime());
                        return <SchedulantTimelineCheckpointHarness key={checkpointApi.getId()}
                                                                    position={position}
                                                                    timelineWidth={timelineWidth}
                                                                    checkpointApi={checkpointApi}
                                                                    schedulantApi={this.schedulantApi}/>
                    })
                }
            </div>
        );
    }

    calculateLaneHeight(resourceApi: ResourceApi): number {
        const milestoneNumbers = resourceApi.getMilestoneApis().length;
        if (milestoneNumbers === 0) {
            return this.schedulantApi.getLineHeight();
        } else {
            return this.schedulantApi.getLineHeight() * 1.5;
        }
    }

    calculateEventHeight(): number {
        return this.schedulantApi.getLineHeight() * 0.7;
    }

    abstract renderColgroup(): ReactNode;

    abstract renderBodySlots(): ReactNode;

    abstract renderHeaderSlots(): ReactNode;

    abstract calculateDate(timelineWidth: number, point: number): Dayjs;

    abstract calculateSlotWidth(timelineWidth: number): number;

    abstract calculatePosition(timelineWidth: number, start: Dayjs, end: Dayjs): Position;

}