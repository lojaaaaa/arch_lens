import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { TypeOrNull } from './../model/types';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export type HandledError = {
    message: string;
    statusCode?: number;
};

export const handleError = (
    error: unknown,
    fallbackMessage = 'Произошла ошибка',
): HandledError => {
    if (error instanceof Error && error.message) {
        const statusCode =
            'statusCode' in error &&
            typeof (error as { statusCode?: number }).statusCode === 'number'
                ? (error as { statusCode: number }).statusCode
                : undefined;
        return { message: error.message, statusCode };
    }

    if (typeof error === 'string') {
        return { message: error };
    }

    return { message: fallbackMessage };
};

export const isEditableTarget = (target: TypeOrNull<EventTarget>) => {
    if (!(target instanceof HTMLElement)) {
        return false;
    }

    return (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
    );
};
