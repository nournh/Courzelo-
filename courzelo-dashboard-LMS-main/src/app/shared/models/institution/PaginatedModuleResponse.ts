import {ModuleResponse} from "./ModuleResponse";

export interface PaginatedModuleResponse {
    modules: ModuleResponse[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}