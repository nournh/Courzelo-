
export interface InstitutionRequest {
    name?: string;
    slogan?: string;
    country?: string;
    address?: string;
    description?: string;
    website?: string;
}
export interface InstitutionRequest2 {
    name?: string;
    slogan?: string;
    country?: string;
    address?: string;
    description?: string;
    website?: string;
 rooms?: string[];        // optional, list of room names (comma-separated input converted to an array)
}
