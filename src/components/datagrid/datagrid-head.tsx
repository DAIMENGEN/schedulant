import {SchedulantView} from "@schedulant/types/schedulant-view.tsx";
import {
    type ResizerMouseDownFunc,
    type ResizerMouseUp
} from "@schedulant/hooks/use-resource-area-resizer.ts";

export const DatagridHead = (props: {
    schedulantView: SchedulantView,
    cellResizerMouseUp: ResizerMouseUp,
    cellResizerMouseDownFunc: ResizerMouseDownFunc
}) => {
    const {schedulantView, cellResizerMouseUp, cellResizerMouseDownFunc} = props;
    return (
        <table role={"presentation"} className={"schedulant-datagrid-head schedulant-scrollgrid-sync-table"}>
            {schedulantView.renderResourceTableColgroup()}
            {schedulantView.renderResourceLabel(cellResizerMouseUp, cellResizerMouseDownFunc)}
        </table>
    )
}