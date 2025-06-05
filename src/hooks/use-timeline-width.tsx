import {useCallback, useEffect, useState} from "react";
import {useSchedulantContext} from "@schedulant/hooks/use-schedulant-context.ts";

export const useTimelineWidth = () => {
    const getTimelineWidth = useCallback(() => {
        const elements = document.getElementsByClassName("schedulant-timeline-head");
        const element = elements.item(0) as HTMLElement;
        const table = element.getElementsByTagName("table").item(0);
        const timelineWidth = table?.offsetWidth;
        return timelineWidth ? timelineWidth : 0;
    }, []);
    const [width, setWidth] = useState(0);
    const {state} = useSchedulantContext();
    useEffect(() => {
        setWidth(getTimelineWidth());
        const windowResizeListener = () => setWidth(getTimelineWidth());
        window.addEventListener("resize", windowResizeListener);
        return () => {
            window.removeEventListener("resize", windowResizeListener);
        }
    }, [getTimelineWidth, state.resourceAreaWidth]);
    return width;
}