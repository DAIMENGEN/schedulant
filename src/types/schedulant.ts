import {type Dayjs} from "dayjs";
import {
    EventApi,
    type Event,
    type EventContextMenuArg,
    type EventContextMenuItems,
    type EventMountArg,
    type EventMoveMountArg,
    type EventResizeMountArg
} from "@schedulant/types/event.ts";
import {
    type Resource,
    type ResourceApi,
    ResourceApiHelper,
    type ResourceAreaColumn,
    type ResourceContextMenuItems,
    type ResourceLabelContextMenuArg,
    type ResourceLabelMountArg,
    type ResourceLaneContextMenuArg,
    type ResourceLaneMountArg,
    ResourceUtils
} from "@schedulant/types/resource.ts";
import {
    MilestoneApi,
    type Milestone,
    type MilestoneContextMenuArg,
    type MilestoneContextMenuItems,
    type MilestoneMountArg,
    type MilestoneMoveMountArg
} from "@schedulant/types/milestone.ts";
import {
    CheckpointApi,
    type Checkpoint,
    type CheckpointContextMenuArg,
    type CheckpointContextMenuItems,
    type CheckpointMountArg,
    type CheckpointMoveMountArg
} from "@schedulant/types/checkpoint.ts";
import type {
    ContextMenuClickHandler,
    DidMountHandler,
    MountArg,
    MoveHandler,
    ResizeHandler,
    SelectHandler,
    WillUnmountHandler
} from "@schedulant/types/base.ts";
import {Option} from "@schedulant/types/option.ts";
import type {SelectInfoArg} from "@schedulant/types/misc";
import type {SchedulantView, SchedulantViewType} from "@schedulant/types/schedulant-view.tsx";
import {TimelineApi, type TimelineSlotLabelMountArg, type TimelineSlotLaneMountArg} from "@schedulant/types/timeline";
import type {MutableRefObject} from "react";

export type SchedulantProps = {
    end: Dayjs,
    start: Dayjs,
    editable: boolean;
    selectable: boolean;
    lineHeight: number;
    slotMinWidth: number;
    schedulantMaxHeight: number;
    schedulantViewType: SchedulantViewType;
    events: Event[];
    resources: Resource[];
    milestones?: Milestone[];
    checkpoints?: Checkpoint[];
    companyHolidays?: Dayjs[];
    specialWorkdays?: Dayjs[];
    nationalHolidays?: Dayjs[];
    defaultEmptyLanes?: number;
    resourceAreaWidth?: string;
    resourceAreaColumns?: Array<ResourceAreaColumn>;
    selectAllow?: SelectHandler<SelectInfoArg>;
    enableEventContextMenu?: boolean;
    eventContextMenuClick?: ContextMenuClickHandler<EventContextMenuArg>;
    eventContextMenuItems?: EventContextMenuItems;
    eventDidMount?: DidMountHandler<EventMountArg>;
    eventWillUnmount?: WillUnmountHandler<EventMountArg>;
    eventMove?: MoveHandler<EventMoveMountArg>;
    eventResizeStart?: ResizeHandler<EventResizeMountArg>;
    eventResizeEnd?: ResizeHandler<EventResizeMountArg>;
    enableMilestoneContextMenu?: boolean;
    milestoneContextMenuClick?: ContextMenuClickHandler<MilestoneContextMenuArg>;
    milestoneContextMenuItems?: MilestoneContextMenuItems;
    milestoneDidMount?: DidMountHandler<MilestoneMountArg>;
    milestoneWillUnmount?: WillUnmountHandler<MilestoneMountArg>;
    milestoneMove?: MoveHandler<MilestoneMoveMountArg>;
    enableCheckpointContextMenu?: boolean;
    checkpointContextMenuClick?: ContextMenuClickHandler<CheckpointContextMenuArg>;
    checkpointContextMenuItems?: CheckpointContextMenuItems;
    checkpointDidMount?: DidMountHandler<CheckpointMountArg>;
    checkpointWillUnmount?: WillUnmountHandler<CheckpointMountArg>;
    checkpointMove?: MoveHandler<CheckpointMoveMountArg>;
    enableResourceLaneContextMenu?: boolean;
    resourceLaneContextMenuClick?: ContextMenuClickHandler<ResourceLaneContextMenuArg>;
    resourceLaneContextMenuItems?: ResourceContextMenuItems;
    resourceLaneDidMount?: DidMountHandler<ResourceLaneMountArg>;
    resourceLaneWillUnmount?: WillUnmountHandler<ResourceLaneMountArg>;
    enableResourceLabelContextMenu?: boolean;
    resourceLabelContextMenuClick?: ContextMenuClickHandler<ResourceLabelContextMenuArg>;
    resourceLabelContextMenuItems?: ResourceContextMenuItems;
    resourceLabelDidMount?: DidMountHandler<ResourceLabelMountArg>;
    resourceLabelWillUnmount?: WillUnmountHandler<ResourceLabelMountArg>;
    timelineSlotLabelDidMount?: DidMountHandler<TimelineSlotLabelMountArg>;
    timelineSlotLabelWillUnmount?: WillUnmountHandler<TimelineSlotLabelMountArg>;
    timelineSlotLaneDidMount?: DidMountHandler<TimelineSlotLaneMountArg>;
    timelineSlotLaneWillUnmount?: WillUnmountHandler<TimelineSlotLaneMountArg>;
    schedulantDidMount?: DidMountHandler<SchedulantMountArg>;
    schedulantWillUnmount?: DidMountHandler<SchedulantMountArg>;
}

