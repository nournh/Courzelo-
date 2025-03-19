package org.example.courzelo.serviceImpls.Inscriptions;

import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.example.courzelo.models.Inscriptions.Status;
import org.example.courzelo.models.Inscriptions.UserReplica;
import org.example.courzelo.models.Role;
import org.example.courzelo.models.User;
import org.example.courzelo.models.institution.Institution;
import org.example.courzelo.repositories.Inscriptions.UserReplicaReposity;
import org.example.courzelo.repositories.InstitutionRepository;
import org.example.courzelo.repositories.UserRepository;
import org.example.courzelo.serviceImpls.AuthServiceImpl;
import org.example.courzelo.services.IInstitutionService;
import org.example.courzelo.services.Inscriptions.UserReplicaService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.InputStream;
import java.security.Principal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

import java.util.List;
@RequiredArgsConstructor
@Service
public class UserReplicaImp implements UserReplicaService {
   private final UserReplicaReposity reposity;
   private final InstitutionRepository institutionRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final IInstitutionService iInstitutionService;
    private final AuthServiceImpl authService;

    @Override
    public List<UserReplica> getAllReplica() {
        return reposity.findAll();
    }

    @Override
    public UserReplica getReplica(String id) {
        return reposity.findById(id).get();
    }

    @Override
    public List<UserReplica> getReplicaByInstitution(String id) {
        Institution inst = institutionRepository.findById(id).get();
        return reposity.findUserReplicaByInstitution(inst);
    }

    @Override
    public UserReplica updateReplica(UserReplica replica) {
        return reposity.save(replica);
    }

    @Override
    public UserReplica addReplica(UserReplica replica) {
        return reposity.save(replica);
    }

    @Override
    public void deleteReplica(String id) {
         reposity.deleteById(id);
    }

    @Override
    public void saveUsersFromExcel(MultipartFile file,String id) {
            try (InputStream inputStream = file.getInputStream();
                 Workbook workbook = WorkbookFactory.create(inputStream)) {

                Sheet sheet = workbook.getSheetAt(0);
                List<UserReplica> users = new ArrayList<>();

                for (Row row : sheet) {
                    if (row.getRowNum() == 0) {
                        continue; // Skip the header row
                    }
                    UserReplica user = new UserReplica();
                    Institution institution = institutionRepository.findById(id).get();
                    user.setInstitution(institution);
                    Cell emailCell = row.getCell(1);
                    Cell nameCell = row.getCell(2);
                    Cell lastnameCell = row.getCell(3);
                    Cell dobCell = row.getCell(4);
                    Cell genderCell = row.getCell(5);
                    Cell countryCell = row.getCell(6);
                    Cell passwordCell = row.getCell(7);//

                    // Handle name cell (assuming it's a string)
                    if (nameCell != null) {
                        if (nameCell.getCellType() == CellType.STRING) {
                            user.setName(nameCell.getStringCellValue());
                        } else if (nameCell.getCellType() == CellType.NUMERIC) {
                            user.setName(String.valueOf(nameCell.getNumericCellValue()));
                        }
                    }

                    if (genderCell != null) {
                        if (genderCell.getCellType() == CellType.STRING) {
                            user.setGender(genderCell.getStringCellValue());
                        } else if (genderCell.getCellType() == CellType.NUMERIC) {
                            user.setGender(String.valueOf(genderCell.getNumericCellValue()));
                        }
                    }

                    if (countryCell != null) {
                        if (countryCell.getCellType() == CellType.STRING) {
                            user.setCountry(countryCell.getStringCellValue());
                        } else if (countryCell.getCellType() == CellType.NUMERIC) {
                            user.setCountry(String.valueOf(countryCell.getNumericCellValue()));
                        }
                    }
                    // Handle email cell (assuming it's a string)
                    if (emailCell != null) {
                        if (emailCell.getCellType() == CellType.STRING) {
                            user.setEmail(emailCell.getStringCellValue());
                        } else if (emailCell.getCellType() == CellType.NUMERIC) {
                            user.setEmail(String.valueOf(emailCell.getNumericCellValue()));
                        }
                    }
                    if (lastnameCell != null) {
                        if (lastnameCell.getCellType() == CellType.STRING) {
                            user.setLastname(lastnameCell.getStringCellValue());
                        } else if (lastnameCell.getCellType() == CellType.NUMERIC) {
                            user.setLastname(String.valueOf(lastnameCell.getNumericCellValue()));
                        }
                    }

                    // Handle phone number cell (assuming it's a string or numeric)
                    if (passwordCell != null) {
                        if (passwordCell.getCellType() == CellType.STRING) {
                            user.setPassword(passwordCell.getStringCellValue());
                        } else if (passwordCell.getCellType() == CellType.NUMERIC) {
                            user.setPassword(String.valueOf((long) passwordCell.getNumericCellValue())); // Cast to long to avoid decimal places
                        }
                    }

                    // Handle date of birth (DOB) cell
                    if (dobCell != null) {
                        if (dobCell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(dobCell)) {
                            Date dob = dobCell.getDateCellValue();
                            LocalDate localDate = dob.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
                            user.setBirthDate(localDate);
                        } else if (dobCell.getCellType() == CellType.STRING) {
                            try {
                                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                                LocalDate localDate = LocalDate.parse(dobCell.getStringCellValue(), formatter);
                                user.setBirthDate(localDate);
                            } catch (DateTimeParseException e) {
                                System.out.println("Failed to parse date: " + dobCell.getStringCellValue());
                            }
                        }
                    }
                    System.out.println("User saved successfully!"+user);

                    users.add(user);
                }

            reposity.saveAll(users);

                System.out.println("Users saved successfully!");

            } catch (Exception e) {
                System.out.println("Failed to process Excel file: " + e.getMessage());
                e.printStackTrace();
                throw new RuntimeException("Failed to process Excel file", e);
            }

    }

