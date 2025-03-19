package org.example.courzelo.controllers.Inscriptions;

import lombok.RequiredArgsConstructor;
import org.example.courzelo.dto.requests.UserReplicaREQ;
import org.example.courzelo.models.Application.Admission;
import org.example.courzelo.models.Inscriptions.Status;
import org.example.courzelo.models.Inscriptions.UserReplica;
import org.example.courzelo.models.institution.Institution;
import org.example.courzelo.repositories.InstitutionRepository;
import org.example.courzelo.serviceImpls.Inscriptions.userExel;
import org.example.courzelo.services.Inscriptions.UserReplicaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/replicas")
@RequiredArgsConstructor
public class UserReplicaController {

    private final UserReplicaService userReplicaService;
    private final InstitutionRepository institutionRepository;

    @GetMapping("/all")
    public ResponseEntity<List<UserReplica>> getAllReplicas() {
        List<UserReplica> replicas = userReplicaService.getAllReplica();
        return ResponseEntity.ok(replicas);
    }
    @GetMapping("/all/{id}")
    public ResponseEntity<List<UserReplica>> getAllReplicasByInstition(@PathVariable String id) {
        List<UserReplica> replicas = userReplicaService.getReplicaByInstitution(id);
        return ResponseEntity.ok(replicas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserReplica> getReplicaById(@PathVariable String id) {
        UserReplica replica = userReplicaService.getReplica(id);
        return ResponseEntity.ok(replica);
    }
    @GetMapping("/email/{id}")
    public ResponseEntity<List<UserReplica>> getReplicaByEmail(@PathVariable String id) {
        List<UserReplica> replica = userReplicaService.getUserReplicaByEmail(id);
        return ResponseEntity.ok(replica);
    }

    @PostMapping("/add")
    public ResponseEntity<UserReplica> addReplica(@RequestBody UserReplicaREQ replica) {

        UserReplica newReplica = new UserReplica();
         newReplica.setEmail(replica.getEmail());
         newReplica.setName(replica.getName());
         newReplica.setLastname(replica.getLastname());
         newReplica.setGender(replica.getGender());
         newReplica.setCountry(replica.getCountry());
         newReplica.setPassword(replica.getPassword());
         newReplica.setBirthDate(replica.getBirthDate());
         Institution institution= institutionRepository.findById(replica.getInstitution()).get();
         newReplica.setInstitution(institution);
         newReplica.setStatus(Status.NOT_ACCEPTED);
        userReplicaService.addReplica(newReplica);
        return ResponseEntity.ok(newReplica);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserReplica> updateReplica(@PathVariable String id, @RequestBody UserReplica replica) {
        replica.setId(id); // Assuming there's a setter for the ID
        UserReplica updatedReplica = userReplicaService.updateReplica(replica);
        return ResponseEntity.ok(updatedReplica);
    }

    @PostMapping("/note/{id}")
    public ResponseEntity<UserReplica> updateReplicaNote(@PathVariable String id, @RequestBody UserReplica replica) {

        UserReplica updatedReplica = userReplicaService.getReplica(id);
        updatedReplica.setNote(replica.getNote());
        userReplicaService.updateReplica(updatedReplica);
        return ResponseEntity.ok(updatedReplica);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReplica(@PathVariable String id) {
        userReplicaService.deleteReplica(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/file/upload/{id}", consumes = "multipart/form-data")
    public ResponseEntity<String> uploadFile(@PathVariable String id, @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Please upload a file!");
        }
        try {
            userReplicaService.saveUsersFromExcel(file, id);
            return ResponseEntity.status(HttpStatus.OK).body("Users uploaded successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload users!");
        }
    }
    @GetMapping("/teachers/{id}")
    public List<String> getTeachers(@PathVariable String id) {
        Institution inst = institutionRepository.findById(id).get();
        List<String> teacher = inst.getTeachers();
        return teacher;
    }

    @GetMapping("/institution/{id}")
    public Boolean isNoted(@PathVariable String id) {
        try {
            List<UserReplica> users = userReplicaService.getReplicaByInstitution(id);

            // Check if all users have a non-null note
            boolean allHaveNotes = users.stream().allMatch(user -> {
                Double note = user.getNote();
                return note != null && note > 0.0;
            });
            return allHaveNotes;
        } catch (Exception e) {
            e.printStackTrace(); // Log the exception for debugging
            return false; // Return false if an error occurs
        }
    }

    @GetMapping("/send-email")
    public String sendEmail(@RequestParam int acceptedLimit, @RequestParam int waitingLimit, @RequestParam String id,
                            Principal principal) {
        userReplicaService.updateApplicationStatuses(acceptedLimit, waitingLimit, id,principal);
        return "Email sent successfully!";
    }
    @PutMapping("/send-email/{id}")
    public String sendEmail1(@RequestParam int acceptedLimit, @RequestParam int waitingLimit, @PathVariable String id,
                            Principal principal) {
        userReplicaService.updateApplicationStatuses(acceptedLimit, waitingLimit, id,principal);
        return "Email sent successfully!";
    }



}