export class SchedulantApi implements PublicSchedulantApi {
    private readonly schedulantProps: SchedulantProps;
    private readonly schedulantView: SchedulantView;
    private readonly timelineApi: TimelineApi;
    private readonly eventApis: EventApi[];
    private readonly resourceApis: ResourceApi[];
    private readonly flatMapResourceApis: ResourceApi[];
    private readonly milestoneApis: MilestoneApi[];
    private readonly checkpointApis: CheckpointApi[];

    private generateTimelineApi(props: SchedulantProps): TimelineApi {
        let timelineApi: TimelineApi;
        switch (props.schedulantViewType) {
            case "Week": {
                const startWeekDate = props.start.startOf("week");
                const endWeekDate = props.end.endOf("week");
                timelineApi = new TimelineApi(startWeekDate, endWeekDate);
                break;
            }
            case "Month": {
                const startMonthDate = props.start.startOf("month");
                const endMonthDate = props.end.endOf("month");
                timelineApi = new TimelineApi(startMonthDate, endMonthDate);
                break;
            }
            case "Quarter": {
                const startQuarterDate = props.start.startOf("quarter");
                const endQuarterDate = props.end.endOf("quarter");
                timelineApi = new TimelineApi(startQuarterDate, endQuarterDate);
                break;
            }
            case "Year": {
                const startYearDate = props.start.startOf("year");
                const endYearDate = props.end.endOf("year");
                timelineApi = new TimelineApi(startYearDate, endYearDate);
                break;
            }
            case "Day":
            default:
                timelineApi = new TimelineApi(props.start, props.end);
                break;
        }
        timelineApi.setSpecialWorkdays(props.specialWorkdays || []);
        timelineApi.setCompanyHolidays(props.companyHolidays || []);
        timelineApi.setNationalHolidays(props.nationalHolidays || []);
        return timelineApi;
    }

    constructor(schedulantView: SchedulantView, props: SchedulantProps) {
        this.eventApis = props.events.map(e => new EventApi(e));
        this.milestoneApis = props.milestones?.map(m => new MilestoneApi(m)) || [];
        this.checkpointApis = props.checkpoints?.map(c => new CheckpointApi(c)) || [];
        this.schedulantProps = props;
        this.schedulantView = schedulantView;
        this.timelineApi = this.generateTimelineApi(props);
        this.resourceApis = ResourceApiHelper.createTree([...props.resources, ...ResourceUtils.createEmptyResources(props.defaultEmptyLanes || 0)], this.eventApis, this.milestoneApis, this.checkpointApis);
        this.flatMapResourceApis = ResourceApiHelper.flatMapTree(this.resourceApis);
    }

    getProps(): SchedulantProps {
        return this.schedulantProps;
    }

