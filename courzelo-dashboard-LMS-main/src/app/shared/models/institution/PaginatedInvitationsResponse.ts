import {InvitationResponse} from './InvitationResponse';

export interface PaginatedInvitationsResponse {
    invitations: InvitationResponse[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}
