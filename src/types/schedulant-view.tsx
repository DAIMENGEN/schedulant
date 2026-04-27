import {SchedulantApi, type SchedulantProps} from "./schedulant";
import type {TimelineView} from "@schedulant/types/timeline-view.tsx";
import {type RefObject, type ReactNode} from "react";
import type {ResourceApi} from "@schedulant/types/resource.ts";
import type {DragDropState} from "@schedulant/hooks/use-move-resource.tsx";
import {HeadCell} from "@schedulant/components/datagrid/head-cell.tsx";
import {BodyCell} from "@schedulant/components/datagrid/body-cell.tsx";
import {DatagridColgroup} from "@schedulant/components/datagrid/datagrid-colgroup.tsx";
import {DayTimelineView} from "@schedulant/types/day-timeline-view.tsx";
import {MonthTimelineView} from "@schedulant/types/month-timeline-view.tsx";
import {QuarterTimelineView} from "@schedulant/types/quarter-timeline-view.tsx";
import {WeekTimelineView} from "@schedulant/types/week-timeline-view.tsx";
import {YearTimelineView} from "@schedulant/types/year-timeline-view.tsx";
import type {
    ResizerMouseDownFunc,
    ResizerMouseUp
} from "@schedulant/hooks/use-resource-area-resizer.ts";
import type {VirtualItem} from "@tanstack/react-virtual";

export type SchedulantViewType = "Day" | "Week" | "Month" | "Quarter" | "Year";

export class SchedulantView {

    private readonly schedulantApi: SchedulantApi;

    private readonly timelineView: TimelineView;

    private readonly schedulantElRef: RefObject<HTMLDivElement | null>;

    constructor(props: SchedulantProps, schedulantElRef: RefObject<HTMLDivElement | null>) {
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

    renderTimelineDrawingBoardTable(visibleResources: ResourceApi[], virtualItems: VirtualItem[], totalSize: number, timelineWidth: number): ReactNode {
        const drawElements = (resourceApi: ResourceApi) => {
            const lineHeight = this.timelineView.calculateLaneHeight(resourceApi);

            return (
                <tr key={resourceApi.getId()}>
                    <td data-resource-id={resourceApi.getId()}
                        className={"schedulant-resource"}>
                        <div className={"schedulant-timeline-lane"} style={{height: lineHeight}}>
                            {this.timelineView.renderEvents(resourceApi, timelineWidth)}
                            {this.timelineView.renderMilestones(resourceApi, timelineWidth)}
                            {this.timelineView.renderCheckpoints(resourceApi, timelineWidth)}
                        </div>
                    </td>
                </tr>
            )
        }

        const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
        const paddingBottom = virtualItems.length > 0 ? totalSize - virtualItems[virtualItems.length - 1].end : 0;

        return (
            <tbody>
            {paddingTop > 0 && <tr><td style={{height: paddingTop, padding: 0, border: "none"}} /></tr>}
            {virtualItems.map(virtualRow => {
                const resource = visibleResources[virtualRow.index];
                return drawElements(resource);
            })}
            {paddingBottom > 0 && <tr><td style={{height: paddingBottom, padding: 0, border: "none"}} /></tr>}
            </tbody>
        );
    }

    renderResourceTableColgroup(): ReactNode {
        const resourceAreaColumns = this.schedulantApi.getResourceAreaColumns();
        return <DatagridColgroup resourceAreaColumns={resourceAreaColumns}/>;
    }

    renderResourceLabel(cellResizerMouseUp: ResizerMouseUp, cellResizerMouseDownFunc: ResizerMouseDownFunc): ReactNode {
        const resourceAreaColumns = this.schedulantApi.getResourceAreaColumns();
        return (
            <thead>
            <tr role={"row"}>
                {
                    resourceAreaColumns.map((resourceAreaColumn, index) => <HeadCell
                        key={resourceAreaColumn.field}
                        schedulantApi={this.schedulantApi}
                        cellResizerMouseUp={cellResizerMouseUp}
                        resourceAreaColumn={resourceAreaColumn}
                        cellResizerMouseDownFunc={cellResizerMouseDownFunc}
                        isResizable={index != resourceAreaColumns.length - 1}/>)
                }
            </tr>
            </thead>
        )
    }

    renderResourceLane(
        visibleResources: ResourceApi[],
        virtualItems: VirtualItem[],
        totalSize: number,
        collapseIds: Array<string>,
        cellResizerMouseUp: ResizerMouseUp,
        cellResizerMouseDownFunc: ResizerMouseDownFunc,
        dragDropHandlers?: {
            isDraggable: boolean;
            dragState: DragDropState;
        }
    ): ReactNode {
        const resourceAreaColumns = this.schedulantApi.getResourceAreaColumns();
        const renderResource = (resourceApi: ResourceApi) => {
            return resourceAreaColumns.map((resourceAreaColumn, index) => {
                const dragProps = dragDropHandlers ? {
                    isDraggable: dragDropHandlers.isDraggable,
                    activeId: dragDropHandlers.dragState.activeId,
                    overId: dragDropHandlers.dragState.overId,
                    dropPosition: dragDropHandlers.dragState.dropPosition,
                } : {};
                return <BodyCell
                    key={resourceAreaColumn.field}
                    schedulantApi={this.schedulantApi}
                    resourceApi={resourceApi}
                    collapseIds={collapseIds}
                    showPlusSquare={index === 0}
                    showIndentation={true}
                    cellResizerMouseUp={cellResizerMouseUp}
                    resourceAreaColumn={resourceAreaColumn}
                    cellResizerMouseDownFunc={cellResizerMouseDownFunc}
                    isResizable={index != resourceAreaColumns.length - 1}
                    {...dragProps}
                />
            })
        }

        const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
        const paddingBottom = virtualItems.length > 0 ? totalSize - virtualItems[virtualItems.length - 1].end : 0;

        return (
            <tbody>
            {paddingTop > 0 && <tr><td colSpan={resourceAreaColumns.length} style={{height: paddingTop, padding: 0, border: "none"}} /></tr>}
            {virtualItems.map(virtualRow => {
                const resource = visibleResources[virtualRow.index];
                return <tr key={resource.getId()} role={"row"}>{renderResource(resource)}</tr>;
            })}
            {paddingBottom > 0 && <tr><td colSpan={resourceAreaColumns.length} style={{height: paddingBottom, padding: 0, border: "none"}} /></tr>}
            </tbody>
        );
    }

    getTimelineView(): TimelineView {
        return this.timelineView;
    }

    getScheduleApi(): SchedulantApi {
        return this.schedulantApi;
    }

    getScheduleElRef(): RefObject<HTMLDivElement | null> {
        return this.schedulantElRef;
    }
}