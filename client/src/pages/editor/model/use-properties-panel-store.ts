import { create } from 'zustand';

type PropertiesPanelState = {
    open: boolean;
    setOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
    toggle: () => void;
};

export const usePropertiesPanelStore = create<PropertiesPanelState>((set) => ({
    open: false,
    setOpen: (value) =>
        set((state) => ({
            open: typeof value === 'function' ? value(state.open) : value,
        })),
    toggle: () => set((state) => ({ open: !state.open })),
}));
