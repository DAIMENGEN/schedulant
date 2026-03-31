import "@schedulant/styles/schedulant.scss";
import {SchedulantProvider} from "@schedulant/context/schedulant-provider.tsx";
import React, {useCallback, useEffect, useMemo, useRef} from "react";
import {useSchedulantContext} from "@schedulant/hooks/use-schedulant-context.ts";
import type {SchedulantProps} from "@schedulant/types";
import {useSchedulantHeight} from "@schedulant/hooks/use-schedulant-height.ts";
import {useScrollSync} from "@schedulant/hooks/use-sync-scroll.ts";
import {useResourceAreaWidth} from "@schedulant/hooks/use-resource-area-width.ts";
import {DatagridHead} from "@schedulant/components/datagrid/datagrid-head.tsx";
import {TimelineHeader} from "@schedulant/components/timeline/timeline-header.tsx";
import {DatagridBody} from "@schedulant/components/datagrid/datagrid-body.tsx";
import {TimelineBody} from "@schedulant/components/timeline/timeline-body.tsx";
import {TimelineDrawingBoard} from "@schedulant/components/timeline/timeline-drawing-board.tsx";
import {SchedulantView} from "@schedulant/types/schedulant-view.tsx";
import {useSchedulantMount} from "@schedulant/hooks/mounts/use-schedulant-mount.tsx";
import {useResourceAreaResizer} from "@schedulant/hooks/use-resource-area-resizer.ts";
import {handleSelectionClick, clearResourceSelection, type SelectionChangeCallback} from "@schedulant/utils/selection.ts";
import {useVirtualizedRows} from "@schedulant/hooks/use-virtualized-rows.ts";

export const Schedulant = (props: SchedulantProps) => {
    return (
        <SchedulantProvider>
            <Main {...props}/>
        </SchedulantProvider>
    )
}

