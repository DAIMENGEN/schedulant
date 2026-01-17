import {type MouseEvent as ReactMouseEvent, type MouseEventHandler, type RefObject, useCallback, useEffect, useMemo, useRef} from "react";
import {SchedulantApi} from "@schedulant/types/schedulant.ts";
import {EventApi} from "@schedulant/types/event.ts";
import {ResourceApi} from "@schedulant/types/resource.ts";
import {numberToPixels, pixelsToNumber} from "@schedulant/utils/dom.ts";
import throttle from "lodash/throttle";


export const useMoveTimelineEvent = (props: {
    timelineEventHarnessRef: RefObject<HTMLDivElement | null>,
    timelineWidth: number,
    eventApi: EventApi,
    resourceApi: ResourceApi,
    schedulantApi: SchedulantApi,
}) => {
    const eventPositionGuide = useMemo(() => "schedulant-timeline-event-position-guide", []);
    const startXRef = useRef<number>(0);
    const startLeftRef = useRef<number>(0);
    const startRightRef = useRef<number>(0);
    const isDraggableRef = useRef<boolean>(false);
    const pressEventPositionRef = useRef<"press_event" | "press_event_left" | "press_event_right" | "none">("none");

    const calculateMoveParams = useCallback((clientX: number) => {
        const scheduleApi = props.schedulantApi;
        const scheduleView = scheduleApi.getScheduleView();
        const timelineView = scheduleView.getTimelineView();
        const deltaX = clientX - startXRef.current;
        const totalWidth = props.timelineWidth;
        const totalSlots = timelineView.getTotalSlots();
        const moveSlots = Math.round((deltaX / totalWidth) * totalSlots);
        const distance = (moveSlots / totalSlots) * totalWidth;
        return { moveSlots, distance, deltaX };
    }, [props]);

    const createPositionGuide = useCallback((element: HTMLDivElement) => {
        const milestoneApis = props.resourceApi.getMilestoneApis();
        const left = element.style.left;
        const right = element.style.right;
        const height = milestoneApis.length > 0 ? props.schedulantApi.getLineHeight() * 1.5 : props.schedulantApi.getLineHeight();
        const positionGuide = document.createElement("div");
        positionGuide.className = eventPositionGuide;
        Object.assign(positionGuide.style, {
            position: "absolute",
            zIndex: 1,
            left: left,
            right: right,
            height: numberToPixels(height),
            backgroundColor: props.schedulantApi.getDragHintColor()
        });
        element.parentNode?.insertBefore(positionGuide, element);
    }, [props, eventPositionGuide]);

    const removePositionGuide = useCallback((element: HTMLDivElement) => {
        const positionGuide = element.previousElementSibling;
        if (positionGuide?.className === eventPositionGuide) {
            element.parentElement?.removeChild(positionGuide);
        }
    }, [eventPositionGuide]);

    const updatePositionGuide = useCallback((element: HTMLDivElement, clientX: number) => {
        const positionGuide = element.previousElementSibling as HTMLDivElement;
        if (positionGuide && positionGuide.className === eventPositionGuide) {
            const pressPosition = pressEventPositionRef.current;
            const { distance } = calculateMoveParams(clientX);

            switch (pressPosition) {
                case "press_event": {
                    positionGuide.style.left = numberToPixels(Math.max(startLeftRef.current + distance, 0));
                    positionGuide.style.right = numberToPixels(startRightRef.current - distance);
                    break;
                }
                case "press_event_left": {
                    const newLeft = Math.max(startLeftRef.current + distance, 0);
                    positionGuide.style.left = numberToPixels(newLeft);
                    break;
                }
                case "press_event_right": {
                    const newRight = startRightRef.current - distance;
                    positionGuide.style.right = numberToPixels(newRight);
                    break;
                }
            }
        }
    }, [calculateMoveParams, eventPositionGuide]);

    const updateEventPosition = useCallback((element: HTMLDivElement, clientX: number) => {
        const eventApi = props.eventApi
        const schedulantApi = props.schedulantApi;
        const pressPosition = pressEventPositionRef.current;
        const { moveSlots, distance } = calculateMoveParams(clientX);
        switch (pressPosition) {
            case "press_event": {
                element.style.left = numberToPixels(Math.max(startLeftRef.current + distance, 0));
                element.style.right = numberToPixels(startRightRef.current - distance);
                const startDate = eventApi.getStart().add(moveSlots, "day");
                const endDate = eventApi.getEnd().add(moveSlots, "day");
                schedulantApi.eventMove({
                    el: element,
                    startDate: startDate,
                    endDate: endDate,
                    eventApi: eventApi,
                    schedulantApi: schedulantApi
                });
                break;
            }
            case "press_event_left": {
                const newLeft = Math.max(startLeftRef.current + distance, 0);
                element.style.left = numberToPixels(newLeft);
                const startDate = eventApi.getStart().add(moveSlots, "day");
                schedulantApi.eventResizeStart({
                    el: element,
                    date: startDate,
                    eventApi: eventApi,
                    schedulantApi: schedulantApi,
                });
                break;
            }
            case "press_event_right": {
                const newRight = startRightRef.current - distance;
                element.style.right = numberToPixels(newRight);
                const endDate = eventApi.getEnd().add(moveSlots, "day");
                schedulantApi.eventResizeEnd({
                    el: element,
                    date: endDate,
                    eventApi: eventApi,
                    schedulantApi: schedulantApi,
                });
                break;
            }
            case "none":
                break;
        }
    }, [props, calculateMoveParams]);

    const handleMouseMove = useCallback((event: globalThis.MouseEvent) => {
        event.preventDefault();
        const isDraggable = isDraggableRef.current;
        const timelineEventHarness = props.timelineEventHarnessRef.current;
        if (isDraggable && timelineEventHarness) {
            const { deltaX } = calculateMoveParams(event.clientX);
            const newLeft = startLeftRef.current + deltaX;
            const newRight = startRightRef.current - deltaX;
            switch (pressEventPositionRef.current) {
                case "press_event":
                    timelineEventHarness.style.left = numberToPixels(newLeft);
                    timelineEventHarness.style.right = numberToPixels(newRight);
                    break;
                case "press_event_left":
                    timelineEventHarness.style.left = numberToPixels(newLeft);
                    break;
                case "press_event_right":
                    timelineEventHarness.style.right = numberToPixels(newRight);
                    break;
            }
            updatePositionGuide(timelineEventHarness, event.clientX);
        }
    }, [props.timelineEventHarnessRef, updatePositionGuide, calculateMoveParams]);

    // Throttled version for better performance
    const throttledHandleMouseMove = useMemo(
        () => throttle(handleMouseMove, 16), // ~60fps
        [handleMouseMove]
    );

    const handleMouseDownGeneric = useCallback((event: ReactMouseEvent<HTMLDivElement>, positionType: "press_event" | "press_event_left" | "press_event_right") => {
        event.preventDefault();
        const scheduleEl = props.schedulantApi.getSchedulantElRef().current;
        const timelineEventHarness = props.timelineEventHarnessRef.current;
        if (timelineEventHarness && scheduleEl) {
            isDraggableRef.current = true;
            pressEventPositionRef.current = positionType;
            startXRef.current = event.clientX;
            startLeftRef.current = pixelsToNumber(timelineEventHarness.style.left);
            startRightRef.current = pixelsToNumber(timelineEventHarness.style.right);
            createPositionGuide(timelineEventHarness);
            scheduleEl.addEventListener("mousemove", throttledHandleMouseMove);
        } else {
            console.error("scheduleEl", scheduleEl);
            console.error("timelineEventHarness", timelineEventHarness);
        }
    }, [props.schedulantApi, props.timelineEventHarnessRef, createPositionGuide, throttledHandleMouseMove]);

    const handleMouseDown: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        handleMouseDownGeneric(event, "press_event");
    }, [handleMouseDownGeneric]);

    const leftHandleMouseDown: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        handleMouseDownGeneric(event, "press_event_left");
    }, [handleMouseDownGeneric]);

    const rightHandleMouseDown: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
        handleMouseDownGeneric(event, "press_event_right");
    }, [handleMouseDownGeneric]);

    useEffect(() => {
        const timelineEventHarness = props.timelineEventHarnessRef.current;
        const scheduleEl = props.schedulantApi.getSchedulantElRef().current;
        if (scheduleEl && timelineEventHarness) {
            const timelineLaneFrame = timelineEventHarness.parentElement?.parentElement;
            if (timelineLaneFrame) {
                const handleMouseOutOrUp = (event: globalThis.MouseEvent) => {
                    event.preventDefault();
                    const isDraggable = isDraggableRef.current;
                    if (isDraggable && !timelineLaneFrame.contains(event.relatedTarget as Node)) {
                        removePositionGuide(timelineEventHarness);
                        updateEventPosition(timelineEventHarness, event.clientX);
                        // 重置样式到初始位置，等待数据驱动的重新渲染
                        // timelineEventHarness.style.left = numberToPixels(startLeftRef.current);
                        // timelineEventHarness.style.right = numberToPixels(startRightRef.current);
                        scheduleEl.removeEventListener("mousemove", throttledHandleMouseMove);
                        isDraggableRef.current = false;
                        pressEventPositionRef.current = "none";
                    }
                }
                timelineLaneFrame.addEventListener("mouseup", handleMouseOutOrUp);
                timelineLaneFrame.addEventListener("mouseout", handleMouseOutOrUp);
                return () => {
                    timelineLaneFrame.removeEventListener("mouseup", handleMouseOutOrUp);
                    timelineLaneFrame.removeEventListener("mouseout", handleMouseOutOrUp);
                }
            }
        }
    }, [throttledHandleMouseMove, props, removePositionGuide, updateEventPosition]);

    return {handleMouseDown, leftHandleMouseDown, rightHandleMouseDown}
}
