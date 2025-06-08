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
    start: Dayjs;
    title: string;
    color: string;
    resourceId: string;
    end?: Dayjs;
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

    setId(id: string): void {
        this.event.id = id;
    }

    getId(): string {
        return this.event.id;
    }

    setTitle(title: string): void {
        this.event.title = title;
    }

    getTitle(): string {
        return this.event.title;
    }

    setColor(color: string): void {
        this.event.color = color;
    }

    getColor(): string {
        return this.event.color;
    }

    setStart(start: Dayjs): void {
        this.event.start = start;
    }

    getStart(): Dayjs {
        return this.event.start;
    }

    setEnd(end: Dayjs): void {
        this.event.end = end;
    }

    getEnd(): Option<Dayjs> {
        return Option.fromNullable(this.event.end);
    }

    setResourceId(resourceId: string): void {
        this.event.resourceId = resourceId;
    }

    getResourceId(): string {
        return this.event.resourceId;
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

    setUrl(url: string): void {
        this.event.url = url;
    }

    getUrl(): Option<string> {
        return Option.fromNullable(this.event.url);
    }

    setTooltip(tooltip: ReactNode): void {
        this.event.tooltip = tooltip;
    }

    getTooltip(): ReactNode {
        return this.event.tooltip;
    }

    setTextColor(textColor: string): void {
        this.event.textColor = textColor;
    }

    getTextColor(): Option<string> {
        return Option.fromNullable(this.event.textColor);
    }

    setBorderColor(borderColor: string): void {
        this.event.borderColor = borderColor;
    }

    getBorderColor(): Option<string> {
        return Option.fromNullable(this.event.borderColor);
    }

    setBackgroundColor(backgroundColor: string): void {
        this.event.backgroundColor = backgroundColor;
    }

    getBackgroundColor(): Option<string> {
        return Option.fromNullable(this.event.backgroundColor);
    }

    setExtendedProps(extendedProps: Dictionary): void {
        this.event.extendedProps = extendedProps;
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