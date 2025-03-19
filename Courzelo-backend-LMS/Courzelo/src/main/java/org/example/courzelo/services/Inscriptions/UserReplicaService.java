package org.example.courzelo.services.Inscriptions;

import org.example.courzelo.models.Application.Application;
import org.example.courzelo.models.Application.Status;
import org.example.courzelo.models.Inscriptions.UserReplica;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

public interface UserReplicaService {

    List<UserReplica> getReplicaByInstitution(String id);
    List<UserReplica> getAllReplica();
    UserReplica getReplica(String id);

    UserReplica updateReplica(UserReplica replica);

    UserReplica addReplica(UserReplica replica);

    void deleteReplica(String id);

    void saveUsersFromExcel(MultipartFile file,String id);

   List <UserReplica> getUserReplicaByEmail(String emial);

     void updateApplicationStatuses(int acceptedLimit, int waitingLimit, String id, Principal principal) ;
}
