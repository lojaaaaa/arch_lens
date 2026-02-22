import { useEffect, useState } from 'react';

export const useSlowIndicator = (isActive: boolean, delayMs: number) => {
    const [isSlow, setIsSlow] = useState(false);

    useEffect(() => {
        if (!isActive) {
            return;
        }
        const timer = setTimeout(() => setIsSlow(true), delayMs);
        return () => {
            clearTimeout(timer);
            setIsSlow(false);
        };
    }, [isActive, delayMs]);

    return isActive && isSlow;
};
