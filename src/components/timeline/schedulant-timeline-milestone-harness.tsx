import type {Position} from "@schedulant/types/base";
import type {MilestoneApi} from "@schedulant/types/milestone.ts";
import type {SchedulantApi} from "@schedulant/types/schedulant.ts";
import {useRef} from "react";
import {useMilestoneMount} from "@schedulant/hooks/mounts/use-milestone-mount.tsx";
import { useMoveTimelineMarker } from "@schedulant/hooks/use-move-timeline-marker";
import {numberToPixels} from "@schedulant/utils/dom.ts";
import {Dropdown} from "antd";
import {FlagIcon} from "@schedulant/icons/flag-icon.tsx";

export const SchedulantTimelineMilestoneHarness = (props: {
    schedulantApi: SchedulantApi,
    milestoneApi: MilestoneApi,
    timelineWidth: number,
    position: Position
}) => {
    const timelineMilestoneRef = useRef<HTMLDivElement | null>(null);
    const timelineMilestoneHarnessRef = useRef<HTMLDivElement | null>(null);
    const isEditable = props.schedulantApi.isEditable();
    const status = props.milestoneApi.getStatus();
    const color = props.milestoneApi.getColor().getOrElse(status === "Success" ? "green" : (status === "Failure" ? "red" : "yellow"));
    const timelineView = props.schedulantApi.getScheduleView().getTimelineView();
    const laneHeight = timelineView.calculateLaneHeight(props.milestoneApi.getResourceApi());
    const top = laneHeight * 0.1 * -1;
    const {isPast, isFuture, isProcess} = useMilestoneMount(timelineMilestoneRef, props.schedulantApi, props.milestoneApi);
    const {handleMouseUp, handleMouseDown} = useMoveTimelineMarker({
        markerRef: timelineMilestoneHarnessRef,
        timelineWidth: props.timelineWidth,
        schedulantApi: props.schedulantApi,
        milestoneApi: props.milestoneApi
    });
    return (
        <div className={"schedulant-timeline-milestone-harness"} style={{
            top: numberToPixels(top),
            height: numberToPixels(laneHeight),
            lineHeight: numberToPixels(laneHeight),
            left: numberToPixels(props.position.left),
            right: numberToPixels(props.position.right),
        }} onMouseUp={isEditable ? handleMouseUp : void 0} onMouseDown={isEditable ? handleMouseDown: void 0} ref={timelineMilestoneHarnessRef}>
            <Dropdown disabled={!props.schedulantApi.isEnableMilestoneContextMenu()}
                      destroyOnHidden={true}
                      trigger={["contextMenu"]}
                      menu={{
                          items: props.schedulantApi.getMilestoneContextMenuItems(),
                          onClick: (arg) => {
                              const {key, keyPath, domEvent} = arg;
                              props.schedulantApi.onMilestoneContextMenuClick({
                                  key: key,
                                  keyPath: keyPath,
                                  domEvent: domEvent,
                                  isPast: isPast,
                                  isFuture: isFuture,
                                  isProcess: isProcess,
                                  milestoneApi: props.milestoneApi,
                                  schedulantApi: props.schedulantApi,
                              })
                          }
                      }}>
                <div className={`schedulant-timeline-milestone`} ref={timelineMilestoneRef}>
                    <div className={`schedulant-milestone-main`}>
                        <FlagIcon width={laneHeight * 0.5} height={laneHeight * 0.5} color={color}/>
                    </div>
                </div>
            </Dropdown>
        </div>
    )
}