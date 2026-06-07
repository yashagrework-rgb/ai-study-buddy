package com.studybuddy.service;

import com.google.genai.Client;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.ai.google.genai.GoogleGenAiChatOptions;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class GeminiService {
    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);

    @Value("${gemini.api.key}")
    private String apiKey;

    public String generateContent(String prompt) {
        return generateContent(prompt, null);
    }

    public String generateContent(String prompt, String customApiKey) {
        String keyToUse = (customApiKey != null && !customApiKey.trim().isEmpty()) ? customApiKey : apiKey;
        if (keyToUse == null || keyToUse.trim().isEmpty() || keyToUse.equals("YOUR_GEMINI_KEY") || keyToUse.contains("dummy")) {
            logger.warn("GEMINI_API_KEY is not configured or is placeholder. Returning mock response.");
            return getMockResponse(prompt);
        }

        try {
            Client client = Client.builder().apiKey(keyToUse).build();
            GoogleGenAiChatModel chatModel = GoogleGenAiChatModel.builder()
                    .genAiClient(client)
                    .defaultOptions(GoogleGenAiChatOptions.builder()
                            .model("gemini-2.0-flash-lite")
                            .temperature(0.7)
                            .build())
                    .build();
            
            return chatModel.call(prompt);
        } catch (Exception e) {
            logger.error("Error communicating with Gemini API via Spring AI: {}. Falling back to offline mock response.", e.getMessage());
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
