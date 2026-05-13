import {useLayoutEffect, useState} from "react";
import {useSchedulantContext} from "@schedulant/hooks/use-schedulant-context.ts";

export const useTimelineWidth = () => {
    const [width, setWidth] = useState(0);
    const {state} = useSchedulantContext();
    useLayoutEffect(() => {
        const elements = document.getElementsByClassName("schedulant-timeline-head");
        const element = elements.item(0) as HTMLElement;
        const table = element?.getElementsByTagName("table").item(0);
        if (!table) return;

        const updateWidth = () => {
            const newWidth = table.offsetWidth;
            setWidth(prevWidth => prevWidth !== newWidth ? newWidth : prevWidth);
        };

        updateWidth();

        // 使用 ResizeObserver 监听 table 尺寸变化，回调在 layout 完成后触发
        const resizeObserver = new ResizeObserver(() => {
            updateWidth();
        });
        resizeObserver.observe(table);

        // 监听窗口大小变化
        window.addEventListener("resize", updateWidth);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", updateWidth);
        };
    }, [state.resourceAreaWidth]);
    return width;
}