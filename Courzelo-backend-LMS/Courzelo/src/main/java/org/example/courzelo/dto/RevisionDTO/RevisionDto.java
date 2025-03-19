package org.example.courzelo.dto.RevisionDTO;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RevisionDto {
        private String id;
        private String titre;
        private List<FileMetadatarevisionDTO> files;
        private int nbrmax;
        private String subjectRevision;
        private List<QuizRevisionDTO> quizRevisions;
    }

