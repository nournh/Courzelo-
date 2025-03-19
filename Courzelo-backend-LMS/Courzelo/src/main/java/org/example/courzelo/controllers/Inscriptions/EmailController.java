package org.example.courzelo.controllers.Inscriptions;

import org.example.courzelo.serviceImpls.Inscriptions.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/maills")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @GetMapping("/send-email")
    public String sendEmail(@RequestParam String to, @RequestParam String subject, @RequestParam String text) {
        String htmlMsg = "<h3>Hello, " + text + "</h3>"
                + "<p>Thank you for registering. Please click the below link to verify your email:</p>"
                + "<p> We are sad to inform you that your are ACCEPTED into our university   </p>"
                + "<p>If you did not make this request, you can ignore this email.</p>"
                + "<p>Best,</p>"
                + "<p>Courzelo</p>";
        emailService.sendEmail(to, subject, htmlMsg);
        return "Email sent successfully!";
    }

}
