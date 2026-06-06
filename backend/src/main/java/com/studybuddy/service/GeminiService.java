package com.studybuddy.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiService {
    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateContent(String prompt) {
        return generateContent(prompt, null);
    }

    public String generateContent(String prompt, String customApiKey) {
        String keyToUse = (customApiKey != null && !customApiKey.trim().isEmpty()) ? customApiKey : apiKey;
        if (keyToUse == null || keyToUse.trim().isEmpty() || keyToUse.equals("YOUR_GEMINI_KEY")) {
            logger.warn("GEMINI_API_KEY is not configured. Returning mock response.");
            return getMockResponse(prompt);
        }

        try {
            String url = apiUrl + "?key=" + keyToUse;

            // Construct Request Payload
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            Map<String, Object> parts = new HashMap<>();
            parts.put("parts", Collections.singletonList(textPart));

            Map<String, Object> contents = new HashMap<>();
            contents.put("contents", Collections.singletonList(parts));

            // Set Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(contents, headers);

            // Execute POST request
            ResponseEntity<String> responseEntity = restTemplate.postForEntity(url, entity, String.class);
            
            if (responseEntity.getStatusCode().is2xxSuccessful() && responseEntity.getBody() != null) {
                // Parse response JSON to extract the text content
                JsonNode root = objectMapper.readTree(responseEntity.getBody());
                JsonNode textNode = root.path("candidates")
                        .path(0)
                        .path("content")
                        .path("parts")
                        .path(0)
                        .path("text");
                
                if (!textNode.isMissingNode()) {
                    return textNode.asText();
                }
            }
            throw new RuntimeException("Empty response from Gemini API");

        } catch (Exception e) {
            logger.error("Error communicating with Gemini API: {}. Falling back to offline mock response.", e.getMessage());
            return getMockResponse(prompt);
        }
    }

    public String generateQuiz(String noteContent, int questionCount, String customApiKey) {
        String prompt = "You are a professional quiz maker. Generate a quiz of exactly " + questionCount + 
                " multiple choice questions (MCQs) based on the following notes content. " +
                "Your response must be a valid, raw JSON array of objects. Do not include markdown code block formatting (like ```json or ```). " +
                "Each question object in the JSON array must follow this exact schema:\n" +
                "{\n" +
                "  \"question\": \"The question text\",\n" +
                "  \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],\n" +
                "  \"answer\": \"The exact string value matching the correct option from the options array\"\n" +
                "}\n\n" +
                "Notes Content:\n" +
                noteContent;

        String rawResult = generateContent(prompt, customApiKey);
        return cleanJsonString(rawResult);
    }

    public String generateSummary(String noteContent, String customApiKey) {
        String prompt = "Summarize the following notes content in a clear, structured format using markdown. " +
                "Highlight key concepts, vocabulary, and takeaways. Keep it concise yet comprehensive.\n\n" +
                "Notes Content:\n" +
                noteContent;

        return generateContent(prompt, customApiKey);
    }

    public String generateStudyPlan(String topicOrContent, int durationDays, String customApiKey) {
        String prompt = "Create a detailed " + durationDays + "-day daily study plan for the following topic/material. " +
                "Structure it day-by-day. For each day specify: 1) What to focus on, 2) Study activities, and 3) Self-assessment questions. " +
                "Use markdown formatting with emojis for readability.\n\n" +
                "Topic/Notes Content:\n" +
                topicOrContent;

        return generateContent(prompt, customApiKey);
    }

    public String askAboutNote(String noteContent, String question, String customApiKey) {
        String prompt = "You are a helpful AI Study Buddy. Answer the user's question based on the provided notes context. " +
                "If the answer is not in the notes, use your general knowledge but mention it is not explicitly in the notes.\n\n" +
                "Notes Context:\n" +
                noteContent + "\n\n" +
                "User's Question:\n" +
                question;

        return generateContent(prompt, customApiKey);
    }

    private String cleanJsonString(String rawJson) {
        if (rawJson == null) return "[]";
        String cleaned = rawJson.trim();
        if (cleaned.startsWith("```")) {
            // Strip starting ```json or ```
            cleaned = cleaned.replaceAll("^```(json)?", "");
            // Strip ending ```
            cleaned = cleaned.replaceAll("```$", "");
        }
        return cleaned.trim();
    }

    private String getMockResponse(String prompt) {
        String noteContent = "";
        if (prompt.contains("Notes Content:\n")) {
            noteContent = prompt.substring(prompt.indexOf("Notes Content:\n") + 15);
        } else if (prompt.contains("Notes Context:\n")) {
            noteContent = prompt.substring(prompt.indexOf("Notes Context:\n") + 15);
            if (noteContent.contains("User's Question:\n")) {
                noteContent = noteContent.substring(0, noteContent.indexOf("User's Question:\n"));
            }
        } else if (prompt.contains("Topic/Notes Content:\n")) {
            noteContent = prompt.substring(prompt.indexOf("Topic/Notes Content:\n") + 21);
        }
        
        if (prompt.contains("JSON array")) {
            int count = 5;
            if (prompt.contains("exactly ")) {
                try {
                    String sub = prompt.substring(prompt.indexOf("exactly ") + 8);
                    sub = sub.substring(0, sub.indexOf(" "));
                    count = Integer.parseInt(sub.trim());
                } catch (Exception e) {}
            }
            return LocalAiFallback.getMockQuestionsForSubject(noteContent, count);
        } else if (prompt.contains("Summarize")) {
            return LocalAiFallback.generateLocalSummary(noteContent);
        } else if (prompt.contains("study plan")) {
            int days = 7;
            if (prompt.contains("-day daily")) {
                try {
                    String sub = prompt.substring(prompt.indexOf("detailed ") + 9);
                    sub = sub.substring(0, sub.indexOf("-day"));
                    days = Integer.parseInt(sub.trim());
                } catch (Exception e) {}
            }
            return LocalAiFallback.generateLocalStudyPlan(noteContent, days);
        } else {
            String question = prompt;
            if (prompt.contains("User's Question:\n")) {
                question = prompt.substring(prompt.indexOf("User's Question:\n") + 17);
            }
            return LocalAiFallback.generateLocalChatReply(noteContent, question);
        }
    }
}
