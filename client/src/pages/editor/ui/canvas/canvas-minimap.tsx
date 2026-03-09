import { MiniMap } from '@xyflow/react';

import { useTheme } from '@/features/theme';

const MINIMAP_LIGHT = {
    nodeColor: '#e2e2e2',
    maskColor: 'rgba(240, 240, 240, 0.6)',
    bgColor: '#ffffff',
} as const;

const MINIMAP_DARK = {
    nodeColor: '#94a3b8',
    maskColor: 'rgba(0, 0, 0, 0.6)',
    bgColor: '#1e293b',
} as const;

export const CanvasMiniMap = () => {
    const { theme } = useTheme();
    const minimapColors = theme === 'dark' ? MINIMAP_DARK : MINIMAP_LIGHT;

    return (
        <MiniMap
            key={theme}
            nodeColor={minimapColors.nodeColor}
            maskColor={minimapColors.maskColor}
            bgColor={minimapColors.bgColor}
        />
    );
};
