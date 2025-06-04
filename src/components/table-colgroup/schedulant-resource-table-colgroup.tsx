import type {ResourceAreaColumn} from "@schedulant/types/resource.ts";

export const SchedulantResourceTableColgroup = (props: {
    resourceAreaColumns: ResourceAreaColumn[]
}) => {
    return (
        <colgroup>
            {
                props.resourceAreaColumns.map(column => <col key={column.field} style={{minWidth: 100}}/>)
            }
        </colgroup>
    )
}