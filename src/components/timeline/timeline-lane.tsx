import type {ResourceApi} from "@schedulant/types/resource.ts";
import type {SchedulantApi} from "@schedulant/types/schedulant.ts";
import {type MouseEventHandler, useCallback, useMemo, useRef} from "react";
import {message} from "antd";
import {numberToPixels, pixelsToNumber} from "@schedulant/utils/dom.ts";
import {If} from "@schedulant/utils/if.tsx";

export const TimelineLane = (props: {
    schedulantApi: SchedulantApi,
    resourceApi: ResourceApi,
    timelineWidth: number
}) => {
    const startXRef = useRef<number>(0);
    const startLeftRef = useRef<number>(0);
    const startRightRef = useRef<number>(0);
    const isMoveableRef = useRef(false);
    const [messageApi, contextHolder] = message.useMessage();
    const animationFrameRef = useRef<number | null>(null);
    const timelineLaneRef = useRef<HTMLDivElement | null>(null);
    const timelineLaneSelectedArea = useMemo(() => "schedulant-timeline-lane-selected-area", []);
    const warning = useCallback(() => {
        messageApi.open({
            type: "warning",
            content: "Sorry, There are already existing an event.",
        }).then();
    }, [messageApi]);

    const callSelectAllow = useCallback((element: HTMLDivElement) => {
        const schedulantApi = props.schedulantApi;
        const scheduleView = schedulantApi.getScheduleView();
        const timelineView = scheduleView.getTimelineView();
        const selectedArea = element.firstElementChild as HTMLDivElement;
        const left = pixelsToNumber(selectedArea.style.left);
        const right = pixelsToNumber(selectedArea.style.right);
        const totalSlots = timelineView.getTotalSlots();
        const totalWidth = props.timelineWidth;
        const startDateIndex = Math.ceil(left / totalWidth * totalSlots);
        const endDateIndex = Math.ceil((totalWidth - right) / totalWidth * totalSlots) - 1;
        const startDate = timelineView.getTimelineApi().getDays()[startDateIndex];
        const endDate = timelineView.getTimelineApi().getDays()[endDateIndex];
        schedulantApi.selectAllow({
            el: element,
            resourceApi: props.resourceApi,
            startDate: startDate,
            endDate: endDate,
        });
    }, [props]);

    const createSelectedArea = useCallback((element: HTMLDivElement, offsetX: number) => {
        const schedulantApi = props.schedulantApi;
        const scheduleView = schedulantApi.getScheduleView();
        const timelineView = scheduleView.getTimelineView();
        const laneHeight = timelineView.calculateLaneHeight(props.resourceApi);
        const scheduleEl = schedulantApi.getSchedulantElRef().current;
        if (scheduleEl) {
            const scrollLeft = scheduleEl.scrollLeft;
            const position = scrollLeft + offsetX;
            const totalWidth = props.timelineWidth;
            const totalSlots = timelineView.getTotalSlots();
            const proportion = position / totalWidth;
            const slotIndex = Math.ceil(proportion * totalSlots);
            const left = numberToPixels((slotIndex - 1) / totalSlots * totalWidth);
            const right = numberToPixels(totalWidth - slotIndex / totalSlots * totalWidth);
            const selectedArea = document.createElement("div");
            selectedArea.className = timelineLaneSelectedArea;
            Object.assign(selectedArea.style, {
                position: "absolute",
                left: left,
                right: right,
                height: numberToPixels(laneHeight),
                backgroundColor: "rgb(188, 232, 241, 0.7)"
            });
            element.appendChild(selectedArea);
            startLeftRef.current = pixelsToNumber(left);
            startRightRef.current = pixelsToNumber(right);
        }
    }, [props.resourceApi, props.schedulantApi, props.timelineWidth, timelineLaneSelectedArea]);

    const removeSelectedArea = useCallback((element: HTMLDivElement) => {
        const selectedArea = element.querySelector(`.${timelineLaneSelectedArea}`);
        if (selectedArea) {
            element.removeChild(selectedArea);
        }
    }, [timelineLaneSelectedArea]);

    const updateSelectedArea = useCallback((element: HTMLDivElement, clientX: number) => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(() => {
            const selectedArea = element.querySelector(`.${timelineLaneSelectedArea}`) as HTMLDivElement;
            if (selectedArea) {
                const schedulantApi = props.schedulantApi;
                const scheduleView = schedulantApi.getScheduleView();
                const timelineView = scheduleView.getTimelineView();
                const deltaX = clientX - startXRef.current;
                const totalWidth = props.timelineWidth;
                const totalSlots = timelineView.getTotalSlots();
                const moveSlots = Math.round((deltaX / totalWidth) * totalSlots);
                const distance = (moveSlots / totalSlots) * totalWidth;
                if (Math.sign(deltaX) === 1) {
                    // update right.
                    const newRight = Math.max(startRightRef.current - distance, 0);
                    selectedArea.style.right = numberToPixels(newRight);
                } else if (Math.sign(deltaX) === -1) {
                    // update left.
                    const newLeft = Math.max(startLeftRef.current + distance, 0)
                    selectedArea.style.left = numberToPixels(newLeft);
                }
            }
        });
    }, [props.schedulantApi, props.timelineWidth, timelineLaneSelectedArea]);

    const handleMouseDown: MouseEventHandler<HTMLDivElement> = useCallback(event => {
        event.preventDefault();
        const timelineLane = timelineLaneRef.current;
        if (timelineLane) {
            timelineLane.style.zIndex = "5";
            isMoveableRef.current = true;
            startXRef.current = event.clientX;
            createSelectedArea(timelineLane, event.nativeEvent.offsetX);
        }
    }, [createSelectedArea]);

    const handleMouseMove: MouseEventHandler<HTMLDivElement> = useCallback(event => {
        event.preventDefault();
        const isMoveable = isMoveableRef.current;
        const timelineLane = timelineLaneRef.current;
        if (isMoveable && timelineLane) {
            updateSelectedArea(timelineLane, event.clientX);
        }
    }, [updateSelectedArea]);

    const handleMouseUp: MouseEventHandler<HTMLDivElement> = useCallback(event => {
        event.preventDefault();
        const isMoveable = isMoveableRef.current;
        const timelineLane = timelineLaneRef.current;
        if (isMoveable && timelineLane) {
            timelineLane.style.zIndex = "1";
            isMoveableRef.current = false;
            const editable = props.schedulantApi.isEditable();
            if (editable) {
                const length = props.resourceApi.getEventApis().length;
                if (Math.sign(length) === 1) {
                    warning();
                } else {
                    callSelectAllow(timelineLane);
                }
            }
            removeSelectedArea(timelineLane);
        }
    }, [props, warning, callSelectAllow, removeSelectedArea]);

    const handleMouseOut: MouseEventHandler<HTMLDivElement> = useCallback(event => {
        event.preventDefault();
        const isMoveable = isMoveableRef.current;
        const target = event.relatedTarget as Node;
        const timelineLane = timelineLaneRef.current;
        if (isMoveable && timelineLane && !timelineLane.contains(target)) {
            timelineLane.style.zIndex = "1";
            isMoveableRef.current = false;
            const length = props.resourceApi.getEventApis().length;
            if (Math.sign(length) === 1) {
                warning();
            } else {
                callSelectAllow(timelineLane);
            }
            removeSelectedArea(timelineLane);
        }
    }, [props, warning, callSelectAllow, removeSelectedArea]);

    return (
        <If condition={props.schedulantApi.isSelectable()} fallback={<div className={"schedulant-timeline-lane"}/>}>
            <div className={"schedulant-timeline-lane"} onMouseUp={handleMouseUp} onMouseOut={handleMouseOut}
                 onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} ref={timelineLaneRef}>
                {contextHolder}
            </div>
        </If>
    )
}