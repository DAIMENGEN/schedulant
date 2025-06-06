import {SchedulantView} from "@schedulant/types/schedulant-view.tsx";
import {useSchedulantContext} from "@schedulant/hooks/use-schedulant-context.ts";
import type {
    ResizerMouseDownFunc,
    ResizerMouseUp
} from "@schedulant/hooks/use-resource-area-resizer.ts";

export const DatagridBody = (props: {
    schedulantView: SchedulantView,
    cellResizerMouseUp: ResizerMouseUp,
    cellResizerMouseDownFunc: ResizerMouseDownFunc
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