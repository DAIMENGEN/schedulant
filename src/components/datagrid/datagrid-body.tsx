import {SchedulantView} from "@schedulant/types/schedulant-view.tsx";
import type {ResizerMouseDownFunc, ResizerMouseUp} from "@schedulant/hooks/use-resource-area-resizer.ts";
import {useCallback, useMemo} from "react";
import {useMoveResource, type DropPosition} from "@schedulant/hooks/use-move-resource.tsx";
import {DndContext, DragOverlay, PointerSensor, KeyboardSensor, useSensor, useSensors, closestCenter} from "@dnd-kit/core";
import {SortableContext, verticalListSortingStrategy} from "@dnd-kit/sortable";
import {restrictToVerticalAxis} from "@dnd-kit/modifiers";
import type {Modifier} from "@dnd-kit/core";
import type {ResourceApi} from "@schedulant/types/resource.ts";
import type {Virtualizer} from "@tanstack/react-virtual";

const overlayOffsetModifier: Modifier = ({transform, activatorEvent}) => {
    if (!activatorEvent) return transform;
    return {
        ...transform,
        x: transform.x + 20,
        y: transform.y + 20,
    };
};

export const DatagridBody = (props: {
    schedulantView: SchedulantView,
    virtualizer: Virtualizer<HTMLDivElement, Element>,
    visibleResources: ResourceApi[],
    collapseIds: string[],
    cellResizerMouseUp: ResizerMouseUp,
    cellResizerMouseDownFunc: ResizerMouseDownFunc
}) => {
    const {schedulantView, virtualizer, visibleResources, collapseIds, cellResizerMouseUp, cellResizerMouseDownFunc} = props;
    const schedulantApi = schedulantView.getScheduleApi();
    const flatResources = schedulantApi.getFlatMapResourceApis();

    const handleResourceMove = useCallback(async (el: HTMLElement, draggedId: string, targetId: string, position: DropPosition) => {
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
    }, [schedulantApi, flatResources]);

    const {dragState, handleDragStart, handleDragMove, handleDragEnd, handleDragCancel} =
        useMoveResource(flatResources, handleResourceMove);

    const sensors = useSensors(
        useSensor(PointerSensor, {activationConstraint: {distance: 5}}),
        useSensor(KeyboardSensor)
    );

    const sortableItems = visibleResources.map((r) => r.getId());
    const isEditable = schedulantApi.isEditable();
    const virtualItems = virtualizer.getVirtualItems();
    const totalSize = virtualizer.getTotalSize();

    const activeResource = useMemo(() => {
        if (!dragState.activeId) return null;
        return flatResources.find(r => r.getId() === String(dragState.activeId)) ?? null;
    }, [dragState.activeId, flatResources]);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
                <table role={"presentation"} id={"schedulant-datagrid-body"}
                       className={"schedulant-datagrid-body schedulant-scrollgrid-sync-table"}>
                    {schedulantView.renderResourceTableColgroup()}
                    {schedulantView.renderResourceLane(visibleResources, virtualItems, totalSize, collapseIds, cellResizerMouseUp, cellResizerMouseDownFunc, {
                        isDraggable: isEditable,
                        dragState,
                    })}
                </table>
            </SortableContext>
            <DragOverlay dropAnimation={null} modifiers={[overlayOffsetModifier]}>
                {activeResource ? (
                    <div className={"schedulant-drag-overlay"}>
                        {activeResource.getTitle()}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}