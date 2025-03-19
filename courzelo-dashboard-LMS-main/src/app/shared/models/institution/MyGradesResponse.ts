
import {ModuleGradesResponse} from '../../../views/home/home-dashboard/my-grades/my-grades.component';

export interface MyGradesResponse {
    grades: ModuleGradesResponse[];
    average: number;
}
