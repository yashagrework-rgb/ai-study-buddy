package com.studybuddy.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class OpenAiService {
    private static final Logger logger = LoggerFactory.getLogger(OpenAiService.class);

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final String OPENAI_URL = "https://api.openai.com/v1/chat/completions";

    public String generateContent(String prompt, String apiKey) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            logger.warn("OpenAI API key is missing. Returning fallback.");
            return "ChatGPT Error: OpenAI API Key is not configured. Please supply an API key in settings.";
        }

        try {
            // Construct Request Payload
            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);

            Map<String, Object> payload = new HashMap<>();
            payload.put("model", "gpt-4o-mini");
            payload.put("messages", Collections.singletonList(message));
            payload.put("temperature", 0.7);

            // Set Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey.trim());

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            // Execute POST request
            ResponseEntity<String> responseEntity = restTemplate.postForEntity(OPENAI_URL, entity, String.class);

            if (responseEntity.getStatusCode().is2xxSuccessful() && responseEntity.getBody() != null) {
                // Parse response JSON to extract the text content
                JsonNode root = objectMapper.readTree(responseEntity.getBody());
                JsonNode textNode = root.path("choices")
                        .path(0)
                        .path("message")
                        .path("content");

                if (!textNode.isMissingNode()) {
                    return textNode.asText();
                }
            }
            throw new RuntimeException("Empty response from OpenAI API");

        } catch (Exception e) {
            logger.error("Error communicating with OpenAI API: {}", e.getMessage());
            return "ChatGPT Error: Unable to reach OpenAI API. Details: " + e.getMessage();
        }
    }

    public String askAboutNote(String noteContent, String question, String apiKey) {
        String prompt = "You are a helpful AI Study Buddy. Answer the user's question based on the provided notes context. " +
                "If the answer is not in the notes, use your general knowledge but mention it is not explicitly in the notes.\n\n" +
                "Notes Context:\n" +
                noteContent + "\n\n" +
                "User's Question:\n" +
                question;

        return generateContent(prompt, apiKey);
    }

    public String generateQuiz(String noteContent, int questionCount, String apiKey) {
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

        String rawResult = generateContent(prompt, apiKey);
        return cleanJsonString(rawResult);
    }

    public String generateSummary(String noteContent, String apiKey) {
        String prompt = "Summarize the following notes content in a clear, structured format using markdown. " +
                "Highlight key concepts, vocabulary, and takeaways. Keep it concise yet comprehensive.\n\n" +
                "Notes Content:\n" +
                noteContent;

        return generateContent(prompt, apiKey);
    }

    public String generateStudyPlan(String contentSource, int durationDays, String apiKey) {
        String prompt = "Create a detailed " + durationDays + "-day daily study plan for the following topic/material. " +
                "Structure it day-by-day. For each day specify: 1) What to focus on, 2) Study activities, and 3) Self-assessment questions. " +
                "Use markdown formatting with emojis for readability.\n\n" +
                "Topic/Notes Content:\n" +
                contentSource;

        return generateContent(prompt, apiKey);
    }

    private String cleanJsonString(String rawJson) {
        if (rawJson == null) return "[]";
        String cleaned = rawJson.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceAll("^```(json)?", "");
            cleaned = cleaned.replaceAll("```$", "");
        }
        return cleaned.trim();
    }
}
