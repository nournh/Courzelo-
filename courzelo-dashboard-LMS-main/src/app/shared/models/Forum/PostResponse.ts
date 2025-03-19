export interface PostResponse {
    id?: string;
    title?: string;
    smallTitle?: string;
    content?: string;
    smallContent?: string;
    description?: string;
    userEmail?: string;
    createdDate?: Date;
    threadID?: string;
    commentsSize?: number;
}
