import {useEffect} from "react";
import {numberToPixels} from "@schedulant/utils/dom.ts";

export const useSchedulantHeight = (schedulantMaxHeight: number) => {
    useEffect(() => {
        const schedulantViewHarness = document.getElementById("schedulant-view-harness");
        const schedulantDataGridBody = document.getElementById("schedulant-datagrid-body");
        const schedulantTimelineHeader = document.getElementById("schedulant-timeline-head");
        const bodyHeight = schedulantDataGridBody ? schedulantDataGridBody.getBoundingClientRect().height : 0;
        const headerHeight = schedulantTimelineHeader ? schedulantTimelineHeader.getBoundingClientRect().height : 0;
        const height = bodyHeight + headerHeight + 13;
        const schedulantHeight = schedulantMaxHeight - height > 0 ? height : schedulantMaxHeight;
        if (schedulantViewHarness) {
            schedulantViewHarness.style.height = numberToPixels(schedulantHeight)
        }
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const newHeight = entry.contentRect.height + headerHeight + 13;
                const schedulantHeight = schedulantMaxHeight - newHeight > 0 ? newHeight : schedulantMaxHeight;
                if (schedulantViewHarness) {
                    schedulantViewHarness.style.height = numberToPixels(schedulantHeight)
                }
            }
        });
        if (schedulantDataGridBody) {
            resizeObserver.observe(schedulantDataGridBody);
        }
        return () => {
            resizeObserver.disconnect();
        }
    }, [schedulantMaxHeight])
}