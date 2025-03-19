import {ProgramResponse} from './ProgramResponse';

export interface PaginatedProgramsResponse {
    programs: ProgramResponse[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}
