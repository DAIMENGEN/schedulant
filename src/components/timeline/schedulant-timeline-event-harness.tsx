import type {EventApi} from "@schedulant/types/event.ts";
import type {ResourceApi} from "@schedulant/types/resource.ts";
import type {SchedulantApi} from "@schedulant/types/schedulant.ts";
import type {Position} from "@schedulant/types/base.ts";
import {useRef} from "react";
import {useEventMount} from "@schedulant/hooks/mounts/use-event-mount";
import {useMoveTimelineEvent} from "@schedulant/hooks/use-move-timeline-event";
import {numberToPixels} from "@schedulant/utils/dom";
import {Dropdown} from "antd";
import {If} from "@schedulant/utils/if";
import {TriangleLeftIcon} from "@schedulant/icons/triangle-left-icon.tsx";
import {DragIcon} from "@schedulant/icons/drag-icon.tsx";
import {TriangleRightIcon} from "@schedulant/icons/triangle-right-icon.tsx";

export const SchedulantTimelineEventHarness = (props: {
    schedulantApi: SchedulantApi,
    resourceApi: ResourceApi,
    eventApi: EventApi,
    timelineWidth: number,
    position: Position
}) => {
    const timelineEventRef = useRef<HTMLDivElement | null>(null);
    const timelineEventHarnessRef = useRef<HTMLDivElement | null>(null);
    const timelineApi = props.schedulantApi.getTimelineApi();
    const timelineView = props.schedulantApi.getScheduleView().getTimelineView();
    const textColor = props.eventApi.getTextColor().getOrElse("white");
    const borderColor = props.eventApi.getBorderColor().getOrElse(props.eventApi.getColor());
    const backgroundColor = props.eventApi.getBackgroundColor().getOrElse(props.eventApi.getColor());
    const laneHeight = timelineView.calculateLaneHeight(props.resourceApi);
    const eventHeight = timelineView.calculateEventHeight();
    const top = (laneHeight - eventHeight) / 2 - 1;
    const {isPast, isFuture, isProcess} = useEventMount(timelineEventRef, props.schedulantApi, props.eventApi);
    const {handleMouseDown, leftHandleMouseDown, rightHandleMouseDown} = useMoveTimelineEvent({
        timelineEventHarnessRef: timelineEventHarnessRef,
        timelineWidth: props.timelineWidth,
        eventApi: props.eventApi,
        resourceApi: props.resourceApi,
        schedulantApi: props.schedulantApi
    });
    return (
        <div className={"schedulant-timeline-event-harness"} ref={timelineEventHarnessRef} style={{
            top: numberToPixels(top),
            height: numberToPixels(eventHeight),
            lineHeight: numberToPixels(eventHeight),
            left: numberToPixels(props.position.left),
            right: numberToPixels(props.position.right),
        }}>
            <Dropdown disabled={!props.schedulantApi.isEnableEventContextMenu()}
                      destroyOnHidden={true}
                      trigger={["contextMenu"]}
                      menu={{
                          items: props.schedulantApi.getEventContextMenuItems(),
                          onClick: (arg) => {
                              const {key, keyPath, domEvent} = arg;
                              props.schedulantApi.onEventContextMenuClick({
                                  key: key,
                                  keyPath: keyPath,
                                  domEvent: domEvent,
                                  isPast: isPast,
                                  isFuture: isFuture,
                                  isProcess: isProcess,
                                  eventApi: props.eventApi,
                                  schedulantApi: props.schedulantApi,
                              });
                          }
                      }}>
                <div className={"schedulant-timeline-event"}
                     style={{backgroundColor: backgroundColor, border: `1px solid ${borderColor}`}}
                     ref={timelineEventRef}>
                    <If condition={props.schedulantApi.isEditable()}
                        fallback={<If condition={props.eventApi.getStart().isBefore(timelineApi.getStart())}
                                      fallback={<div style={{width: 10, height: eventHeight}}></div>}>
                            <TriangleLeftIcon width={10} height={eventHeight} color={`#FFFFFF`}/>
                        </If>}>
                        <If condition={!props.eventApi.getStart().isBefore(timelineApi.getStart())}
                            fallback={<TriangleLeftIcon width={10} height={eventHeight} color={`#FFFFFF`}/>}>
                            <div className={"schedulant-event-resize-handle"}
                                 onMouseDown={leftHandleMouseDown}
                                 style={{width: 10, height: eventHeight, cursor: "ew-resize"}}>
                                <DragIcon width={10} height={eventHeight} color={`#FFFFFF`}/>
                            </div>
                        </If>
                    </If>

                    <If condition={props.schedulantApi.isEditable() && !props.eventApi.getStart().isBefore(timelineApi.getStart()) && props.eventApi.getEnd().getOrElse(timelineApi.getEnd()).isSameOrBefore(timelineApi.getEnd())}
                        fallback={
                            <div className={"schedulant-event-main"}
                                 style={{color: textColor, width: "calc(100% - 20px)"}}>
                                <If condition={props.eventApi.getUrl().isDefined()}
                                    fallback={<span>{props.eventApi.getTitle()}</span>}>
                                    {props.eventApi.getUrl().isDefined() && <a href={props.eventApi.getUrl().get()}
                                                                               style={{color: "inherit"}}>{props.eventApi.getTitle()}</a>}
                                </If>
                            </div>}>
                        <div className={"schedulant-event-main"}
                             style={{color: textColor, width: "calc(100% - 20px)", cursor: "grab"}}
                             onMouseDown={handleMouseDown}>
                            <If condition={props.eventApi.getUrl().isDefined()}
                                fallback={<span>{props.eventApi.getTitle()}</span>}>
                                {props.eventApi.getUrl().isDefined() && <a href={props.eventApi.getUrl().get()}
                                                                           style={{color: "inherit"}}>{props.eventApi.getTitle()}</a>}
                            </If>
                        </div>
                    </If>

                    <If condition={props.schedulantApi.isEditable()}
                        fallback={<If
                            condition={props.eventApi.getEnd().getOrElse(timelineApi.getEnd()).isAfter(timelineApi.getEnd())}
                            fallback={<div style={{width: 10, height: eventHeight}}></div>}>
                            <TriangleRightIcon width={10} height={eventHeight} color={"#FFFFFF"}/>
                        </If>}>
                        <If condition={props.eventApi.getEnd().getOrElse(timelineApi.getEnd()).isSameOrBefore(timelineApi.getEnd())}
                            fallback={<TriangleRightIcon width={10} height={eventHeight} color={"#FFFFFF"}/>}>
                            <div className={"schedulant-event-resize-handle"}
                                 onMouseDown={rightHandleMouseDown}
                                 style={{width: 10, height: eventHeight, cursor: "ew-resize"}}>
                                <DragIcon width={10} height={eventHeight} color={`#FFFFFF`}/>
                            </div>
                        </If>
                    </If>
                </div>
            </Dropdown>
        </div>
    )
}