import {InstitutionTimeSlot} from './InstitutionTimeSlot';

export interface InstitutionUserResponse {
    email: string;
    name: string;
    lastname: string;
    roles: string[];
    country: string;
    gender: string;
    skills: string[];
    disponibilitySlots: InstitutionTimeSlot[];
}
