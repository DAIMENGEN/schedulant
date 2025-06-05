import {SchedulantView} from "@schedulant/types/schedulant-view.tsx";
import {useEffect, useRef} from "react";
import {useResourceAreaResizer} from "@schedulant/hooks/use-resource-area-resizer.ts";
import {getHTMLTableElementByClassName} from "@schedulant/utils/dom.ts";

export const DatagridHead = (props: { schedulantView: SchedulantView }) => {
    const {schedulantView} = props;
    const {handleMouseUp, handleMouseDown} = useResourceAreaResizer();
    const datagridHeadRef = useRef<HTMLTableElement>(null);
    useEffect(() => {
        const datagridHead = datagridHeadRef.current;
        const datagridBody = getHTMLTableElementByClassName("schedulant-datagrid-body");
        if (datagridHead) {
            datagridHead.addEventListener("mouseup", handleMouseUp);
            datagridBody.addEventListener("mouseup", handleMouseUp);
            return () => {
                datagridHead.removeEventListener("mouseup", handleMouseUp);
                datagridBody.removeEventListener("mouseup", handleMouseUp);
            }
        }
    }, [handleMouseUp]);
    return (
        <table role={"presentation"} className={"schedulant-datagrid-head schedulant-scrollgrid-sync-table"} ref={datagridHeadRef}>
            {schedulantView.renderResourceTableColgroup()}
            {schedulantView.renderResourceLabel(handleMouseDown)}
        </table>
    )
}