import {SchedulantView} from "@schedulant/types/schedulant-view.tsx";
import {useSchedulantContext} from "@schedulant/hooks/use-schedulant-context.ts";
import {useResourceAreaResizer} from "@schedulant/hooks/use-resource-area-resizer.ts";
import {useEffect, useRef} from "react";
import {getHTMLTableElementByClassName} from "@schedulant/utils/dom.ts";

export const DatagridBody = (props: {
    schedulantView: SchedulantView
}) => {
    const {schedulantView} = props;
    const {state} = useSchedulantContext();
    const {handleMouseUp, handleMouseDown} = useResourceAreaResizer();
    const datagridBodyRef = useRef<HTMLTableElement>(null);
    useEffect(() => {
        const datagridHead = getHTMLTableElementByClassName("schedulant-datagrid-head");
        const datagridBody = datagridBodyRef.current;
        if (datagridBody && datagridHead) {
            datagridHead.addEventListener("mouseup", handleMouseUp);
            datagridBody.addEventListener("mouseup", handleMouseUp);
            return () => {
                datagridHead.removeEventListener("mouseup", handleMouseUp);
                datagridBody.removeEventListener("mouseup", handleMouseUp);
            }
        }
    }, [handleMouseUp]);
    return (
        <table role={"presentation"} id={"schedulant-datagrid-body"}
               className={"schedulant-datagrid-body schedulant-scrollgrid-sync-table"} ref={datagridBodyRef}>
            {schedulantView.renderResourceTableColgroup()}
            {schedulantView.renderResourceLane(state.collapseIds, handleMouseDown)}
        </table>
    )
}