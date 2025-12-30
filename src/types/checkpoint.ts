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

    setResourceApi(resourceApi: ResourceApi): void {
        this.resourceApi = resourceApi;
    }

    getId(): string {
        return this.checkpoint.id;
    }

    getTitle(): string {
        return this.checkpoint.title;
    }

    getTime(): Dayjs {
        return this.checkpoint.time;
    }

    getResourceId(): string {
        return this.checkpoint.resourceId;
    }

    getResourceApi(): ResourceApi {
        if (!this.resourceApi) {
            throw new Error("resourceApi is not available. Please make sure to initialize it before accessing.");
        }
        return this.resourceApi;
    }

    getColor(): Option<string> {
        return Option.fromNullable(this.checkpoint.color);
    }

    getTooltip(): ReactNode {
        return this.checkpoint.tooltip;
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
