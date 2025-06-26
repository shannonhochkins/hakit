import type { PuckPageData } from "./puck";
import type { BreakpointItem } from "./breakpoints";

export type DashboardPageWithoutData = {
    id: string;
    name: string;
    path: string;
    createdAt: string;
    updatedAt: string;
    thumbnail: string | null;
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
    thumbnail: string | null;
    createdAt: string;
    updatedAt: string;
    breakpoints: BreakpointItem[];
}

export type DashboardWithPageData = Dashboard & {
    pages: DashboardPageWithData[];
}

export type DashboardWithoutPageData = Dashboard & {
    pages: DashboardPageWithoutData[];
};
