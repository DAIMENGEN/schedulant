import {type Action, ActionTypes, type SchedulantState} from "@schedulant/context/schedulant-state.tsx";

export const SchedulantReducer = (state: SchedulantState, action: Action): SchedulantState => {
    switch (action.type) {
        case ActionTypes.EXPAND_RESOURCE:
            return {
                ...state,
                collapseIds: state.collapseIds.filter(id => id !== action.id),
            };
        case ActionTypes.COLLAPSE_RESOURCE:
            return {
                ...state,
                collapseIds: [...state.collapseIds, action.id],
            };
        case ActionTypes.SET_RESOURCE_AREA_WIDTH:
            return {
                ...state,
                resourceAreaWidth: action.width,
            };
        default:
            return state;
    }
};