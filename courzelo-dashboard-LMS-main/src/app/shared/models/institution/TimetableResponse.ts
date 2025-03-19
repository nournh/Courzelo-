export interface Timeslot {
    group: string;
    teacher: string;
    module: string;
    dayOfWeek: string; // e.g., "Monday", "Tuesday"
    startTime: string; // e.g., "09:00 AM"
    endTime: string;   // e.g., "11:00 AM"
}

export interface TimetableResponse {
    groupTimetables: { [key: string]: Timeslot[] };
    teacherTimetables: { [key: string]: Timeslot[] };
    timetableWeek: Date;
}
