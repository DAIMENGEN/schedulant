export const extractNumber = (value: string): number => Number(value.replace(/[^0-9]/g, ""));

export const numberToPixels = (value: number): string => `${value}px`;

export const pixelsToNumber = (value: string): number => Number(value.replace(/px$/, ""));
