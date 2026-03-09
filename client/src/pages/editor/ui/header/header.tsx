import { SidebarTrigger } from '@/shared/ui/sidebar';

import { HeaderActions } from './header-actions';
import { HeaderMenubar } from './header-menubar';
import { HeaderTitle } from './header-title';

export const Header = () => {
    return (
        <header className="flex h-12 items-center gap-2 px-2">
            <div className="flex shrink-0 items-center gap-2">
                <SidebarTrigger />
                <HeaderMenubar />
                <HeaderTitle />
            </div>
            <div className="flex flex-1" />
            <div className="flex shrink-0 items-center gap-1">
                <HeaderActions />
            </div>
        </header>
    );
};
