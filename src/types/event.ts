import type {Dayjs} from "dayjs";
import type {ReactNode} from "react";
import {Option} from "@schedulant/types/option.ts";
import type {ResourceApi} from "@schedulant/types/resource.ts";
import type {PublicSchedulantApi} from "@schedulant/types/schedulant.ts";
import type {Dictionary, MenuArg, MenuItems, MountArg, TimeStage} from "@schedulant/types/base.ts";

export type EventArg = {
    eventApi: PublicEventApi;
    schedulantApi: PublicSchedulantApi,
}

export type EventContextMenuItems = MenuItems;

export type EventMountArg = MountArg<EventArg & TimeStage>;

export type EventContextMenuArg = MenuArg<EventArg & TimeStage>;

export type EventResizeMountArg = MountArg<EventArg & { date: Dayjs }>;

export type EventMoveMountArg = MountArg<EventArg & { startDate: Dayjs, endDate: Dayjs }>;

export type Event = {
    id: string;
    title: string;
    start: Dayjs;
    end: Dayjs;
    color: string;
    resourceId: string;
    url?: string;
    tooltip?: ReactNode;
    textColor?: string;
    borderColor?: string;
    backgroundColor?: string;
    extendedProps?: Dictionary;
}

export class EventApi {
    private event: Event;
    private resourceApi?: ResourceApi;

    constructor(event: Event) {
        this.event = event;
    }

    setResourceApi(resourceApi: ResourceApi): void {
        this.resourceApi = resourceApi;
    }

    getId(): string {
        return this.event.id;
    }

    getTitle(): string {
        return this.event.title;
    }

    getColor(): string {
        return this.event.color;
    }

    getStart(): Dayjs {
        return this.event.start;
    }

    getEnd(): Dayjs {
        return this.event.end;
    }

    getResourceId(): string {
        return this.event.resourceId;
    }

    getResourceApi(): ResourceApi {
        if (!this.resourceApi) {
            throw new Error("resourceApi is not available. Please make sure to initialize it before accessing.");
        }
        return this.resourceApi;
    }

    getUrl(): Option<string> {
        return Option.fromNullable(this.event.url);
    }

    getTooltip(): ReactNode {
        return this.event.tooltip;
    }

    getTextColor(): Option<string> {
        return Option.fromNullable(this.event.textColor);
    }

    getBorderColor(): Option<string> {
        return Option.fromNullable(this.event.borderColor);
    }

    getBackgroundColor(): Option<string> {
        return Option.fromNullable(this.event.backgroundColor);
    }


    getExtendProps(): Option<Dictionary> {
        return Option.fromNullable(this.event.extendedProps);
    }
}

export type PublicEventApi = Pick<EventApi,
    "getId" |
    "getTitle" |
    "getColor" |
    "getStart" |
    "getEnd" |
    "getResourceId" |
    "getResourceApi" |
    "getUrl" |
    "getTooltip" |
    "getTextColor" |
    "getBorderColor" |
    "getBackgroundColor" |
    "getExtendProps">;