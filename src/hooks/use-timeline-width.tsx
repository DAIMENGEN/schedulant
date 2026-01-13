import {useCallback, useLayoutEffect, useState} from "react";
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
    useLayoutEffect(() => {
        // 立即计算初始宽度
        const updateWidth = () => {
            const newWidth = getTimelineWidth();
            setWidth(newWidth);
        };
        updateWidth();
        // 监听窗口大小变化
        const windowResizeListener = () => updateWidth();
        window.addEventListener("resize", windowResizeListener);
        // 监听 timeline header 的 DOM 变化（例如列数变化）
        const elements = document.getElementsByClassName("schedulant-timeline-head");
        const element = elements.item(0) as HTMLElement;
        let observer: MutationObserver | null = null;
        if (element) {
            observer = new MutationObserver(() => {
                // 使用 requestAnimationFrame 确保在 DOM 更新完成后计算
                requestAnimationFrame(updateWidth);
            });
            observer.observe(element, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class']
            });
        }
        return () => {
            window.removeEventListener("resize", windowResizeListener);
            observer?.disconnect();
        };
    }, [getTimelineWidth, state.resourceAreaWidth]);
    return width;
}