import type { PuckPageData } from "./puck";

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
}

export type DashboardWithPageData = Dashboard & {
    pages: DashboardPageWithData[];
}

export type DashboardWithoutPageData = Dashboard & {
    pages: DashboardPageWithoutData[];
};
