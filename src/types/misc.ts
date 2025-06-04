// Used to denote content that is difficult to categorize into specific categories.

import type {Dayjs} from "dayjs";
import type {MountArg} from "@schedulant/types/base.ts";
import type {PublicResourceApi} from "@schedulant/types/resource.ts";

export type SelectInfoArg = MountArg<{
    resourceApi: PublicResourceApi,
    startDate: Dayjs,
    endDate: Dayjs
}>;