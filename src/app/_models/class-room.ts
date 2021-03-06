import { IStudent } from '.';

export interface IClassRoom {
    classId: string;
    schoolId: string;
    classRoomName: string;
    classDivision: string;
    createdBy: string;
    updatedBy: string;
    students: IStudent[];
}