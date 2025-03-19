package org.example.courzelo.serviceImpls.Inscriptions;


import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;



@Slf4j
@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender javaMailSender1;

    @Autowired
    public EmailService(JavaMailSender javaMailSender1) {
        this.javaMailSender1 = javaMailSender1;
    }

    public void sendEmail(String to, String subject, String text) {
        logger.info("Preparing to send email to {}", to);

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            javaMailSender1.send(message);
            logger.info("Email successfully sent to {}", to);
        } catch (MailException e) {
            logger.error("Failed to send email to {}. Error: {}", to, e.getMessage());
        }
    }
}