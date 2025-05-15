export interface InstitutionResponse {
    rooms: string[]; 
    id?: string;
    name?: string;
    slogan?: string;
    country?: string;
    address?: string;
    description?: string;
    website?: string;
    latitude?: number;
    longitude?: number;
    firstSemesterStart?: Date;
    secondSemesterStart?: Date;
}
