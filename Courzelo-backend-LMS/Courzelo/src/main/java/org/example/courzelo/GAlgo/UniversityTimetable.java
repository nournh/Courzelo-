package org.example.courzelo.GAlgo;

import org.example.courzelo.models.Timetable.ElementModule;
import org.example.courzelo.models.User;
import org.example.courzelo.models.institution.ClassRoom;
import org.example.courzelo.models.institution.Group;

import java.util.ArrayList;
import java.util.List;

public class UniversityTimetable {
    private List<List<ElementModule>> universityTimetables;
    private int fitness;
    public UniversityTimetable(int numberOfClasses) {
        this.universityTimetables = new ArrayList<>(numberOfClasses);
        for (int i = 0; i < numberOfClasses; i++) {
            this.universityTimetables.add(new ArrayList<>());
        }
    }
    public int getFitness() {
        return fitness;
    }
    public void setFitness(int fitness) {
        this.fitness = fitness;
    }
    public void addElementDeModule(int classIndex, ElementModule elementModule) {
        List<ElementModule> timetable = universityTimetables.get(classIndex);
        timetable.add(elementModule);
    }
    public List<ElementModule> getTimetable(int classIndex) {
        return universityTimetables.get(classIndex);
    }
    public int getNumberOfClasses() {
        return universityTimetables.size();
    }
    public int calculateFitness() {
        // calculate the fitness of the timetable by calculating the number of unsatisfied criteria
        Criterias criterias = new Criterias(this);
        int unsatisfiedCriteria = 0;
        // Criteria: disponibilities of a professor
        unsatisfiedCriteria += criterias.isDisponibilitesTeachersSatisfied();
        // Critera : a teacher cant have two classes at the same time
        unsatisfiedCriteria += criterias.isTeacherClasseConflictSatisfied();
        // Critera: a class cant have two modules at the same hour/period
        unsatisfiedCriteria += criterias.isClasseSeancesConflictSatisfied();
        // Critera: every classs should have wednesday afternoon open
        unsatisfiedCriteria += criterias.isClasseAfternoonFreeDaySatisfied();
        this.fitness =  unsatisfiedCriteria;
        return this.fitness;
    }
    public void swapGenes(int classIndex, int position1, int position2) {
        List<ElementModule> timetable = universityTimetables.get(classIndex);
        if (timetable.size() > position1 && timetable.size() > position2) {
            ElementModule gene1 = timetable.get(position1);
            ElementModule gene2 = timetable.get(position2);
            timetable.set(position1, gene2);
            timetable.set(position2, gene1);
        }
    }

    public void setTimetable(int classIndex, List<ElementModule> classTimetable2) {
        universityTimetables.set(classIndex, classTimetable2);
    }
    public List<Group>getGroups() {
        List<Group> groups = new ArrayList<>();
        for (List<ElementModule> timetable : universityTimetables) {
            for (ElementModule element : timetable) {
                Group group = element.getGroup();
                if (group != null && !groups.contains(group)) {
                    groups.add(group);
                }
            }
        }
        return groups;
    }

    public List<User> getTeachers() {
        List<User> teachers = new ArrayList<>();
        for (List<ElementModule> timetable :  universityTimetables) {
            for (ElementModule element : timetable) {
                User teacher = element.getTeacher();
                if (teacher != null && !teachers.contains(teacher)) {
                    teachers.add(teacher);
                }
            }
        }
        return teachers;
    }
    public List<ElementModule> getAllElements() {
        List<ElementModule> elements = new ArrayList<>();
        for (List<ElementModule> timetable : universityTimetables) {
            for (ElementModule element : timetable) {
                if (!elements.contains(element)) {
                    elements.add(element);
                }
            }
        }
        return elements;
    }

    public List<ClassRoom> getCourses() {
        List<ClassRoom> modules = new ArrayList<>();
        for (List<ElementModule> timetable : universityTimetables) {
            for (ElementModule element : timetable) {
                ClassRoom classRoom = element.getClassRoom();
                if (classRoom != null && !modules.contains(classRoom)) {
                    modules.add(classRoom);
                }
            }
        }
        return modules;
    }
}
