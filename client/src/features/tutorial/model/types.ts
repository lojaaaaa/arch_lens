export type TutorialState = {
    hintsEnabled: boolean;
    toggleHints: () => void;
    setHintsEnabled: (enabled: boolean) => void;
};

export type TutorialStep =
    | 'empty'
    | 'add-frontend'
    | 'add-backend'
    | 'add-service'
    | 'add-data-layer'
    | 'connect-nodes'
    | 'run-analysis';
