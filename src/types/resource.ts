import type {ReactNode} from "react";
import {Option} from "@schedulant/types/option.ts";
import type {EventApi} from "@schedulant/types/event.ts";
import type {MilestoneApi} from "@schedulant/types/milestone";
import type {CheckpointApi} from "@schedulant/types/checkpoint";
import type {PublicSchedulantApi} from "@schedulant/types/schedulant.ts";
import type {Dictionary, MenuArg, MenuItems, MountArg} from "@schedulant/types/base.ts";
import {groupBy} from "@schedulant/utils/array.ts";

export type ResourceLaneArg = {
    label: ResourceAreaColumn;
    resourceApi: PublicResourceApi;
    schedulantApi: PublicSchedulantApi;
}

export interface ResourceLabelArg {
    label: ResourceAreaColumn;
}

export type ResourceContextMenuItems = MenuItems;

export type ResourceAreaColumn = { field: string; headerContent: string; }

export type ResourceLaneMountArg = MountArg<ResourceLaneArg>;

export type ResourceLabelMountArg = MountArg<ResourceLabelArg>;

export type ResourceLaneContextMenuArg = MenuArg<ResourceLaneArg>;

export type ResourceLabelContextMenuArg = MenuArg<ResourceLabelArg>;

export type ResourceLaneMoveMountArg = MountArg<{schedulantApi: PublicSchedulantApi, draggedResourceApi: PublicResourceApi, targetResourceApi: PublicResourceApi, position: 'before' | 'after' | 'child', oldParentResourceApi?: PublicResourceApi}>;

export type Resource = {
    id: string;
    title: string;
    tooltip?: ReactNode;
    parentId?: string;
    eventColor?: string;
    eventTextColor?: string;
    eventBorderColor?: string;
    eventBackgroundColor?: string;
    extendedProps?: Dictionary;
}

export class ResourceApi {
    private depth: number;
    private readonly resource: Resource;
    private parent?: ResourceApi;
    private children: ResourceApi[];
    private eventApis?: EventApi[];
    private milestoneApis?: MilestoneApi[];
    private checkpointApis?: CheckpointApi[];

    constructor(resource: Resource) {
        this.depth = 0;
        this.children = [];
        this.resource = resource;
    }

    setDepth(depth: number): void {
        this.depth = depth;
    }

    getId(): string {
        return this.resource.id;
    }

    getTitle(): string {
        return this.resource.title;
    }

    getDepth(): number {
        return this.depth;
    }

    getTooltip(): ReactNode {
        return this.resource.tooltip;
    }

    setParent(parent?: ResourceApi): void {
        this.parent = parent;
    }

    getParent(): Option<ResourceApi> {
        return Option.fromNullable(this.parent);
    }

    getParentId(): Option<string> {
        return Option.fromNullable(this.resource.parentId);
    }

    setChildren(children: ResourceApi[]): void {
        this.children = children;
    }

    getChildren(): ResourceApi[] {
        return this.children;
    }

    getEventColor(): Option<string> {
        return Option.fromNullable(this.resource.eventColor);
    }

    getEventTextColor(): Option<string> {
        return Option.fromNullable(this.resource.eventTextColor);
    }

    getEventBorderColor(): Option<string> {
        return Option.fromNullable(this.resource.eventBorderColor);
    }

    getEventBackgroundColor(): Option<string> {
        return Option.fromNullable(this.resource.eventBackgroundColor);
    }

    getResource(): Resource {
        return this.resource;
    }

    setEventApis(eventApis: EventApi[]): void {
        this.eventApis = eventApis;
    }

    getEventApis(): EventApi[] {
        if (!this.eventApis) {
            throw new Error("eventApis is not available. Please make sure to initialize it before accessing.");
        }
        return this.eventApis;
    }

    setMilestoneApis(milestoneApis: MilestoneApi[]): void {
        this.milestoneApis = milestoneApis;
    }

    getMilestoneApis(): MilestoneApi[] {
        if (!this.milestoneApis) {
            throw new Error("milestoneApis is not available. Please make sure to initialize it before accessing.");
        }
        return this.milestoneApis;
    }

    setCheckpointApis(checkpointApis: CheckpointApi[]): void {
        this.checkpointApis = checkpointApis;
    }