const Main = (props: SchedulantProps) => {
    const {state, dispatch} = useSchedulantContext();
    const scheduleElRef = useRef<HTMLDivElement>(null);
    const headerLeftScrollerElRef = useRef<HTMLDivElement>(null);
    const headerRightScrollerElRef = useRef<HTMLDivElement>(null);
    const bodyRightScrollerElRef = useRef<HTMLDivElement>(null);
    const bodyLeftScrollerElRef = useRef<HTMLDivElement>(null);
    const resourceAreaColElRef = useRef<HTMLTableColElement>(null);
    const {
        start, end, editable, selectable, lineHeight, slotMinWidth,
        schedulantMaxHeight, schedulantViewType, events, resources,
        milestones, checkpoints, resourceAreaColumns, resourceAreaWidth,
        companyHolidays, specialWorkdays, nationalHolidays,
        dragHintColor, selectionColor,
    } = props;
    const scheduleView = useMemo(
        () => new SchedulantView(props, scheduleElRef),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [start, end, editable, selectable, lineHeight, slotMinWidth,
         schedulantMaxHeight, schedulantViewType, events, resources,
         milestones, checkpoints, resourceAreaColumns, resourceAreaWidth,
         companyHolidays, specialWorkdays, nationalHolidays,
         dragHintColor, selectionColor]
    );
    const schedulantApi = useMemo(() => scheduleView.getScheduleApi(), [scheduleView]);
    // Keep callback props in sync without rebuilding the entire view
    schedulantApi.updateProps(props);
    const cssVariables = useMemo(() => ({
        '--schedulant-drag-hint-color': schedulantApi.getDragHintColor(),
        '--schedulant-selection-color': schedulantApi.getSelectionColor(),
    } as React.CSSProperties), [schedulantApi])
    const {
        datagridResizerMouseUp,
        datagridResizerMouseDown,
        datagridCellResizerMouseUp,
        datagridCellResizerMouseDownFunc
    } = useResourceAreaResizer(dispatch, scheduleElRef, resourceAreaColElRef);
    const {virtualizer, visibleResources} = useVirtualizedRows(
        bodyRightScrollerElRef,
        schedulantApi.getResourceApis(),
        state.collapseIds,
        schedulantApi.getLineHeight(),
    );
    useSchedulantHeight(props.schedulantMaxHeight);
    useSchedulantMount(scheduleElRef, scheduleView);
    useResourceAreaWidth(resourceAreaColElRef, props.resourceAreaWidth);
    useScrollSync(bodyLeftScrollerElRef, bodyRightScrollerElRef, headerLeftScrollerElRef, headerRightScrollerElRef);

    const onResourceSelectRef = useRef(schedulantApi.onResourceSelect());
    onResourceSelectRef.current = schedulantApi.onResourceSelect();
    const selectionCallback = useCallback<SelectionChangeCallback>((ids) => {
        onResourceSelectRef.current?.(ids);
    }, []);
    const visibleResourceIds = useMemo(
        () => visibleResources.map(r => r.getId()),
        [visibleResources]
    );

    const handleClick = useCallback((event: React.MouseEvent) => {
        if (schedulantApi.isSelectable()) {
            handleSelectionClick(event.nativeEvent, visibleResourceIds, selectionCallback);
        }
    }, [schedulantApi, visibleResourceIds, selectionCallback]);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (scheduleElRef.current && !scheduleElRef.current.contains(event.target as Node)) {
                clearResourceSelection(onResourceSelectRef.current);
            }
        };
        document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick);
    }, []);

    return (
        <div className={"schedulant"} ref={scheduleElRef} onMouseUp={datagridResizerMouseUp} onClick={handleClick} onContextMenu={handleClick} style={cssVariables}>
            <div id={"schedulant-view-harness"} className={"schedulant-view-harness"}>
                <div className={"schedulant-view"}>
                    <table role={"grid"} className={"schedulant-scrollgrid"}>
                        <colgroup>
                            <col style={{width: state.resourceAreaWidth}} ref={resourceAreaColElRef}/>
                            <col/>
                            <col/>
                        </colgroup>
                        <thead>
                        <tr role={"presentation"}
                            className={"schedulant-scrollgrid-section schedulant-scrollgrid-section-head"}>
                            <th role={"presentation"}>
                                <div className={"schedulant-scroller-harness"}>
                                    <div className={"schedulant-scroller-head-left"} ref={headerLeftScrollerElRef}>
                                        <DatagridHead schedulantView={scheduleView}
                                                      cellResizerMouseUp={datagridCellResizerMouseUp}
                                                      cellResizerMouseDownFunc={datagridCellResizerMouseDownFunc}/>
                                    </div>
                                </div>
                            </th>
                            <th role={"presentation"} className={"schedulant-resource-timeline-divider"}
                                onMouseUp={datagridResizerMouseUp} onMouseDown={datagridResizerMouseDown}></th>
                            <th role={"presentation"}>
                                <div className={"schedulant-scroller-harness"}>
                                    <div className={"schedulant-scroller-head-right"} ref={headerRightScrollerElRef}>
                                        <div id={"schedulant-timeline-head"}
                                             className={"schedulant-timeline-head"}>
                                            <TimelineHeader schedulantView={scheduleView}/>
                                        </div>
                                    </div>
                                </div>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr role={"presentation"}
                            className={"schedulant-scrollgrid-section schedulant-scrollgrid-section-body"}>
                            <td role={"presentation"}>
                                <div className={"schedulant-scroller-harness"}>
                                    <div className={"schedulant-scroller-body-left"} ref={bodyLeftScrollerElRef}>
                                        <DatagridBody schedulantView={scheduleView}
                                                      virtualizer={virtualizer}
                                                      visibleResources={visibleResources}
                                                      collapseIds={state.collapseIds}
                                                      cellResizerMouseUp={datagridCellResizerMouseUp}
                                                      cellResizerMouseDownFunc={datagridCellResizerMouseDownFunc}/>
                                    </div>
                                </div>
                            </td>
                            <td role={"presentation"} className={"schedulant-resource-timeline-divider"}
                                onMouseUp={datagridResizerMouseUp} onMouseDown={datagridResizerMouseDown}></td>
                            <td role={"presentation"}>
                                <div className={"schedulant-scroller-harness"}>
                                    <div className={"schedulant-scroller-body-right"} ref={bodyRightScrollerElRef}>
                                        <div className={"schedulant-timeline-body"}>
                                            <TimelineBody schedulantView={scheduleView}/>
                                            <TimelineDrawingBoard schedulantView={scheduleView}
                                                                  virtualizer={virtualizer}
                                                                  visibleResources={visibleResources}/>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}