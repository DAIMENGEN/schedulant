import {SchedulantView} from "@schedulant/types/schedulant-view.tsx";

export const SchedulantDatagridHeader = (props: { schedulantView: SchedulantView }) => {
    const {schedulantView} = props;
    return (
        <table role={"presentation"} className={"schedulant-datagrid-header schedulant-scrollgrid-sync-table"}>
            {schedulantView.renderResourceTableColgroup()}
            {schedulantView.renderResourceLabel()}
        </table>
    )
}