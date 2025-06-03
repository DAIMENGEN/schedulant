export const groupBy = <T>(arr: T[], func: (item: T) => string): Record<string, T[]> => {
    const groupedResult: Record<string, T[]> = {};
    arr.forEach(item => {
        const key = func(item);
        if (groupedResult[key]) {
            groupedResult[key].push(item);
        } else {
            groupedResult[key] = [item];
        }
    });
    return groupedResult;
};