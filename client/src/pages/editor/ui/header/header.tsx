import { useGraphHighlightStore } from '@/features/graph-highlight';
import { GraphSearch } from '@/features/graph-search';
import { SidebarTrigger } from '@/shared/ui/sidebar';

import { HeaderActions } from './header-actions';
import { HeaderFileMenu } from './header-file-menu';
import { HeaderTitle } from './header-title';
import { NODE_LABELS } from '../../lib/config';
import { useArchitectureNodes } from '../../model/selectors';

export const Header = () => {
    const nodes = useArchitectureNodes();
    const setHighlightedNodeIds = useGraphHighlightStore(
        (state) => state.setHighlightedNodeIds,
    );
    const setHighlightPreventAutoClear = useGraphHighlightStore(
        (state) => state.setHighlightPreventAutoClear,
    );
    const clearHighlight = useGraphHighlightStore(
        (state) => state.clearHighlight,
    );

    return (
        <header className="flex h-12 items-center gap-2 px-2">
            <SidebarTrigger />
            <HeaderFileMenu />
            <HeaderTitle />
            <GraphSearch
                nodes={nodes}
                nodeLabels={NODE_LABELS}
                onHighlight={setHighlightedNodeIds}
                onClearHighlight={clearHighlight}
                onPreventAutoClear={setHighlightPreventAutoClear}
            />
            <HeaderActions />
        </header>
    );
};
