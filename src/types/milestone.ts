import type {Dayjs} from "dayjs";
import type {ReactNode} from "react";
import {Option} from "@schedulant/types/option.ts";
import type {ResourceApi} from "@schedulant/types/resource.ts";
import type {PublicSchedulantApi} from "@schedulant/types/schedulant.ts";
import type {Dictionary, MenuArg, MenuItems, MountArg, TimeStage} from "@schedulant/types/base.ts";

export type MilestoneArg = {
    milestoneApi: PublicMilestoneApi;
    schedulantApi: PublicSchedulantApi;
}

export type MilestoneContextMenuItems = MenuItems;

export type MilestoneStatus = "Success" | "Failure" | "Warning";

export type MilestoneMountArg = MountArg<MilestoneArg & TimeStage>;

export type MilestoneContextMenuArg = MenuArg<MilestoneArg & TimeStage>;

export type MilestoneMoveMountArg = MountArg<MilestoneArg & { date: Dayjs }>;

export type Milestone = {
    id: string;
    time: Dayjs;
    title: string;
    status: MilestoneStatus;
    resourceId: string;
    color?: string;
    tooltip?: ReactNode;
    extendedProps?: Dictionary;
}

export class MilestoneApi {
    private milestone: Milestone;
    private resourceApi?: ResourceApi;

    constructor(milestone: Milestone) {
        this.milestone = milestone;
    }

    setResourceApi(resourceApi: ResourceApi): void {
        this.resourceApi = resourceApi;
    }

    getId(): string {
        return this.milestone.id;
    }

    getTitle(): string {
        return this.milestone.title;
    }

    getTime(): Dayjs {
        return this.milestone.time;
    }

    getStatus(): MilestoneStatus {
        return this.milestone.status;
    }

    getResourceApi(): ResourceApi {
        if (!this.resourceApi) {
            throw new Error("resourceApi is not available. Please make sure to initialize it before accessing.");
        }
        return this.resourceApi;
    }

    getResourceId(): string {
        return this.milestone.resourceId;
    }

    getColor(): Option<string> {
        return Option.fromNullable(this.milestone.color);
    }

    getTooltip(): ReactNode {
        return this.milestone.tooltip;
    }


    getExtendProps(): Option<Dictionary> {
        return Option.fromNullable(this.milestone.extendedProps);
    }
}

export type PublicMilestoneApi = Pick<MilestoneApi,
    "getId" |
    "getTitle" |
    "getTime" |
    "getStatus" |
    "getResourceApi" |
    "getResourceId" |
    "getColor" |
    "getTooltip" |
    "getExtendProps">;