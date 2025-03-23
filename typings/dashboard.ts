import type { PuckPageData } from "./puck";

export interface DashboardPage {
    id: string;
    name: string;
    path: string;
    data: PuckPageData;
}
export interface Dashboard {
    id: string;
    name: string;
    path: string;
    data: PuckPageData;
    pages: DashboardPage[];
}