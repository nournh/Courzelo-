import {CourseResponse} from './CourseResponse';

export interface PaginatedCoursesResponse {
    courses: CourseResponse[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}
