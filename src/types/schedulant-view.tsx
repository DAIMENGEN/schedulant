import {SchedulantApi, type SchedulantProps} from "./schedulant";
import type {TimelineView} from "@schedulant/types/timeline-view.tsx";
import React, {type RefObject, type ReactNode} from "react";
import type {ResourceApi} from "@schedulant/types/resource.ts";
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

    renderTimelineDrawingBoardTable(collapseIds: Array<string>, timelineWidth: number): ReactNode {
        const drawElements = (resourceApi: ResourceApi) => {
            const milestoneApis = resourceApi.getMilestoneApis();
            const lineHeight = milestoneApis.length > 0 ? this.schedulantApi.getLineHeight() * 1.5 : this.schedulantApi.getLineHeight();

            const handleLaneClick = () => {
                if (this.schedulantApi.isSelectable()) {
                    const resourceId = resourceApi.getId();
                    const allResources = document.querySelectorAll('.schedulant-resource-selected');
                    allResources.forEach(el => el.classList.remove('schedulant-resource-selected'));
                    const resourceElements = document.querySelectorAll(`[data-resource-id="${resourceId}"].schedulant-resource`);
                    resourceElements.forEach(el => el.classList.add('schedulant-resource-selected'));
                }
            };

            return (
                <tr key={resourceApi.getId()}>
                    <td data-resource-id={resourceApi.getId()}
                        className={"schedulant-timeline-lane schedulant-resource"}
                        onClick={handleLaneClick}>
                        <div className={"schedulant-timeline-lane-frame"} style={{height: lineHeight}}>
                            {this.timelineView.renderLane()}
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
        collapseIds: Array<string>,
        cellResizerMouseUp: ResizerMouseUp,
        cellResizerMouseDownFunc: ResizerMouseDownFunc,
        dragDropHandlers?: {
            isDraggable: boolean;
            dragState: {
                draggedResource: ResourceApi | null;
                dragOverResource: ResourceApi | null;
                dropPosition: 'before' | 'after' | 'child' | null;
            };
            handleDragStart: (resourceApi: ResourceApi) => (e: React.DragEvent) => void;
            handleDragOver: (resourceApi: ResourceApi) => (e: React.DragEvent) => void;
            handleDragLeave: (e: React.DragEvent) => void;
            handleDrop: (resourceApi: ResourceApi) => (e: React.DragEvent) => void;
            handleDragEnd: () => void;
        }
    ): ReactNode {
        const resourceApis = this.schedulantApi.getResourceApis();
        const resourceAreaColumns = this.schedulantApi.getResourceAreaColumns();
        const renderResource = (resourceApi: ResourceApi) => {
            return resourceAreaColumns.map((resourceAreaColumn, index) => {
                const dragProps = dragDropHandlers ? {
                    isDraggable: dragDropHandlers.isDraggable,
                    isDragging: dragDropHandlers.dragState.draggedResource?.getId() === resourceApi.getId(),
                    isDragOver: dragDropHandlers.dragState.dragOverResource?.getId() === resourceApi.getId(),
                    dropPosition: dragDropHandlers.dragState.dropPosition,
                    onDragStart: dragDropHandlers.handleDragStart(resourceApi),
                    onDragOver: dragDropHandlers.handleDragOver(resourceApi),
                    onDragLeave: dragDropHandlers.handleDragLeave,
                    onDrop: dragDropHandlers.handleDrop(resourceApi),
                    onDragEnd: dragDropHandlers.handleDragEnd,
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

    getScheduleElRef(): RefObject<HTMLDivElement | null> {
        return this.schedulantElRef;
    }
}