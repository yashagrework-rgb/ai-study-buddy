package com.studybuddy;

import com.studybuddy.service.GeminiService;
import com.studybuddy.service.OpenAiService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class AiServiceTest {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private OpenAiService openAiService;

    @Test
    public void testGeminiServiceFallback() {
        assertNotNull(geminiService);
        // Using a dummy/empty key should trigger the fallback to mock response
        String summary = geminiService.generateSummary("This is a test note about Java and JVM.", "dummy-key");
        assertNotNull(summary);
        assertTrue(summary.contains("Java") || summary.contains("Local") || summary.contains("Offline") || summary.contains("Study"));
        System.out.println("Gemini Fallback Summary Output:\n" + summary);
    }

    @Test
    public void testOpenAiServiceFallback() {
        assertNotNull(openAiService);
        String summary = openAiService.generateSummary("This is a test note about Python and GIL.", "dummy-key");
        assertNotNull(summary);
        assertTrue(summary.contains("Python") || summary.contains("Local") || summary.contains("Offline") || summary.contains("Study"));
        System.out.println("OpenAI Fallback Summary Output:\n" + summary);
    }
}
