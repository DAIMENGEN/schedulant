import {SchedulantView} from "@schedulant/types/schedulant-view.tsx";
import {useSchedulantContext} from "@schedulant/hooks/use-schedulant-context.ts";
import type {ResizerMouseDownFunc, ResizerMouseUp} from "@schedulant/hooks/use-resource-area-resizer.ts";
import {useCallback} from "react";
import {useMoveResource} from "@schedulant/hooks/use-move-resource.tsx";

export const DatagridBody = (props: {
    schedulantView: SchedulantView,
    cellResizerMouseUp: ResizerMouseUp,
    cellResizerMouseDownFunc: ResizerMouseDownFunc
}) => {
    const {state} = useSchedulantContext();
    const {schedulantView, cellResizerMouseUp, cellResizerMouseDownFunc} = props;
    const schedulantApi = schedulantView.getScheduleApi();

    const handleResourceMove = useCallback(async (el: HTMLElement, draggedId: string, targetId: string, position: 'before' | 'after' | 'child') => {
        // Find resources to get complete information
        const flatResources = schedulantApi.getFlatMapResourceApis();
        const draggedResource = flatResources.find(r => r.getId() === draggedId);
        const targetResource = flatResources.find(r => r.getId() === targetId);
        if (draggedResource && targetResource) {
            const oldParent = draggedResource.getParent();
            schedulantApi.resourceLaneMove({
                el: el,
                schedulantApi: schedulantApi,
                draggedResourceApi: draggedResource,
                targetResourceApi: targetResource,
                position,
                oldParentResourceApi: oldParent.isDefined() ? oldParent.get() : undefined,
            });
        }
    }, [schedulantApi]);

    const resourceMoveHandler = useMoveResource(handleResourceMove)
    const isEditable = schedulantApi.isEditable();
    return (
        <table role={"presentation"} id={"schedulant-datagrid-body"}
               className={"schedulant-datagrid-body schedulant-scrollgrid-sync-table"}>
            {schedulantView.renderResourceTableColgroup()}
            {schedulantView.renderResourceLane(state.collapseIds, cellResizerMouseUp, cellResizerMouseDownFunc, {
                isDraggable: isEditable,
                ...resourceMoveHandler
            })}
        </table>
    )
}