import type {ReactNode} from "react";
import type {Dictionary} from "@schedulant/types/base.ts";

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