    getCheckpointApis(): CheckpointApi[] {
        if (!this.checkpointApis) {
            throw new Error("checkpointApis is not available. Please make sure to initialize it before accessing.");
        }
        return this.checkpointApis;
    }

    getExtendProps(): Option<Dictionary> {
        return Option.fromNullable(this.resource.extendedProps);
    }
}

export class ResourceApiHelper {

    static compare(prev: ResourceApi, next: ResourceApi): number {
        const prevOrderCandidate = prev.getExtendProps().getOrElse({order: 0}).order;
        const nextOrderCandidate = next.getExtendProps().getOrElse({order: 0}).order;
        const prevOrder = typeof prevOrderCandidate === 'number' ? prevOrderCandidate : 0;
        const nextOrder = typeof nextOrderCandidate === 'number' ? nextOrderCandidate : 0;
        return prevOrder - nextOrder;
    }

    static createTree(resources: Resource[], eventApis: EventApi[], milestoneApis: MilestoneApi[], checkpointApis: CheckpointApi[]): ResourceApi[] {
        const rootId = "undefined";
        const resourceApis = resources.map(resource => new ResourceApi(resource));
        const eventApisMap = new Map(Object.entries(groupBy(eventApis, eventApi => eventApi.getResourceId())));
        const resourcesApiMap = resourceApis.reduce((map, obj) => map.set(obj.getId(), obj), new Map<string, ResourceApi>());
        const milestoneApisMap = new Map(Object.entries(groupBy(milestoneApis, milestoneApi => milestoneApi.getResourceId())));
        const checkpointApisMap = new Map(Object.entries(groupBy(checkpointApis, checkpointApi => checkpointApi.getResourceId())));
        const stack = [{parentId: rootId, depth: 0}];
        const parentApiMap = new Map(Object.entries(groupBy(resourceApis, resourceApi => resourceApi.getParentId().getOrElse(rootId))));
        while (stack.length > 0) {
            const current = stack.pop();
            if (current) {
                const {parentId, depth} = current;
                const children = parentApiMap.get(parentId);
                if (children) {
                    children.sort(ResourceApiHelper.compare).forEach(child => {
                        const resourceId = child.getId();
                        child.setDepth(depth);
                        child.setParent(resourcesApiMap.get(parentId));
                        child.setChildren(parentApiMap.get(resourceId) || []);
                        const targetEventApis = eventApisMap.get(resourceId) || [];
                        targetEventApis.forEach(e => e.setResourceApi(child));
                        child.setEventApis(targetEventApis);
                        const targetMilestoneApis = milestoneApisMap.get(resourceId) || [];
                        targetMilestoneApis.forEach(m => m.setResourceApi(child));
                        child.setMilestoneApis(targetMilestoneApis);
                        const targetCheckpointApis = checkpointApisMap.get(resourceId) || [];
                        targetCheckpointApis.forEach(c => c.setResourceApi(child));
                        child.setCheckpointApis(targetCheckpointApis);
                        stack.push({parentId: resourceId, depth: depth + 1});
                    });
                }
            }
        }
        return parentApiMap.get(rootId) || [];
    }

    static flatMapTree(resourceApis: ResourceApi[]): ResourceApi[] {
        const result: ResourceApi[] = [];
        const stack: ResourceApi[] = [...resourceApis];
        while (stack.length > 0) {
            const current = stack.pop();
            if (current) {
                result.push(current);
                for (let i = current.getChildren().length - 1; i >= 0; i--) {
                    stack.push(current.getChildren()[i]);
                }
            }
        }
        return result;
    }
}

export class ResourceUtils {
    static createEmptyResources(count: number): Resource[] {
        return Array.from({length: count}, (_, index) => {
            const timestamp = Date.now();
            const order = timestamp + index;
            return {
                id: `empty-resource-${order}`,
                title: "",
                extendedProps: {
                    order: order
                }
            }
        });
    }
}

export type PublicResourceApi = Pick<ResourceApi,
    "getId" |
    "getTitle" |
    "getDepth" |
    "getTooltip" |
    "getParent" |
    "getParentId" |
    "getChildren" |
    "getEventColor" |
    "getEventTextColor" |
    "getEventBorderColor" |
    "getEventBackgroundColor" |
    "getResource" |
    "getEventApis" |
    "getMilestoneApis" |
    "getCheckpointApis" |
    "getExtendProps">;
