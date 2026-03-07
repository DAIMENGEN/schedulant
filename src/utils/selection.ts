let currentSelectedResourceId: string | null = null;

export function selectResourceRow(resourceId: string) {
    currentSelectedResourceId = resourceId;
    const allResources = document.querySelectorAll('.schedulant-resource-selected');
    allResources.forEach(el => el.classList.remove('schedulant-resource-selected'));
    const resourceElements = document.querySelectorAll(`[data-resource-id="${resourceId}"].schedulant-resource`);
    resourceElements.forEach(el => el.classList.add('schedulant-resource-selected'));
}

export function getSelectedResourceId(): string | null {
    return currentSelectedResourceId;
}

export function clearResourceSelection() {
    currentSelectedResourceId = null;
    const allResources = document.querySelectorAll('.schedulant-resource-selected');
    allResources.forEach(el => el.classList.remove('schedulant-resource-selected'));
}

export function handleSelectionClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const resourceEl = target.closest('[data-resource-id]');
    if (resourceEl) {
        const resourceId = resourceEl.getAttribute('data-resource-id');
        if (resourceId) {
            selectResourceRow(resourceId);
        }
    } else {
        clearResourceSelection();
    }
}

