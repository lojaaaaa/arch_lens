import { ArchitectureCanvas } from './canvas/architecture-canvas';

export const EditorCanvasArea = () => {
    return (
        <div className="relative flex-1 min-h-0 overflow-hidden">
            <ArchitectureCanvas />
        </div>
    );
};
