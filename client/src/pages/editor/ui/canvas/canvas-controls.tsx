import { Controls } from '@xyflow/react';

export const CanvasControls = () => {
    return (
        <Controls
            position="bottom-center"
            orientation="horizontal"
            showFitView
            aria-label="Масштаб и блокировка"
        />
    );
};
