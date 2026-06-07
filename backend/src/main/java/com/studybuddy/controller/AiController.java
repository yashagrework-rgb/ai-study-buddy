package com.studybuddy.controller;

import com.studybuddy.dto.*;
import com.studybuddy.model.Note;
import com.studybuddy.model.User;
import com.studybuddy.repository.UserRepository;
import com.studybuddy.security.UserDetailsImpl;
import com.studybuddy.service.GeminiService;
import com.studybuddy.service.OpenAiService;
import com.studybuddy.service.OllamaService;
import com.studybuddy.service.NoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private OpenAiService openAiService;

    @Autowired
    private OllamaService ollamaService;

    @Autowired
    private NoteService noteService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(
            @RequestHeader(value = "X-Ai-Provider", required = false) String provider,
            @RequestHeader(value = "X-Gemini-API-Key", required = false) String customGeminiKey,
            @RequestHeader(value = "X-OpenAI-API-Key", required = false) String customOpenAiKey,
            @RequestHeader(value = "X-Ollama-URL", required = false) String customOllamaUrl,
            @RequestHeader(value = "X-Ollama-Model", required = false) String customOllamaModel,
            @RequestBody ChatRequest chatRequest) {
        User currentUser = getCurrentUser();
        String context = "";

        if (chatRequest.getNoteId() != null) {
            Long noteId = Objects.requireNonNull(chatRequest.getNoteId(), "noteId");
            Optional<Note> noteOpt = noteService.getNoteById(noteId);
            if (noteOpt.isPresent() && noteOpt.get().getUser().getId().equals(currentUser.getId())) {
                context = noteOpt.get().getContent();
            }
        } else if (chatRequest.getContent() != null) {
            context = chatRequest.getContent();
        }

        String reply;
        if ("openai".equalsIgnoreCase(provider)) {
            String keyToUse = (customOpenAiKey != null && !customOpenAiKey.trim().isEmpty()) ? customOpenAiKey : currentUser.getOpenAiApiKey();
            if (!context.isEmpty()) {
                reply = openAiService.askAboutNote(context, chatRequest.getMessage(), keyToUse);
            } else {
                reply = openAiService.generateContent(chatRequest.getMessage(), keyToUse);
            }
        } else if ("ollama".equalsIgnoreCase(provider)) {
            if (!context.isEmpty()) {
                reply = ollamaService.askAboutNote(context, chatRequest.getMessage(), customOllamaUrl, customOllamaModel);
            } else {
                reply = ollamaService.generateContent(chatRequest.getMessage(), customOllamaUrl, customOllamaModel);
            }
        } else {
            String keyToUse = (customGeminiKey != null && !customGeminiKey.trim().isEmpty()) ? customGeminiKey : currentUser.getGeminiApiKey();
            if (!context.isEmpty()) {
                reply = geminiService.askAboutNote(context, chatRequest.getMessage(), keyToUse);
            } else {
                reply = geminiService.generateContent(chatRequest.getMessage(), keyToUse);
            }
        }

        return ResponseEntity.ok(new ChatResponse(reply));
    }

    @PostMapping("/summarize")
    public ResponseEntity<ChatResponse> summarize(
            @RequestHeader(value = "X-Ai-Provider", required = false) String provider,
            @RequestHeader(value = "X-Gemini-API-Key", required = false) String customGeminiKey,
            @RequestHeader(value = "X-OpenAI-API-Key", required = false) String customOpenAiKey,
            @RequestHeader(value = "X-Ollama-URL", required = false) String customOllamaUrl,
            @RequestHeader(value = "X-Ollama-Model", required = false) String customOllamaModel,
            @RequestBody SummaryRequest summaryRequest) {
        User currentUser = getCurrentUser();
        String contentToSummarize = "";

        if (summaryRequest.getNoteId() != null) {
            Long noteId = Objects.requireNonNull(summaryRequest.getNoteId(), "noteId");
            Optional<Note> noteOpt = noteService.getNoteById(noteId);
            if (noteOpt.isPresent() && noteOpt.get().getUser().getId().equals(currentUser.getId())) {
                contentToSummarize = noteOpt.get().getContent();
            }
        } else if (summaryRequest.getContent() != null) {
            contentToSummarize = summaryRequest.getContent();
        }

        if (contentToSummarize.isEmpty()) {
            return ResponseEntity.badRequest().body(new ChatResponse("Error: No content available to summarize"));
        }

        String summary;
        if ("openai".equalsIgnoreCase(provider)) {
            String keyToUse = (customOpenAiKey != null && !customOpenAiKey.trim().isEmpty()) ? customOpenAiKey : currentUser.getOpenAiApiKey();
            summary = openAiService.generateSummary(contentToSummarize, keyToUse);
        } else if ("ollama".equalsIgnoreCase(provider)) {
            summary = ollamaService.generateSummary(contentToSummarize, customOllamaUrl, customOllamaModel);
        } else {
            String keyToUse = (customGeminiKey != null && !customGeminiKey.trim().isEmpty()) ? customGeminiKey : currentUser.getGeminiApiKey();
            summary = geminiService.generateSummary(contentToSummarize, keyToUse);
        }

        return ResponseEntity.ok(new ChatResponse(summary));
    }

    @PostMapping("/study-plan")
    public ResponseEntity<ChatResponse> generateStudyPlan(
            @RequestHeader(value = "X-Ai-Provider", required = false) String provider,
            @RequestHeader(value = "X-Gemini-API-Key", required = false) String customGeminiKey,
            @RequestHeader(value = "X-OpenAI-API-Key", required = false) String customOpenAiKey,
            @RequestHeader(value = "X-Ollama-URL", required = false) String customOllamaUrl,
            @RequestHeader(value = "X-Ollama-Model", required = false) String customOllamaModel,
            @RequestBody StudyPlanRequest studyPlanRequest) {
        User currentUser = getCurrentUser();
        String contentSource = "";

        if (studyPlanRequest.getNoteId() != null) {
            Long noteId = Objects.requireNonNull(studyPlanRequest.getNoteId(), "noteId");
            Optional<Note> noteOpt = noteService.getNoteById(noteId);
            if (noteOpt.isPresent() && noteOpt.get().getUser().getId().equals(currentUser.getId())) {
                contentSource = noteOpt.get().getContent();
            }
        } else if (studyPlanRequest.getTopic() != null) {
            contentSource = studyPlanRequest.getTopic();
        }

        if (contentSource.isEmpty()) {
            return ResponseEntity.badRequest().body(new ChatResponse("Error: No topic or note context selected for the study plan"));
        }

        int days = studyPlanRequest.getDurationDays() != null ? studyPlanRequest.getDurationDays() : 7;
        String studyPlan;
        if ("openai".equalsIgnoreCase(provider)) {
            String keyToUse = (customOpenAiKey != null && !customOpenAiKey.trim().isEmpty()) ? customOpenAiKey : currentUser.getOpenAiApiKey();
            studyPlan = openAiService.generateStudyPlan(contentSource, days, keyToUse);
        } else if ("ollama".equalsIgnoreCase(provider)) {
            studyPlan = ollamaService.generateStudyPlan(contentSource, days, customOllamaUrl, customOllamaModel);
        } else {
            String keyToUse = (customGeminiKey != null && !customGeminiKey.trim().isEmpty()) ? customGeminiKey : currentUser.getGeminiApiKey();
            studyPlan = geminiService.generateStudyPlan(contentSource, days, keyToUse);
        }

        return ResponseEntity.ok(new ChatResponse(studyPlan));
    }

    @PutMapping("/api-key")
    public ResponseEntity<?> updateApiKey(@RequestBody java.util.Map<String, String> payload) {
        User currentUser = getCurrentUser();
        if (payload.containsKey("geminiApiKey")) {
            currentUser.setGeminiApiKey(payload.get("geminiApiKey"));
        }
        if (payload.containsKey("openAiApiKey")) {
            currentUser.setOpenAiApiKey(payload.get("openAiApiKey"));
        }
        // Backward compatibility for old calls
        if (payload.containsKey("apiKey")) {
            currentUser.setGeminiApiKey(payload.get("apiKey"));
        }
        userRepository.save(currentUser);
        return ResponseEntity.ok(new MessageResponse("API Keys updated successfully"));
    }
}
