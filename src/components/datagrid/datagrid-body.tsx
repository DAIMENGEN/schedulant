import {SchedulantView} from "@schedulant/types/schedulant-view.tsx";
import {useSchedulantContext} from "@schedulant/hooks/use-schedulant-context.ts";
import type {
    DatagridCellResizerMouseDownFunc,
    DatagridCellResizerMouseUp
} from "@schedulant/hooks/use-resource-area-resizer.ts";

export const DatagridBody = (props: {
    schedulantView: SchedulantView,
    cellResizerMouseUp: DatagridCellResizerMouseUp,
    cellResizerMouseDownFunc: DatagridCellResizerMouseDownFunc
}) => {
    const {state} = useSchedulantContext();
    const {schedulantView, cellResizerMouseUp, cellResizerMouseDownFunc} = props;
    return (
        <table role={"presentation"} id={"schedulant-datagrid-body"}
               className={"schedulant-datagrid-body schedulant-scrollgrid-sync-table"}>
            {schedulantView.renderResourceTableColgroup()}
            {schedulantView.renderResourceLane(state.collapseIds, cellResizerMouseUp, cellResizerMouseDownFunc)}
        </table>
    )
}