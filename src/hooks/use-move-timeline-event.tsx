import React, {useCallback, useEffect, useMemo, useRef} from "react";
import {SchedulantApi} from "@schedulant/types/schedulant.ts";
import {EventApi} from "@schedulant/types/event.ts";
import {ResourceApi} from "@schedulant/types/resource.ts";
import {numberToPixels, pixelsToNumber} from "@schedulant/utils/dom.ts";

export const useMoveTimelineEvent = (props: {
    timelineEventHarnessRef: React.MutableRefObject<HTMLDivElement | null>,
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
            backgroundColor: "rgb(188, 232, 241, 0.7)"
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
            const scheduleApi = props.schedulantApi;
            const scheduleView = scheduleApi.getScheduleView();
            const timelineView = scheduleView.getTimelineView();
            const slotWidth = timelineView.calculateSlotWidth(props.timelineWidth);
            const pressPosition = pressEventPositionRef.current;
            const deltaX = clientX - startXRef.current;
            const offsetRatio = deltaX / slotWidth;
            switch (pressPosition) {
                case "press_event": {
                    const multiple = Math.round(offsetRatio);
                    const distance = multiple * slotWidth;
                    switch (Math.sign(deltaX)) {
                        case 1: {
                            const newLeft_1 = Math.min(startLeftRef.current + distance, props.timelineWidth - slotWidth);
                            const newRight_1 = Math.max(startRightRef.current - distance, props.timelineWidth * -1);
                            positionGuide.style.left = numberToPixels(newLeft_1);
                            positionGuide.style.right = numberToPixels(newRight_1);
                            break;
                        }
                        case -1: {
                            const newLeft_2 = Math.max(startLeftRef.current + distance, 0);
                            const newRight_2 = Math.min(startRightRef.current - distance, slotWidth * -1);
                            positionGuide.style.left = numberToPixels(newLeft_2);
                            positionGuide.style.right = numberToPixels(newRight_2);
                            break;
                        }
                        default:
                            break;
                    }
                    break;
                }
                case "press_event_left": {
                    const distance_1 = Math.round(offsetRatio) * slotWidth;
                    const newLeft = Math.max(startLeftRef.current + distance_1, 0);
                    positionGuide.style.left = numberToPixels(newLeft);
                    break;
                }
                case "press_event_right": {
                    const distance_2 = Math.round(offsetRatio) * slotWidth;
                    const newRight = startRightRef.current - distance_2;
                    positionGuide.style.right = numberToPixels(newRight);
                    break;
                }
            }
        }
    }, [props, eventPositionGuide]);

    const updateEventPosition = useCallback((element: HTMLDivElement, clientX: number) => {
        const scheduleApi = props.schedulantApi;
        const scheduleView = scheduleApi.getScheduleView();
        const timelineView = scheduleView.getTimelineView();
        const slotWidth = timelineView.calculateSlotWidth(props.timelineWidth);
        const pressPosition = pressEventPositionRef.current;
        const deltaX = clientX - startXRef.current;
        const offsetRatio = deltaX / slotWidth;
        switch (pressPosition) {
            case "press_event": {
                const multiple = Math.round(offsetRatio);
                const distance = multiple * slotWidth;
                const eventWidth = pixelsToNumber(element.style.right) * -1 - pixelsToNumber(element.style.left);
                switch (Math.sign(deltaX)) {
                    case 1: {
                        const newLeft_1 = Math.min(startLeftRef.current + distance, props.timelineWidth - eventWidth);
                        const newRight_1 = Math.max(startRightRef.current - distance, props.timelineWidth * -1);
                        element.style.left = numberToPixels(newLeft_1);
                        element.style.right = numberToPixels(newRight_1);
                        break;
                    }
                    case -1: {
                        const newLeft_2 = Math.max(startLeftRef.current + distance, 0);
                        const newRight_2 = Math.min(startRightRef.current - distance, eventWidth * -1);
                        element.style.left = numberToPixels(newLeft_2);
                        element.style.right = numberToPixels(newRight_2);
                        break;
                    }
                    default:
                        break;
                }
                const left = pixelsToNumber(element.style.left);
                const right = pixelsToNumber(element.style.right);
                const startDate_1 = timelineView.calculateDate(props.timelineWidth, left + slotWidth);
                const endDate_1 = timelineView.calculateDate(props.timelineWidth, right * -1);
                scheduleApi.eventMove({
                    el: element,
                    startDate: startDate_1,
                    endDate: endDate_1,
                    eventApi: props.eventApi,
                    schedulantApi: scheduleApi
                });
                break;
            }
            case "press_event_left": {
                const distance_1 = Math.round(offsetRatio) * slotWidth;
                const newLeft = Math.max(startLeftRef.current + distance_1, 0);
                element.style.left = numberToPixels(newLeft);
                const startDate = timelineView.calculateDate(props.timelineWidth, newLeft + slotWidth);
                props.eventApi.setStart(startDate);
                scheduleApi.eventResizeStart({
                    el: element,
                    date: startDate,
                    eventApi: props.eventApi,
                    schedulantApi: props.schedulantApi,
                });
                break;
            }
            case "press_event_right": {
                const distance_2 = Math.round(offsetRatio) * slotWidth;
                const newRight = startRightRef.current - distance_2;
                element.style.right = numberToPixels(newRight);
                const endDate = timelineView.calculateDate(props.timelineWidth, newRight * -1);
                props.eventApi.setEnd(endDate);
                scheduleApi.eventResizeStart({
                    el: element,
                    date: endDate,
                    eventApi: props.eventApi,
                    schedulantApi: props.schedulantApi,
                });
                break;
            }
            case "none":
                break;
        }
    }, [props]);

    const handleMouseMove = useCallback((event: MouseEvent) => {
        event.preventDefault();
        const isDraggable = isDraggableRef.current;
        const timelineEventHarness = props.timelineEventHarnessRef.current;
        if (isDraggable && timelineEventHarness) {
            const deltaX = event.clientX - startXRef.current;
            const newLeft = startLeftRef.current + deltaX;
            const newRight = startRightRef.current - deltaX;
            timelineEventHarness.style.left = numberToPixels(newLeft);
            timelineEventHarness.style.right = numberToPixels(newRight);
            updatePositionGuide(timelineEventHarness, event.clientX);
        }
    }, [props.timelineEventHarnessRef, updatePositionGuide]);

    const leftHandleMouseMove = useCallback((event: MouseEvent) => {
        event.preventDefault();
        const isDraggable = isDraggableRef.current;
        const timelineEventHarness = props.timelineEventHarnessRef.current;
        if (isDraggable && timelineEventHarness) {
            const deltaX = event.clientX - startXRef.current;
            const newLeft = startLeftRef.current + deltaX;
            timelineEventHarness.style.left = numberToPixels(newLeft);
            updatePositionGuide(timelineEventHarness, event.clientX);
        }
    }, [props.timelineEventHarnessRef, updatePositionGuide]);

    const rightHandleMouseMove = useCallback((event: MouseEvent) => {
        event.preventDefault();
        const isDraggable = isDraggableRef.current;
        const timelineEventHarness = props.timelineEventHarnessRef.current;
        if (isDraggable && timelineEventHarness) {
            const deltaX = event.clientX - startXRef.current;
            const newRight = startRightRef.current - deltaX;
            timelineEventHarness.style.right = numberToPixels(newRight);
            updatePositionGuide(timelineEventHarness, event.clientX);
        }
    }, [props.timelineEventHarnessRef, updatePositionGuide]);

    const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = useCallback(event => {
        event.preventDefault();
        const scheduleEl = props.schedulantApi.getSchedulantElRef().current;
        const timelineEventHarness = props.timelineEventHarnessRef.current;
        if (timelineEventHarness && scheduleEl) {
            isDraggableRef.current = true;
            pressEventPositionRef.current = "press_event";
            startXRef.current = event.clientX;
            startLeftRef.current = pixelsToNumber(timelineEventHarness.style.left);
            startRightRef.current = pixelsToNumber(timelineEventHarness.style.right);
            createPositionGuide(timelineEventHarness);
            scheduleEl.addEventListener("mousemove", handleMouseMove);
        } else {
            console.error("scheduleEl", scheduleEl);
            console.error("timelineEventHarness", timelineEventHarness);
        }
    }, [props.schedulantApi, props.timelineEventHarnessRef, createPositionGuide, handleMouseMove]);

    const leftHandleMouseDown: React.MouseEventHandler<HTMLDivElement> = useCallback(event => {
        event.preventDefault();
        const scheduleEl = props.schedulantApi.getSchedulantElRef().current;
        const timelineEventHarness = props.timelineEventHarnessRef.current;
        if (timelineEventHarness && scheduleEl) {
            isDraggableRef.current = true;
            pressEventPositionRef.current = "press_event_left";
            startXRef.current = event.clientX;
            startLeftRef.current = pixelsToNumber(timelineEventHarness.style.left);
            startRightRef.current = pixelsToNumber(timelineEventHarness.style.right);
            createPositionGuide(timelineEventHarness);
            scheduleEl.addEventListener("mousemove", leftHandleMouseMove);
        } else {
            console.error("scheduleEl", scheduleEl);
            console.error("timelineEventHarness", timelineEventHarness);
        }
    }, [createPositionGuide, leftHandleMouseMove, props.schedulantApi, props.timelineEventHarnessRef]);

    const rightHandleMouseDown: React.MouseEventHandler<HTMLDivElement> = useCallback(event => {
        event.preventDefault();
        const scheduleEl = props.schedulantApi.getSchedulantElRef().current;
        const timelineEventHarness = props.timelineEventHarnessRef.current;
        if (timelineEventHarness && scheduleEl) {
            isDraggableRef.current = true;
            pressEventPositionRef.current = "press_event_right";
            startXRef.current = event.clientX;
            startLeftRef.current = pixelsToNumber(timelineEventHarness.style.left);
            startRightRef.current = pixelsToNumber(timelineEventHarness.style.right);
            createPositionGuide(timelineEventHarness);
            scheduleEl.addEventListener("mousemove", rightHandleMouseMove);
        } else {
            console.error("scheduleEl", scheduleEl);
            console.error("timelineEventHarness", timelineEventHarness);
        }
    }, [createPositionGuide, props.schedulantApi, props.timelineEventHarnessRef, rightHandleMouseMove]);

    useEffect(() => {
        const timelineEventHarness = props.timelineEventHarnessRef.current;
        const scheduleEl = props.schedulantApi.getSchedulantElRef().current;
        if (scheduleEl && timelineEventHarness) {
            const timelineLaneFrame = timelineEventHarness.parentElement?.parentElement;
            if (timelineLaneFrame) {
                const handleMouseOutOrUp = (event: MouseEvent) => {
                    event.preventDefault();
                    const isDraggable = isDraggableRef.current;
                    if (isDraggable && !timelineLaneFrame.contains(event.relatedTarget as Node)) {
                        removePositionGuide(timelineEventHarness);
                        updateEventPosition(timelineEventHarness, event.clientX);
                        scheduleEl.removeEventListener("mousemove", handleMouseMove);
                        scheduleEl.removeEventListener("mousemove", leftHandleMouseMove);
                        scheduleEl.removeEventListener("mousemove", rightHandleMouseMove);
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
        return () => {
        }
    }, [handleMouseMove, leftHandleMouseMove, props, removePositionGuide, rightHandleMouseMove, updateEventPosition]);

    return {handleMouseDown, leftHandleMouseDown, rightHandleMouseDown}
}