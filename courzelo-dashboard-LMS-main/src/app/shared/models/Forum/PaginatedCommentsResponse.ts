import {CommentResponse} from './CommentResponse';

export interface PaginatedCommentsResponse {
    page: number;
    totalPages: number;
    totalComments: number;
    commentsPerPage: number;
    comments: CommentResponse[];
}
