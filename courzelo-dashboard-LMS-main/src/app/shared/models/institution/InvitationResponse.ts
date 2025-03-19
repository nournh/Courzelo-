export interface InvitationResponse {
    id?: string;
    email?: string;
    code?: string;
    status?: string;
    role?: string;
    expiryDate?: Date;
}
