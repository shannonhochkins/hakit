import type { PuckPageData } from "./puck";
import type { BreakpointItem } from "./breakpoints";

export type DashboardPageWithoutData = {
    id: string;
    name: string;
    path: string;
}
export type DashboardPageWithData = DashboardPageWithoutData & {
    data: PuckPageData;
}
interface Dashboard {
    id: string;
    name: string;
    path: string;
    themeId?: string;
    data: PuckPageData;
    breakpoints: BreakpointItem[];
}

export type DashboardWithPageData = Dashboard & {
    pages: DashboardPageWithData[];
}

export type DashboardWithoutPageData = Dashboard & {
    pages: DashboardPageWithoutData[];
};
