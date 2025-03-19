import {PostResponse} from './PostResponse';

export interface PaginatedPostsResponse {
    page?: number;
    totalPages?: number;
    totalPosts?: number;
    postsPerPage?: number;
    posts?: PostResponse[];
}
