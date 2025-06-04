import type {Dayjs} from "dayjs";
import type {ReactNode} from "react";
import {Option} from "@schedulant/types/option.ts";
import type {ResourceApi} from "@schedulant/types/resource.ts";
import type {PublicSchedulantApi} from "@schedulant/types/schedulant.ts";
import type {Dictionary, MenuArg, MenuItems, MountArg, TimeStage} from "@schedulant/types/base.ts";

export type CheckpointArg = {
    checkpointApi: PublicCheckpointApi;
    schedulantApi: PublicSchedulantApi;
}

export type CheckpointContextMenuItems = MenuItems;

export type CheckpointMountArg = MountArg<CheckpointArg & TimeStage>;

export type CheckpointContextMenuArg = MenuArg<CheckpointArg & TimeStage>;

export type CheckpointMoveMountArg = MountArg<CheckpointArg & { date: Dayjs }>;

export type Checkpoint = {
    id: string;
    time: Dayjs;
    title: string;
    resourceId: string;
    color?: string;
    tooltip?: ReactNode;
    extendedProps?: Dictionary;
}

export class CheckpointApi {
    private checkpoint: Checkpoint;
    private resourceApi?: ResourceApi;

    constructor(checkpoint: Checkpoint) {
        this.checkpoint = checkpoint;
    }

    setId(id: string): void {
        this.checkpoint.id = id;
    }

    getId(): string {
        return this.checkpoint.id;
    }

    setTitle(title: string): void {
        this.checkpoint.title = title;
    }

    getTitle(): string {
        return this.checkpoint.title;
    }

    setTime(time: Dayjs): void {
        this.checkpoint.time = time;
    }

    getTime(): Dayjs {
        return this.checkpoint.time;
    }

    setResourceId(resourceId: string): void {
        this.checkpoint.resourceId = resourceId;
    }

    getResourceId(): string {
        return this.checkpoint.resourceId;
    }

    setResourceApi(resourceApi: ResourceApi): void {
        this.resourceApi = resourceApi;
    }

    getResourceApi(): ResourceApi {
        if (!this.resourceApi) {
            throw new Error("resourceApi is not available. Please make sure to initialize it before accessing.");
        }
        return this.resourceApi;
    }

    setColor(color: string): void {
        this.checkpoint.color = color;
    }

    getColor(): Option<string> {
        return Option.fromNullable(this.checkpoint.color);
    }

    setTooltip(tooltip: ReactNode): void {
        this.checkpoint.tooltip = tooltip;
    }

    getTooltip(): ReactNode {
        return this.checkpoint.tooltip;
    }

    setExtendedProps(extendedProps: Dictionary): void {
        this.checkpoint.extendedProps = extendedProps;
    }

    getExtendProps(): Option<Dictionary> {
        return Option.fromNullable(this.checkpoint.extendedProps);
    }
}

export type PublicCheckpointApi = Pick<CheckpointApi,
    "getId" |
    "getTitle" |
    "getTime" |
    "getResourceId" |
    "getResourceApi" |
    "getColor" |
    "getTooltip" |
    "getExtendProps">;

