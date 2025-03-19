package org.example.courzelo.models.institution;

import lombok.Data;
import org.example.courzelo.dto.requests.institution.InstitutionRequest;
import org.example.courzelo.dto.responses.institution.InstitutionTimeSlot;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Document(collection = "institutions")
@Data
public class Institution {
    @Id
    private String id;
    private String name;
    private String slogan;
    private String logo;
    private String country;
    private String address;
    private String description;
    private String website;
    private List<String> admins = new ArrayList<>();
    private List<String> teachers = new ArrayList<>();
    private List<String> students = new ArrayList<>();
    private double latitude;
    private double longitude;
    private Date firstSemesterStart;
    private Date secondSemesterStart;
    private Map<String, List<Timeslot>> groupTimetables;
    private Map<String, List<Timeslot>> teacherTimetables;
    private Date timetableWeek;
    private List<String> timeSlotsDays = new ArrayList<>();
    private List<InstitutionTimeSlot> timeSlots = new ArrayList<>();
    private List<String> groupsID = new ArrayList<>();
    private List<String> classRoomsID = new ArrayList<>();
    private List<String> programsID = new ArrayList<>();

    public List<String> getUsers() {
        List<String> users = new ArrayList<>();
        // only one instance of each user
        for (String user : admins) {
            if (!users.contains(user)) {
                users.add(user);
            }
        }
        for (String user: teachers) {
            if (!users.contains(user)) {
                users.add(user);
            }
        }
        for (String user : students) {
            if (!users.contains(user)) {
                users.add(user);
            }
        }
         return users;
    }
    public Institution()
    {
    }
    public Institution(InstitutionRequest institutionRequest){
        this.name = institutionRequest.getName();
        this.slogan = institutionRequest.getSlogan();
        this.country = institutionRequest.getCountry();
        this.address = institutionRequest.getAddress();
        this.description = institutionRequest.getDescription();
        this.website = institutionRequest.getWebsite();
    }

    public Institution(String name, String slogan, String country, String address, String description, String website) {
        this.name = name;
        this.slogan = slogan;
        this.country = country;
        this.address = address;
        this.description = description;
        this.website = website;
    }

    public void updateInstitution(InstitutionRequest institutionRequest){
        this.name = institutionRequest.getName();
        this.slogan = institutionRequest.getSlogan();
        this.country = institutionRequest.getCountry();
        this.address = institutionRequest.getAddress();
        this.description = institutionRequest.getDescription();
        this.website = institutionRequest.getWebsite();
    }
}
