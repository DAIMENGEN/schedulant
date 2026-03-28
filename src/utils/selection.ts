const currentSelectedResourceIds: Set<string> = new Set();
let lastSelectedResourceId: string | null = null;

export type SelectionChangeCallback = (selectedIds: string[]) => void;

function applySelectionToDOM() {
    document.querySelectorAll('.schedulant-resource-selected')
        .forEach(el => el.classList.remove('schedulant-resource-selected'));
    for (const id of currentSelectedResourceIds) {
        document.querySelectorAll(`[data-resource-id="${id}"].schedulant-resource`)
            .forEach(el => el.classList.add('schedulant-resource-selected'));
    }
}

function notifyChange(callback?: SelectionChangeCallback) {
    callback?.(Array.from(currentSelectedResourceIds));
}

export function getSelectedResourceIds(): Set<string> {
    return currentSelectedResourceIds;
}

export function clearResourceSelection(callback?: SelectionChangeCallback) {
    if (currentSelectedResourceIds.size === 0) return;
    currentSelectedResourceIds.clear();
    lastSelectedResourceId = null;
    applySelectionToDOM();
    notifyChange(callback);
}

export function selectSingleResource(resourceId: string, callback?: SelectionChangeCallback) {
    currentSelectedResourceIds.clear();
    currentSelectedResourceIds.add(resourceId);
    lastSelectedResourceId = resourceId;
    applySelectionToDOM();
    notifyChange(callback);
}

export function handleSelectionClick(
    event: MouseEvent,
    visibleResourceIds: string[],
    callback?: SelectionChangeCallback,
) {
    const target = event.target as HTMLElement;
    const resourceEl = target.closest('[data-resource-id]');
    if (!resourceEl) {
        clearResourceSelection(callback);
        return;
    }
    const resourceId = resourceEl.getAttribute('data-resource-id');
    if (!resourceId) {
        clearResourceSelection(callback);
        return;
    }

    // Right-click on an already-selected row: preserve multi-selection
    if (event.button === 2 && currentSelectedResourceIds.has(resourceId)) {
        return;
    }

    const isCtrl = event.ctrlKey || event.metaKey;
    const isShift = event.shiftKey;

    if (isShift && lastSelectedResourceId) {
        // Range select: from lastSelectedResourceId to resourceId
        const startIdx = visibleResourceIds.indexOf(lastSelectedResourceId);
        const endIdx = visibleResourceIds.indexOf(resourceId);
        if (startIdx !== -1 && endIdx !== -1) {
            const from = Math.min(startIdx, endIdx);
            const to = Math.max(startIdx, endIdx);
            if (!isCtrl) {
                currentSelectedResourceIds.clear();
            }
            for (let i = from; i <= to; i++) {
                currentSelectedResourceIds.add(visibleResourceIds[i]);
            }
        }
        // Don't update lastSelectedResourceId on shift-click
    } else if (isCtrl) {
        // Toggle single item
        if (currentSelectedResourceIds.has(resourceId)) {
            currentSelectedResourceIds.delete(resourceId);
        } else {
            currentSelectedResourceIds.add(resourceId);
        }
        lastSelectedResourceId = resourceId;
    } else {
        // Plain click: select only this one
        currentSelectedResourceIds.clear();
        currentSelectedResourceIds.add(resourceId);
        lastSelectedResourceId = resourceId;
    }

    applySelectionToDOM();
    notifyChange(callback);
}

