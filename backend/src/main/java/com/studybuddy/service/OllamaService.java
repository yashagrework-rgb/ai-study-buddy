package com.studybuddy.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.ollama.api.OllamaApi;
import org.springframework.ai.ollama.api.OllamaChatOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;

@Service
public class OllamaService {
    private static final Logger logger = LoggerFactory.getLogger(OllamaService.class);

    @Value("${ollama.api.url:http://localhost:11434}")
    private String defaultOllamaUrl;

    @Value("${ollama.model:llama3}")
    private String defaultOllamaModel;

    public String generateContent(String prompt, String customOllamaUrl, String customOllamaModel) {
        String urlToUse = (customOllamaUrl != null && !customOllamaUrl.trim().isEmpty()) ? customOllamaUrl : defaultOllamaUrl;
        String modelToUse = (customOllamaModel != null && !customOllamaModel.trim().isEmpty()) ? customOllamaModel : defaultOllamaModel;

        // First do a fast connectivity check (5 second timeout)
        if (!isOllamaReachable(urlToUse)) {
            logger.warn("Ollama at {} is not reachable. Using local fallback immediately.", urlToUse);
            return getMockResponse(prompt);
        }

        try {
            logger.info("Connecting to Ollama at {} using model {}", urlToUse, modelToUse);
            
            SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
            requestFactory.setConnectTimeout(10000);   // 10 second connection timeout
            requestFactory.setReadTimeout(180000);     // 3 minute read timeout for AI generation
            
            org.springframework.web.client.RestClient.Builder restClientBuilder = 
                org.springframework.web.client.RestClient.builder()
                    .defaultHeader("Bypass-Tunnel-Reminder", "true")
                    .defaultHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                    .requestFactory(requestFactory);

            OllamaApi ollamaApi = OllamaApi.builder()
                    .baseUrl(urlToUse.trim())
                    .restClientBuilder(restClientBuilder)
                    .build();

            OllamaChatModel chatModel = OllamaChatModel.builder()
                    .ollamaApi(ollamaApi)
                    .defaultOptions(OllamaChatOptions.builder()
                            .model(modelToUse.trim())
                            .temperature(0.4)
                            .numPredict(2048)
                            .build())
                    .build();

            return chatModel.call(prompt);
        } catch (Exception e) {
            logger.error("Error communicating with local Ollama at {}: {}. Falling back to offline mock response.", urlToUse, e.getMessage());
            return getMockResponse(prompt);
        }
    }

    private boolean isOllamaReachable(String baseUrl) {
        try {
            SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(5000);   // 5 second connection timeout only
            factory.setReadTimeout(5000);
            org.springframework.web.client.RestClient pingClient = org.springframework.web.client.RestClient.builder()
                    .defaultHeader("Bypass-Tunnel-Reminder", "true")
                    .defaultHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .requestFactory(factory)
                    .build();
            String pingUrl = baseUrl.trim().replaceAll("/$", "") + "/";
            String response = pingClient.get().uri(pingUrl).retrieve().body(String.class);
            logger.info("Ollama ping succeeded: {}", pingUrl);
            return true;
        } catch (Exception e) {
            logger.warn("Ollama ping failed at {}: {}", baseUrl, e.getMessage());
            return false;
        }
    }


    public String generateQuiz(String noteContent, int questionCount, String customOllamaUrl, String customOllamaModel) {
        // Truncate content to keep prompt short for faster Ollama generation
        String truncatedContent = noteContent.length() > 2000 ? noteContent.substring(0, 2000) + "..." : noteContent;
        String prompt = "Generate exactly " + questionCount + " MCQ quiz questions from the notes below. " +
                "Return ONLY a raw JSON array. No markdown. No explanation. Schema: " +
                "[{\"question\":\"Q text\",\"options\":[\"A\",\"B\",\"C\",\"D\"],\"answer\":\"correct option\"}]\n\n" +
                "Notes:\n" +
                truncatedContent;

        String rawResult = generateContent(prompt, customOllamaUrl, customOllamaModel);
        return cleanJsonString(rawResult);
    }

    public String generateSummary(String noteContent, String customOllamaUrl, String customOllamaModel) {
        // Truncate content for faster processing
        String truncatedContent = noteContent.length() > 3000 ? noteContent.substring(0, 3000) + "..." : noteContent;
        String prompt = "Summarize the following notes using markdown. List key concepts, vocab, and takeaways concisely.\n\n" +
                "Notes:\n" +
                truncatedContent;

        return generateContent(prompt, customOllamaUrl, customOllamaModel);
    }

    public String generateStudyPlan(String contentSource, int durationDays, String customOllamaUrl, String customOllamaModel) {
        String prompt = "Create a detailed " + durationDays + "-day daily study plan for the following topic/material. " +
                "Structure it day-by-day. For each day specify: 1) What to focus on, 2) Study activities, and 3) Self-assessment questions. " +
                "Use markdown formatting with emojis for readability.\n\n" +
                "Topic/Notes Content:\n" +
                contentSource;

        return generateContent(prompt, customOllamaUrl, customOllamaModel);
    }

    public String askAboutNote(String noteContent, String question, String customOllamaUrl, String customOllamaModel) {
        String prompt = "You are a helpful AI Study Buddy. Answer the user's question based on the provided notes context. " +
                "If the answer is not in the notes, use your general knowledge but mention it is not explicitly in the notes.\n\n" +
                "Notes Context:\n" +
                noteContent + "\n\n" +
                "User's Question:\n" +
                question;

        return generateContent(prompt, customOllamaUrl, customOllamaModel);
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
