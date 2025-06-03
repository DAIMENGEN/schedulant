export type SchedulantState = {
    collapseIds: string[];
    resourceAreaWidth: string;
}

export type Action =
    | { type: typeof ActionTypes.EXPAND_RESOURCE, id: string }
    | { type: typeof ActionTypes.COLLAPSE_RESOURCE, id: string }
    | { type: typeof ActionTypes.SET_RESOURCE_AREA_WIDTH, width: string };

export const ActionTypes = {
    EXPAND_RESOURCE: "EXPAND_RESOURCE",
    COLLAPSE_RESOURCE: "COLLAPSE_RESOURCE",
    SET_RESOURCE_AREA_WIDTH: "SET_RESOURCE_AREA_WIDTH",
} as const;

export const SCHEDULANT_LOCAL_STORAGE_KEY = "schedulant.state";

export const InitialState = (): SchedulantState => {
    try {
        const stored = localStorage.getItem(SCHEDULANT_LOCAL_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored) as SchedulantState;
        }
    } catch {
        // ignore parse or storage errors
        console.warn("Error parsing schedulant local storage");
    }
    return {
        collapseIds: [],
        resourceAreaWidth: "20%",
    };
};




