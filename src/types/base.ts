import React from "react";
import type {MenuProps} from "antd";

export type MenuItems = MenuProps["items"];

export type Dictionary = Record<string, unknown>;

export type Position = {
    left: number;
    right: number;
}

export type TimeStage = {
    isPast: boolean;
    isFuture: boolean;
    isProcess: boolean;
}

export type MenuArg<ContentArg> = ContentArg & {
    key: string,
    keyPath: string[],
    domEvent: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
};

export type MountArg<ContentArg> = ContentArg & { el: HTMLElement };

export type MoveHandler<TheMountArg extends { el: HTMLElement }> = (mountArg: TheMountArg) => void;

export type SelectHandler<TheMountArg extends { el: HTMLElement }> = (mountArg: TheMountArg) => void;

export type ResizeHandler<TheMountArg extends { el: HTMLElement }> = (mountArg: TheMountArg) => void;

export type DidMountHandler<TheMountArg extends { el: HTMLElement }> = (mountArg: TheMountArg) => void;

export type WillUnmountHandler<TheMountArg extends { el: HTMLElement }> = (mountArg: TheMountArg) => void;

export type ContextMenuClickHandler<TheMenuArg extends {
    key: string,
    keyPath: string[],
    domEvent: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
}> = (menuArg: TheMenuArg) => void;

