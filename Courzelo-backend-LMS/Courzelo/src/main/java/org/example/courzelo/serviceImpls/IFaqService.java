package org.example.courzelo.serviceImpls;


import org.example.courzelo.models.FAQ;

import java.util.List;
import java.util.Optional;

public interface IFaqService {
    Optional<FAQ> getFAQ(String id);
    List<FAQ> getAllFAQS();

    void deleteFAQ(String id);


    void saveFAQ(FAQ faq);
    FAQ saveFAQ1(FAQ faq);

    void updateFAQ(FAQ faq);
    FAQ updateFAQ1(FAQ faq);

    Boolean existbyID(String id );

    FAQ updateFAQ1 (String id, String anwser, String question);
}
