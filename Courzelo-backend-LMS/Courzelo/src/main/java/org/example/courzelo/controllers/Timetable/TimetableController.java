package org.example.courzelo.controllers.Timetable;

import com.lowagie.text.DocumentException;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.courzelo.dto.Timetable.TimetableDTO;
import org.example.courzelo.models.Timetable.ElementModule;
import org.example.courzelo.repositories.Timetable.ElementModuleRepo;
import org.example.courzelo.services.Timetable.PdfExportService;
import org.example.courzelo.services.Timetable.TimetableeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:4200/", maxAge = 3600, allowedHeaders = "*", allowCredentials = "true")
@RestController
@Slf4j
@RequestMapping(value = "/api/TimeTable", produces = MediaType.APPLICATION_JSON_VALUE)
@AllArgsConstructor
public class TimetableController {
    private final TimetableeService timeTableService;
    private final ElementModuleRepo elementModuleRepo;
    private final PdfExportService pdfExportService;


    @PostMapping
    @ApiResponse(responseCode = "201")
    public ResponseEntity<String> create(@Valid @RequestBody TimetableDTO timeTableDTO) {
        String timeTableId = timeTableService.create(timeTableDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(timeTableId);
    }
    //newTimetable
    @GetMapping
    public List<Map<String, List<ElementModule>>> getAllEmplois() {
        return timeTableService.getAllEmplois();
    }
    //newTimetable
    @GetMapping("/{id}")
    public List<ElementModule> getEmploisByClasse(@PathVariable String id) {
        return timeTableService.getEmploisByClasse(id);
    }
    //newTimetable
    @GetMapping("/generate")
    public List<Map<String, List<ElementModule>>> generateEmplois() {
        return timeTableService.generateEmplois();
    }
    //newTimetable
    //getEmploiByProf
    @GetMapping("/prof/{id}")
    public  List<ElementModule>getEmploiByProf(@PathVariable String id) {

        return timeTableService.getEmploiByProf(id);
    }
    @PutMapping("/{id}")
    public ResponseEntity<String> update(@PathVariable String id, @Valid @RequestBody TimetableDTO timeTableDTO) {
        timeTableService.update(id, timeTableDTO);
        return ResponseEntity.ok("TimeTable updated successfully");
    }
    @DeleteMapping("/{id}")
    @ApiResponse(responseCode = "201")
    public ResponseEntity<String> delete(@PathVariable String id) {
        timeTableService.delete(id);
        return ResponseEntity.ok("TimeTable deleted successfully");
    }
    @GetMapping("/count")
    public ResponseEntity<Long> countTimetables() {
        long timetableCount = timeTableService.countTimetables();
        return ResponseEntity.ok(timetableCount);
    }
    @GetMapping("/classes")
    public void generateAll(HttpServletResponse response) throws IOException, DocumentException {
        this.pdfExportService.ClassesPDF(response);
    }
    @GetMapping("/classes/{id}")
    public void generatePDFbyClass(HttpServletResponse response,@PathVariable String  id) throws IOException, DocumentException {
        this.pdfExportService.OneClassePDF(response,id);
    }
    @GetMapping("/teachers/{id}")
    public void generatePDFbyProf(HttpServletResponse response,@PathVariable String  id) throws IOException, DocumentException {
        this.pdfExportService.ProfPDF(response,id);
    }
    @GetMapping("/teachers")
    public void generatePDFbyProf(HttpServletResponse response) throws IOException, DocumentException {
        this.pdfExportService.AllProfsPDF(response);
    }
}