    getStart(): Dayjs {
        return this.schedulantProps.start;
    }

    getEnd(): Dayjs {
        return this.schedulantProps.end;
    }

    getLineHeight(): number {
        return this.schedulantProps.lineHeight;
    }

    getSlotMinWidth(): number {
        return this.schedulantProps.slotMinWidth;
    }

    getSchedulantMaxHeight(): number {
        return this.schedulantProps.schedulantMaxHeight;
    }

    getScheduleView(): SchedulantView {
        return this.schedulantView;
    }

    getSchedulantViewType(): SchedulantViewType {
        return this.schedulantProps.schedulantViewType;
    }

    getResourceAreaColumns(): ResourceAreaColumn[] {
        const resourceAreaColumns = this.schedulantProps.resourceAreaColumns;
        return resourceAreaColumns || [{
            field: "title",
            headerContent: "Resource"
        }];
    }

    getTimelineApi(): TimelineApi {
        return this.timelineApi;
    }

    getEventApis(): EventApi[] {
        return this.eventApis;
    }

    getEventApiById(eventId: string): Option<EventApi> {
        return Option.fromNullable(this.eventApis.find(e => e.getId() === eventId));
    }

    getResourceApis(): ResourceApi[] {
        return this.resourceApis;
    }

    getResourceApiById(resourceId: string): Option<ResourceApi> {
        return Option.fromNullable(this.resourceApis.find(r => r.getId() === resourceId));
    }

    getFlatMapResourceApis(): ResourceApi[] {
        return this.flatMapResourceApis;
    }

    isEditable(): boolean {
        const viewType = this.schedulantProps.schedulantViewType;
        return this.schedulantProps.editable && viewType == "Day";
    }

    isSelectable(): boolean {
        return this.schedulantProps.selectable;
    }

    getMilestoneApis(): MilestoneApi[] {
        return this.milestoneApis;
    }

    getMilestoneApiById(milestoneId: string): Option<MilestoneApi> {
        return Option.fromNullable(this.milestoneApis.find(m => m.getId() === milestoneId));
    }

    getCheckpointApis(): CheckpointApi[] {
        return this.checkpointApis;
    }

    getCheckpointApiById(checkpointId: string): Option<CheckpointApi> {
        return Option.fromNullable(this.checkpointApis.find(c => c.getId() === checkpointId));
    }

    getSchedulantElRef(): MutableRefObject<HTMLDivElement | null> {
        return this.schedulantView.getScheduleElRef();
    }

    eventDidMount(arg: EventMountArg): void {
        this.schedulantProps.eventDidMount?.(arg);
    }

    eventWillUnmount(arg: EventMountArg): void {
        this.schedulantProps.eventWillUnmount?.(arg);
    }

    eventMove(arg: EventMoveMountArg): void {
        this.schedulantProps.eventMove?.(arg);
    }

    eventResizeStart(arg: EventResizeMountArg): void {
        this.schedulantProps.eventResizeStart?.(arg);
    }

    eventResizeEnd(arg: EventResizeMountArg): void {
        this.schedulantProps.eventResizeEnd?.(arg);
    }

    selectAllow(arg: SelectInfoArg): void {
        this.schedulantProps.selectAllow?.(arg);
    }

    isEnableEventContextMenu() {
        const isEnable = this.schedulantProps.enableEventContextMenu;
        return isEnable as boolean;
    }

    getEventContextMenuItems() {
        return this.schedulantProps.eventContextMenuItems;
    }

    onEventContextMenuClick(arg: EventContextMenuArg) {
        this.schedulantProps.eventContextMenuClick?.(arg);
    }

    resourceLaneDidMount(arg: ResourceLaneMountArg): void {
        this.schedulantProps.resourceLaneDidMount?.(arg);
    }

    resourceLaneWillUnmount(arg: ResourceLaneMountArg): void {
        this.schedulantProps.resourceLaneWillUnmount?.(arg);
    }

    isEnableResourceLaneContextMenu() {
        const isEnable = this.schedulantProps.enableResourceLaneContextMenu;
        return isEnable as boolean;
    }

