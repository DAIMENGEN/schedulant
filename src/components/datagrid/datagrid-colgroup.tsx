import type {ResourceAreaColumn} from "@schedulant/types/resource.ts";
import {DATAGRID_COLUMN_MIN_WIDTH} from "@schedulant/constants.ts";

export const DatagridColgroup = (props: {
    resourceAreaColumns: ResourceAreaColumn[]
}) => {
    return (
        <colgroup>
            {
                props.resourceAreaColumns.map(column => <col key={column.field} style={{minWidth: DATAGRID_COLUMN_MIN_WIDTH}}/>)
            }
        </colgroup>
    )
}