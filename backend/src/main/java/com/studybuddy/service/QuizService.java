package com.studybuddy.service;

import com.studybuddy.dto.QuizRequest;
import com.studybuddy.dto.QuizSubmitRequest;
import com.studybuddy.model.Note;
import com.studybuddy.model.Quiz;
import com.studybuddy.model.User;
import com.studybuddy.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class QuizService {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private NoteService noteService;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private ProgressService progressService;

    public Quiz generateQuiz(@NonNull User user, @NonNull QuizRequest quizRequest, String customApiKey) {
        String contentSource = "";
        String quizTitle = "General Knowledge Quiz";

        // Fetch Note if ID is present
        if (quizRequest.getNoteId() != null) {
            Long noteId = Objects.requireNonNull(quizRequest.getNoteId(), "noteId");
            Optional<Note> noteOpt = noteService.getNoteById(noteId);
            if (noteOpt.isPresent()) {
                Note note = noteOpt.get();
                contentSource = note.getContent();
                quizTitle = "Quiz: " + note.getTitle();
            }
        } else if (quizRequest.getContent() != null && !quizRequest.getContent().trim().isEmpty()) {
            contentSource = quizRequest.getContent();
            quizTitle = "Custom Text Quiz";
        } else {
            contentSource = "General science, computer science, and logic principles.";
        }

        int count = quizRequest.getQuestionCount() != null ? quizRequest.getQuestionCount() : 5;

        // Generate MCQ questions using Gemini API
        String questionsJson = geminiService.generateQuiz(contentSource, count, customApiKey);

        // Save generated quiz
        Quiz quiz = Quiz.builder()
                .title(quizTitle)
                .questions(questionsJson)
                .score(0) // 0 indicates not completed / default score
                .user(user)
                .build();

        return quizRepository.save(Objects.requireNonNull(quiz, "quiz"));
    }

    public Quiz submitQuiz(@NonNull User user, @NonNull QuizSubmitRequest submission) {
        Long quizId = Objects.requireNonNull(submission.getQuizId(), "quizId");
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found with id: " + quizId));

        if (!quiz.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: You do not own this quiz");
        }

        // Update quiz score
        quiz.setScore(submission.getScore());
        Quiz savedQuiz = quizRepository.save(quiz);

        // Update user learning progress
        long studyTime = submission.getStudyTime() != null ? submission.getStudyTime() : 5L; // default 5 minutes study time
        progressService.updateProgress(user, submission.getScore(), studyTime);

        return savedQuiz;
    }

    public List<Quiz> getQuizzesByUserId(Long userId) {
        return quizRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
