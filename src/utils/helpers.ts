export const preventDefault =
    (func = (e: Event) => {}) =>
    (e: Event) => {
        e.preventDefault();

        func(e);
    };

export const stopPropagation =
    (func = (e: Event) => {}) =>
    (e: Event) => {
        e.stopPropagation();
        func && func(e);
    };

export const delay = (t: number) =>
    new Promise((resolve) => setTimeout(resolve, t));

export const throttle = (callback: (...args: any[]) => void, delay = 50) => {
    let lastCall = 0;

    return (...args: any[]) => {
        const now = Date.now();

        if (now - lastCall >= delay) {
            lastCall = now;

            callback(...args);
        }
    };
};

export const formatTime = (t: number) => {
    const hours = Math.floor(t / 3600);
    const minutes = Math.floor((t - hours * 3600) / 60);
    const seconds = Math.floor(t - (hours * 3600 + minutes * 60));

    const units = [minutes, seconds];

    if (hours) units.unshift(hours);

    return units.map((unit) => `${unit}`.padStart(2, '0')).join(':');
};

const isObject = (item: unknown) =>
    item !== null && typeof item === 'object' && !Array.isArray(item);

export const mergeDeep = (
    target: { [key: string]: any },
    ...sources: { [key: string]: any }[]
): { [key: string]: any } => {
    if (!sources.length) return target;

    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
};
