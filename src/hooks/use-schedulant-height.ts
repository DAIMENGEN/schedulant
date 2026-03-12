import {useEffect} from "react";
import {numberToPixels} from "@schedulant/utils/dom.ts";
import {SCHEDULANT_HEIGHT_OFFSET} from "@schedulant/constants.ts";

export const useSchedulantHeight = (schedulantMaxHeight: number) => {
    useEffect(() => {
        const schedulantViewHarness = document.getElementById("schedulant-view-harness");
        const schedulantDataGridBody = document.getElementById("schedulant-datagrid-body");
        const schedulantTimelineHeader = document.getElementById("schedulant-timeline-head");
        const bodyHeight = schedulantDataGridBody ? schedulantDataGridBody.getBoundingClientRect().height : 0;
        const headerHeight = schedulantTimelineHeader ? schedulantTimelineHeader.getBoundingClientRect().height : 0;
        const height = bodyHeight + headerHeight + SCHEDULANT_HEIGHT_OFFSET;
        const schedulantHeight = schedulantMaxHeight - height > 0 ? height : schedulantMaxHeight;
        if (schedulantViewHarness) {
            schedulantViewHarness.style.height = numberToPixels(schedulantHeight)
        }
        const recalculateHeight = () => {
            const currentBodyHeight = schedulantDataGridBody ? schedulantDataGridBody.getBoundingClientRect().height : 0;
            const currentHeaderHeight = schedulantTimelineHeader ? schedulantTimelineHeader.getBoundingClientRect().height : 0;
            const newHeight = currentBodyHeight + currentHeaderHeight + SCHEDULANT_HEIGHT_OFFSET;
            const newSchedulantHeight = schedulantMaxHeight - newHeight > 0 ? newHeight : schedulantMaxHeight;
            if (schedulantViewHarness) {
                schedulantViewHarness.style.height = numberToPixels(newSchedulantHeight);
            }
        };
        const resizeObserver = new ResizeObserver(() => {
            recalculateHeight();
        });
        if (schedulantDataGridBody) {
            resizeObserver.observe(schedulantDataGridBody);
        }
        if (schedulantTimelineHeader) {
            resizeObserver.observe(schedulantTimelineHeader);
        }
        return () => {
            resizeObserver.disconnect();
        }
    }, [schedulantMaxHeight])
}