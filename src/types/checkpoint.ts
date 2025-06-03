import type {Dayjs} from "dayjs";
import type {ReactNode} from "react";
import type {Dictionary} from "@schedulant/types/base.ts";

export type Checkpoint = {
    id: string;
    time: Dayjs;
    title: string;
    resourceId: string;
    color?: string;
    tooltip?: ReactNode;
    extendedProps?: Dictionary;
}