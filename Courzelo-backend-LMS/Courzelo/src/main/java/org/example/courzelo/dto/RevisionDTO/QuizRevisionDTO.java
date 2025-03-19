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
public class QuizRevisionDTO {


        private String id;

        private String title;

        private FileMetadatarevisionDTO fileMetadatarevision;

        private List<QuestionRevisionsDto> questions;

        private RevisionDto revision;
    }


