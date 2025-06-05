import {SchedulantApi, type SchedulantProps} from "./schedulant";
import type {TimelineView} from "@schedulant/types/timeline-view.tsx";
import type {MutableRefObject, ReactNode} from "react";
import type {ResourceApi} from "@schedulant/types/resource.ts";
import {HeadCell} from "@schedulant/components/datagrid/head-cell.tsx";
import {BodyCell} from "@schedulant/components/datagrid/body-cell.tsx";
import {
    SchedulantResourceTableColgroup
} from "@schedulant/components/table-colgroup/schedulant-resource-table-colgroup.tsx";
import {DayTimelineView} from "@schedulant/types/day-timeline-view.tsx";
import {MonthTimelineView} from "@schedulant/types/month-timeline-view.tsx";
import {QuarterTimelineView} from "@schedulant/types/quarter-timeline-view.tsx";
import {WeekTimelineView} from "@schedulant/types/week-timeline-view.tsx";
import {YearTimelineView} from "@schedulant/types/year-timeline-view.tsx";

export type SchedulantViewType = "Day" | "Week" | "Month" | "Quarter" | "Year";

export class SchedulantView {

    private readonly schedulantApi: SchedulantApi;

    private readonly timelineView: TimelineView;

    private readonly schedulantElRef: MutableRefObject<HTMLDivElement | null>;

    constructor(props: SchedulantProps, schedulantElRef: MutableRefObject<HTMLDivElement | null>) {
        this.schedulantElRef = schedulantElRef;
        this.schedulantApi = new SchedulantApi(this, props);
        const schedulantViewType = this.schedulantApi.getSchedulantViewType();
        switch (schedulantViewType) {
            case "Day":
                this.timelineView = new DayTimelineView(this.schedulantApi);
                break;
            case "Week":
                this.timelineView = new WeekTimelineView(this.schedulantApi);
                break;
            case "Month":
                this.timelineView = new MonthTimelineView(this.schedulantApi);
                break;
            case "Quarter":
                this.timelineView = new QuarterTimelineView(this.schedulantApi);
                break;
            case "Year":
                this.timelineView = new YearTimelineView(this.schedulantApi);
                break;
        }
    }

    renderTimelineTableColgroup(): ReactNode {
        return this.timelineView.renderColgroup();
    }

    renderTimelineBodyTableSlots(): ReactNode {
        return this.timelineView.renderBodySlots();
    }

    renderTimelineHeaderTableSlots(): ReactNode {
        return this.timelineView.renderHeaderSlots();
    }

    renderTimelineDrawingBoardTable(collapseIds: Array<string>, timelineWidth: number): ReactNode {
        const drawElements = (resourceApi: ResourceApi) => {
            const milestoneApis = resourceApi.getMilestoneApis();
            const lineHeight = milestoneApis.length > 0 ? this.schedulantApi.getLineHeight() * 1.5 : this.schedulantApi.getLineHeight();
            return (
                <tr key={resourceApi.getId()}>
                    <td data-resource-id={resourceApi.getId()}
                        className={"schedulant-timeline-lane schedulant-resource"}>
                        <div className={"schedulant-timeline-lane-frame"} style={{height: lineHeight}}>
                            {this.timelineView.renderLane(resourceApi, timelineWidth)}
                            <div className={"schedulant-timeline-lane-bg"}></div>
                            {this.timelineView.renderEvents(resourceApi, timelineWidth)}
                            {this.timelineView.renderMilestones(resourceApi, timelineWidth)}
                            {this.timelineView.renderCheckpoints(resourceApi, timelineWidth)}
                        </div>
                    </td>
                </tr>
            )
        }
        const renderElements = (resourceApi: ResourceApi): Array<ReactNode> => {
            if (!collapseIds.some(resourceId => resourceId === resourceApi.getId()) && resourceApi.getChildren().length > 0) {
                const children = resourceApi.getChildren();
                return [drawElements(resourceApi), ...children.flatMap(child => renderElements(child))];
            } else {
                return [drawElements(resourceApi)];
            }
        }
        return (
            <tbody>
            {this.schedulantApi.getResourceApis().flatMap(resourceApi => renderElements(resourceApi))}
            </tbody>
        );
    }

    renderResourceTableColgroup(): ReactNode {
        const resourceAreaColumns = this.schedulantApi.getResourceAreaColumns();
        return <SchedulantResourceTableColgroup resourceAreaColumns={resourceAreaColumns}/>;
    }

    renderResourceLabel(): ReactNode {
        const resourceAreaColumns = this.schedulantApi.getResourceAreaColumns();
        return (
            <thead>
            <tr role={"row"}>
                {
                    resourceAreaColumns.map((resourceAreaColumn, index) => <HeadCell
                        key={resourceAreaColumn.field}
                        schedulantApi={this.schedulantApi}
                        resourceAreaColumn={resourceAreaColumn}
                        isResizable={index != resourceAreaColumns.length - 1}/>)
                }
            </tr>
            </thead>
        )
    }

    renderResourceLane(collapseIds: Array<string>): ReactNode {
        const resourceApis = this.schedulantApi.getResourceApis();
        const resourceAreaColumns = this.schedulantApi.getResourceAreaColumns();
        const renderResource = (resourceApi: ResourceApi) => {
            return resourceAreaColumns.map((resourceAreaColumn, index) => <BodyCell
                key={resourceAreaColumn.field}
                schedulantApi={this.schedulantApi}
                resourceApi={resourceApi}
                collapseIds={collapseIds}
                showPlusSquare={index === 0}
                showIndentation={true}
                resourceAreaColumn={resourceAreaColumn}/>)
        }

        const renderTableRows = (resourceApi: ResourceApi): Array<ReactNode> => {
            if (!collapseIds.some((resourceId: string) => resourceId === resourceApi.getId()) && resourceApi.getChildren().length > 0) {
                const children = resourceApi.getChildren();
                return [<tr key={resourceApi.getId()}
                            role={"row"}>{renderResource(resourceApi)}</tr>, ...children.flatMap(child => renderTableRows(child))];
            } else {
                return [<tr key={resourceApi.getId()} role={"row"}>{renderResource(resourceApi)}</tr>];
            }
        }

        return (
            <tbody>
            {
                resourceApis.flatMap(resourceApi => {
                    return renderTableRows(resourceApi)
                })
            }
            </tbody>
        );
    }

    getTimelineView(): TimelineView {
        return this.timelineView;
    }

    getScheduleApi(): SchedulantApi {
        return this.schedulantApi;
    }

    getScheduleElRef(): MutableRefObject<HTMLDivElement | null> {
        return this.schedulantElRef;
    }
}