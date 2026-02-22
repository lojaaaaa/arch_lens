import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { TypeOrNull } from './../model/types';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const handleError = (
    error: unknown,
    fallbackMessage = 'Произошла ошибка',
): string => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    return fallbackMessage;
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
