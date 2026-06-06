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
            logger.error("Error communicating with OpenAI API: {}. Falling back to offline mock response.", e.getMessage());
            return getMockResponse(prompt);
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

    private String getMockResponse(String prompt) {
        if (prompt.contains("JSON array")) {
            return "[\n" +
                    "  {\n" +
                    "    \"question\": \"What is the capital of France?\",\n" +
                    "    \"options\": [\"London\", \"Berlin\", \"Paris\", \"Madrid\"],\n" +
                    "    \"answer\": \"Paris\"\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"question\": \"Which programming language is commonly used for Spring Boot?\",\n" +
                    "    \"options\": [\"Python\", \"Java\", \"C++\", \"JavaScript\"],\n" +
                    "    \"answer\": \"Java\"\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"question\": \"What does JWT stand for?\",\n" +
                    "    \"options\": [\"Java Web Token\", \"JSON Web Token\", \"Joint Web Tech\", \"JPA Web Transaction\"],\n" +
                    "    \"answer\": \"JSON Web Token\"\n" +
                    "  }\n" +
                    "]";
        } else if (prompt.contains("Summarize")) {
            return "### Note Summary (ChatGPT Offline)\n\n" +
                    "* **Introduction:** This is a placeholder summary since the OpenAI API key was not supplied or active.\n" +
                    "* **Core Concepts:**\n" +
                    "  1. *Backend Services:* Built with Java Spring Boot.\n" +
                    "  2. *Security:* Configured with stateless JWT tokens.\n" +
                    "  3. *AI Integration:* OpenAI GPT models.\n" +
                    "* **Key Takeaway:** Configure `OPENAI_API_KEY` in environment variables or settings to enable live summaries!";
        } else if (prompt.contains("study plan")) {
            return "### 7-Day Study Plan (ChatGPT Offline)\n\n" +
                    "* **Day 1: Setup & Initialization**\n" +
                    "  * Focus on Spring Boot backend models and frontend boilerplate.\n" +
                    "* **Day 2: Authentication flow**\n" +
                    "  * Connect register/login endpoints to frontend forms.\n" +
                    "* **Day 3: Database & Notes CRUD**\n" +
                    "  * Verify PostgreSQL tables and write the file uploading system.\n" +
                    "* **Day 4: AI & Quiz Generation**\n" +
                    "  * Connect backend REST controllers with the OpenAI Service.\n" +
                    "* **Day 5: Progress Charts**\n" +
                    "  * Build charts to display scores and study times on Dashboard.\n" +
                    "* **Day 6: Complete End-to-End Testing**\n" +
                    "  * Run through quiz, note CRUD, and security filters.\n" +
                    "* **Day 7: Deployment Ready**\n" +
                    "  * Deploy frontend to Vercel and backend to Render.";
        } else {
            return "Hello from AI Study Buddy! I am currently running in offline mock mode. " +
                    "Please configure a valid `OPENAI_API_KEY` to chat live about your note contents.";
        }
    }
}
