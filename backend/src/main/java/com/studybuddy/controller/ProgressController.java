package com.studybuddy.controller;

import com.studybuddy.model.Progress;
import com.studybuddy.model.User;
import com.studybuddy.repository.UserRepository;
import com.studybuddy.security.UserDetailsImpl;
import com.studybuddy.service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Objects;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    @Autowired
    private ProgressService progressService;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @GetMapping
    public ResponseEntity<Progress> getUserProgress() {
        User currentUser = getCurrentUser();
        Progress progress = progressService.getOrCreateProgress(Objects.requireNonNull(currentUser, "currentUser"));
        return ResponseEntity.ok(progress);
    }
}
