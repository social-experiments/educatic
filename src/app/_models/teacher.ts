export interface ITeacher {
    schoolId: string;
    id: string;
    firstName: string;
    lastName: string;
    gender: string;
    email: string;
    role: string;
    acceptTerms: boolean;
    address1: string;
    address2: string;
    country: string;
    state: string;
    city: string;
    zip: string;
    latitude: string;
    longitude: string;
    syncDateTime?: Date;
    createdBy: string;
}