    getResourceLaneContextMenuItems() {
        return this.schedulantProps.resourceLaneContextMenuItems;
    }

    onResourceLaneContextMenuClick(arg: ResourceLaneContextMenuArg): void {
        this.schedulantProps.resourceLaneContextMenuClick?.(arg);
    }

    resourceLabelDidMount(arg: ResourceLabelMountArg): void {
        this.schedulantProps.resourceLabelDidMount?.(arg);
    }

    resourceLabelWillUnmount(arg: ResourceLabelMountArg): void {
        this.schedulantProps.resourceLabelWillUnmount?.(arg);
    }


    isEnableResourceLabelContextMenu() {
        const isEnable = this.schedulantProps.enableResourceLabelContextMenu;
        return isEnable as boolean;
    }

    getResourceLabelContextMenuItems() {
        return this.schedulantProps.resourceLabelContextMenuItems;
    }

    onResourceLabelContextMenuClick(arg: ResourceLabelContextMenuArg): void {
        this.schedulantProps.resourceLabelContextMenuClick?.(arg);
    }

    milestoneDidMount(arg: MilestoneMountArg): void {
        this.schedulantProps.milestoneDidMount?.(arg);
    }

    milestoneWillUnmount(arg: MilestoneMountArg): void {
        this.schedulantProps.milestoneWillUnmount?.(arg);
    }


    isEnableMilestoneContextMenu() {
        const isEnable = this.schedulantProps.enableMilestoneContextMenu;
        return isEnable as boolean;
    }

    getMilestoneContextMenuItems() {
        return this.schedulantProps.milestoneContextMenuItems;
    }

    onMilestoneContextMenuClick(arg: MilestoneContextMenuArg): void {
        this.schedulantProps.milestoneContextMenuClick?.(arg);
    }

    milestoneMove(arg: MilestoneMoveMountArg): void {
        this.schedulantProps.milestoneMove?.(arg);
    }

    checkpointDidMount(arg: CheckpointMountArg): void {
        this.schedulantProps.checkpointDidMount?.(arg);
    }

    checkpointWillUnmount(arg: CheckpointMountArg): void {
        this.schedulantProps.checkpointWillUnmount?.(arg);
    }


    isEnableCheckpointContextMenu() {
        const isEnable = this.schedulantProps.enableCheckpointContextMenu;
        return isEnable as boolean;
    }

    getCheckpointContextMenuItems() {
        return this.schedulantProps.checkpointContextMenuItems;
    }

    onCheckpointContextMenuClick(arg: CheckpointContextMenuArg): void {
        this.schedulantProps.checkpointContextMenuClick?.(arg);
    }

    checkpointMove(arg: CheckpointMoveMountArg): void {
        this.schedulantProps.checkpointMove?.(arg);
    }

    timelineSlotLaneDidMount(arg: TimelineSlotLaneMountArg): void {
        this.schedulantProps.timelineSlotLaneDidMount?.(arg);
    }

    timelineSlotLaneWillUnmount(arg: TimelineSlotLaneMountArg): void {
        this.schedulantProps.timelineSlotLaneWillUnmount?.(arg);
    }

    timelineSlotLabelDidMount(arg: TimelineSlotLabelMountArg): void {
        this.schedulantProps.timelineSlotLabelDidMount?.(arg);
    }

    timelineSlotLabelWillUnmount(arg: TimelineSlotLabelMountArg): void {
        this.schedulantProps.timelineSlotLabelWillUnmount?.(arg);
    }

    schedulantDidMount(arg: SchedulantMountArg): void {
        this.schedulantProps.schedulantDidMount?.(arg);
    }

    schedulantWillUnmount(arg: SchedulantMountArg): void {
        this.schedulantProps.schedulantWillUnmount?.(arg);
    }
}

export type PublicSchedulantApiMethods =
    "getEnd" |
    "getStart" |
    "isEditable" |
    "isSelectable" |
    "getLineHeight" |
    "getSlotMinWidth" |
    "getSchedulantMaxHeight";

export type PublicSchedulantApi = Pick<SchedulantApi, PublicSchedulantApiMethods>

export type SchedulantMountArg = MountArg<{ schedulantApi: PublicSchedulantApi }>;

