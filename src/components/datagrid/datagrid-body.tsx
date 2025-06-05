import {SchedulantView} from "@schedulant/types/schedulant-view.tsx";
import {useSchedulantContext} from "@schedulant/hooks/use-schedulant-context.ts";

export const DatagridBody = (props: {
    schedulantView: SchedulantView
}) => {
    const {schedulantView} = props;
    const {state} = useSchedulantContext()
    return (
        <table role={"presentation"} id={"schedulant-datagrid-body"}
               className={"schedulant-datagrid-body schedulant-scrollgrid-sync-table"}>
            {schedulantView.renderResourceTableColgroup()}
            {schedulantView.renderResourceLane(state.collapseIds)}
        </table>
    )
}