    @Override
    public List<UserReplica> getUserReplicaByEmail(String email) {
        return reposity.findUserReplicaByEmail(email);
    }

    @Transactional
    public void updateApplicationStatuses(int acceptedLimit, int waitingLimit, String institutionId, Principal principal) {
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new RuntimeException("Institution not found"));

        List<UserReplica> users = reposity.findUserReplicaByInstitution(institution);
        users.sort(Comparator.comparing(UserReplica::getNote).reversed());

        List<String> emails = new ArrayList<>();
        int totalUsers = users.size();
        int acceptedCount = Math.min(acceptedLimit, totalUsers);
        int waitingCount = Math.min(waitingLimit, Math.max(0, totalUsers - acceptedLimit));


        for (int i = 0; i < acceptedCount; i++) {
            UserReplica userReplica = users.get(i);
            userReplica.setStatus(Status.ACCEPTED);

            String email = userReplica.getEmail().toLowerCase();
            Date birthDate = Date.from(userReplica.getBirthDate().atStartOfDay(ZoneId.systemDefault()).toInstant());
            User user = new User(
                    email,
                    userReplica.getName(),
                    userReplica.getLastname(),
                    birthDate,
                    userReplica.getGender(),
                    userReplica.getCountry(),
                    encoder.encode(userReplica.getPassword()),
                    Role.STUDENT
            );

            userRepository.save(user);
            authService.sendVerificationCode(email);
            iInstitutionService.addInstitutionUser(institution.getId(), email, "STUDENT", principal);

            emails.add(email);

            // Uncomment to send the email notification
        /* String htmlMsg = "<h3>Hello, " + email + "</h3>"
                + "<p>Thank you for registering. You have been ACCEPTED into our university.</p>"
                + "<p>Best regards,</p>"
                + "<p>Courzelo</p>";
        emailService.sendEmail(email, "Admission Result", htmlMsg); */
        }

        for (int i = acceptedCount; i < acceptedCount + waitingCount; i++) {
            users.get(i).setStatus(Status.WAITING);

            // Uncomment to send the email notification
        /* String htmlMsg = "<h3>Hello, " + users.get(i).getEmail() + "</h3>"
                + "<p>You have been placed on our WAITING list.</p>"
                + "<p>Best regards,</p>"
                + "<p>Courzelo</p>";
        emailService.sendEmail(users.get(i).getEmail(), "Admission Result", htmlMsg); */
        }

        for (int i = acceptedCount + waitingCount; i < totalUsers; i++) {
            users.get(i).setStatus(Status.NOT_ACCEPTED);

            // Uncomment to send the email notification
        /* String htmlMsg = "<h3>Hello, " + users.get(i).getEmail() + "</h3>"
                + "<p>Unfortunately, you were not accepted.</p>"
                + "<p>Best regards,</p>"
                + "<p>Courzelo</p>";
        emailService.sendEmail(users.get(i).getEmail(), "Admission Result", htmlMsg); */
        }

        reposity.saveAll(users);

        System.out.println("Emails sent to: " + emails);
    }




}
