import { SidebarTrigger } from '@/shared/ui/sidebar';

import { HeaderActions } from './header-actions';
import { HeaderFileMenu } from './header-file-menu';
import { HeaderTitle } from './header-title';

export const Header = () => {
    return (
        <header className="flex h-12 items-center gap-2 px-2">
            <SidebarTrigger />
            <HeaderFileMenu />
            <HeaderTitle />
            <HeaderActions />
        </header>
    );
};
