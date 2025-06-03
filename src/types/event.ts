import type {Dayjs} from "dayjs";
import type {ReactNode} from "react";
import type {Dictionary} from "@schedulant/types/base.ts";

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