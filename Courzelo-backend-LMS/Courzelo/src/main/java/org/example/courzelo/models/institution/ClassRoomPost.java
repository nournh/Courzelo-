package org.example.courzelo.models.institution;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ClassRoomPost {
    private String id;
    private String title;
    private String description;
    private List<String> files;
    private LocalDateTime created;
    public static class ClassRoomPostBuilder {
        public ClassRoomPostBuilder() {
            this.id = UUID.randomUUID().toString();
        }
    }
}
