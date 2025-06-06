import "@schedulant/styles/schedulant.scss";
import {SchedulantProvider} from "@schedulant/context/schedulant-provider.tsx";
import {type MouseEventHandler, useCallback, useMemo, useRef} from "react";
import {useSchedulantContext} from "@schedulant/hooks/use-schedulant-context.ts";
import {numberToPixels} from "@schedulant/utils/dom.ts";
import type {SchedulantProps} from "@schedulant/types";
import {useSchedulantHeight} from "@schedulant/hooks/use-schedulant-height.ts";
import {useSyncScroll} from "@schedulant/hooks/use-sync-scroll.ts";
import {useResourceAreaWidth} from "@schedulant/hooks/use-resource-area-width.ts";
import {DatagridHead} from "@schedulant/components/datagrid/datagrid-head.tsx";
import {TimelineHeader} from "@schedulant/components/timeline/timeline-header.tsx";
import {DatagridBody} from "@schedulant/components/datagrid/datagrid-body.tsx";
import {TimelineBody} from "@schedulant/components/timeline/timeline-body.tsx";
import {TimelineDrawingBoard} from "@schedulant/components/timeline/timeline-drawing-board.tsx";
import {SchedulantView} from "@schedulant/types/schedulant-view.tsx";
import {useSchedulantMount} from "@schedulant/hooks/mounts/use-schedulant-mount.tsx";
import {useResourceAreaResizer} from "@schedulant/hooks/use-resource-area-resizer.ts";

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
    const headerLeftScrollerRef = useRef<HTMLDivElement>(null);
    const headerRightScrollerRef = useRef<HTMLDivElement>(null);
    const bodyRightScrollerRef = useRef<HTMLDivElement>(null);
    const bodyLeftScrollerRef = useRef<HTMLDivElement>(null);
    const resourceAreaColRef = useRef<HTMLTableColElement>(null);

    const scheduleView = useMemo(() => new SchedulantView(props, scheduleElRef), [props]);

    const handleMouseMove = useCallback((event: MouseEvent) => {
        event.preventDefault();
        const resourceAreaCol = resourceAreaColRef.current;
        if (resourceAreaCol) {
            const rect = resourceAreaCol.getBoundingClientRect();
            const offset = event.clientX - rect.left;
            resourceAreaCol.style.width = numberToPixels(offset);
            dispatch({type: "SET_RESOURCE_AREA_WIDTH", width: resourceAreaCol.style.width});
        }
    }, [dispatch]);

    const handleMouseUp: MouseEventHandler<HTMLDivElement> = useCallback(event => {
        event.preventDefault();
        const scheduleEl = scheduleElRef.current;
        if (scheduleEl) {
            scheduleEl.removeEventListener("mousemove", handleMouseMove);
        } else {
            console.error("scheduleEl", scheduleEl);
        }
    }, [handleMouseMove]);

    const handleMouseDown: MouseEventHandler<HTMLDivElement> = useCallback(event => {
        event.preventDefault();
        const scheduleEl = scheduleElRef.current;
        if (scheduleEl) {
            scheduleEl.addEventListener("mousemove", handleMouseMove);
        } else {
            console.error("scheduleEl", scheduleEl);
        }
    }, [handleMouseMove]);

    const {datagridCellResizerMouseUp, datagridCellResizerMouseDownFunc} = useResourceAreaResizer();

    useSchedulantHeight(props.schedulantMaxHeight);
    useSchedulantMount(scheduleElRef, scheduleView);
    useResourceAreaWidth(resourceAreaColRef, props.resourceAreaWidth);
    useSyncScroll(bodyRightScrollerRef, Array.of(headerRightScrollerRef), "left");
    useSyncScroll(bodyRightScrollerRef, Array.of(bodyLeftScrollerRef), "top");
    useSyncScroll(bodyLeftScrollerRef, Array.of(bodyRightScrollerRef), "top");
    useSyncScroll(bodyLeftScrollerRef, Array.of(headerLeftScrollerRef), "left");

    return (
        <div className={"schedulant"} ref={scheduleElRef} onMouseUp={handleMouseUp}>
            <div id={"schedulant-view-harness"} className={"schedulant-view-harness"}>
                <div className={"schedulant-view"}>
                    <table role={"grid"} className={"schedulant-scrollgrid"}>
                        <colgroup>
                            <col style={{width: state.resourceAreaWidth}} ref={resourceAreaColRef}/>
                            <col/>
                            <col/>
                        </colgroup>
                        <thead>
                        <tr role={"presentation"}
                            className={"schedulant-scrollgrid-section schedulant-scrollgrid-section-head"}>
                            <th role={"presentation"}>
                                <div className={"schedulant-scroller-harness"}>
                                    <div className={"schedulant-scroller-head-left"} ref={headerLeftScrollerRef}>
                                        <DatagridHead schedulantView={scheduleView}
                                                      cellResizerMouseUp={datagridCellResizerMouseUp}
                                                      cellResizerMouseDownFunc={datagridCellResizerMouseDownFunc}/>
                                    </div>
                                </div>
                            </th>
                            <th role={"presentation"} className={"schedulant-resource-timeline-divider"}
                                onMouseUp={handleMouseUp} onMouseDown={handleMouseDown}></th>
                            <th role={"presentation"}>
                                <div className={"schedulant-scroller-harness"}>
                                    <div className={"schedulant-scroller-head-right"} ref={headerRightScrollerRef}>
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
                                    <div className={"schedulant-scroller-body-left"} ref={bodyLeftScrollerRef}>
                                        <DatagridBody schedulantView={scheduleView}
                                                      cellResizerMouseUp={datagridCellResizerMouseUp}
                                                      cellResizerMouseDownFunc={datagridCellResizerMouseDownFunc}/>
                                    </div>
                                </div>
                            </td>
                            <td role={"presentation"} className={"schedulant-resource-timeline-divider"}
                                onMouseUp={handleMouseUp} onMouseDown={handleMouseDown}></td>
                            <td role={"presentation"}>
                                <div className={"schedulant-scroller-harness"}>
                                    <div className={"schedulant-scroller-body-right"} ref={bodyRightScrollerRef}>
                                        <div className={"schedulant-timeline-body"}>
                                            <TimelineBody schedulantView={scheduleView}/>
                                            <TimelineDrawingBoard schedulantView={scheduleView}/>
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