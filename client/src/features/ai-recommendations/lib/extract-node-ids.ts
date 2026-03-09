/** Извлекает id узлов из текста. Формат: (id) или (id: xyz) */
export const extractNodeIds = (text: string): string[] => {
    const matches = text.matchAll(/\((?:id:\s*)?([A-Za-z0-9_-]{8,40})\)/g);
    return [...new Set([...matches].map((match) => match[1]))];
};
