export function selectResourceRow(resourceId: string) {
    const allResources = document.querySelectorAll('.schedulant-resource-selected');
    allResources.forEach(el => el.classList.remove('schedulant-resource-selected'));
    const resourceElements = document.querySelectorAll(`[data-resource-id="${resourceId}"].schedulant-resource`);
    resourceElements.forEach(el => el.classList.add('schedulant-resource-selected'));
}

