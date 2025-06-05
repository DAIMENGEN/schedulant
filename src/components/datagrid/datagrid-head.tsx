import {SchedulantView} from "@schedulant/types/schedulant-view.tsx";

export const DatagridHead = (props: { schedulantView: SchedulantView }) => {
    const {schedulantView} = props;
    return (
        <table role={"presentation"} className={"schedulant-datagrid-head schedulant-scrollgrid-sync-table"}>
            {schedulantView.renderResourceTableColgroup()}
            {schedulantView.renderResourceLabel()}
        </table>
    )
}