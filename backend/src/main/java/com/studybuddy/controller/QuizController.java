package com.studybuddy.controller;

import com.studybuddy.dto.QuizRequest;
import com.studybuddy.dto.QuizSubmitRequest;
import com.studybuddy.model.Quiz;
import com.studybuddy.model.User;
import com.studybuddy.repository.UserRepository;
import com.studybuddy.security.UserDetailsImpl;
import com.studybuddy.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/quiz")
public class QuizController {

    @Autowired
    private QuizService quizService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generateQuiz(@RequestBody QuizRequest quizRequest) {
        User currentUser = getCurrentUser();
        Quiz quiz = quizService.generateQuiz(
                Objects.requireNonNull(currentUser, "currentUser"), 
                Objects.requireNonNull(quizRequest, "quizRequest")
        );
        return ResponseEntity.ok(quiz);
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitQuiz(@RequestBody QuizSubmitRequest submitRequest) {
        User currentUser = getCurrentUser();
        Quiz quiz = quizService.submitQuiz(Objects.requireNonNull(currentUser, "currentUser"), Objects.requireNonNull(submitRequest, "submitRequest"));
        return ResponseEntity.ok(quiz);
    }

    @GetMapping("/results")
    public ResponseEntity<List<Quiz>> getQuizResults() {
        User currentUser = getCurrentUser();
        List<Quiz> quizzes = quizService.getQuizzesByUserId(currentUser.getId());
        return ResponseEntity.ok(quizzes);
    }
}
