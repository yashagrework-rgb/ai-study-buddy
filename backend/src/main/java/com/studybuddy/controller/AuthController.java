package com.studybuddy.controller;

import com.studybuddy.dto.JwtResponse;
import com.studybuddy.dto.LoginRequest;
import com.studybuddy.dto.MessageResponse;
import com.studybuddy.dto.SignupRequest;
import com.studybuddy.model.User;
import com.studybuddy.repository.UserRepository;
import com.studybuddy.security.JwtUtils;
import com.studybuddy.security.UserDetailsImpl;
import com.studybuddy.service.ProgressService;
import com.studybuddy.service.NoteSeederService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private ProgressService progressService;

    @Autowired
    private NoteSeederService noteSeederService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        // Seed default notes if the user currently has none
        userRepository.findById(userDetails.getId()).ifPresent(user -> {
            noteSeederService.seedIfEmpty(user);
        });

        return ResponseEntity.ok(new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getName(),
                userDetails.getEmail(),
                role
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = User.builder()
                .name(signUpRequest.getName())
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .role("ROLE_USER")
                .build();

        User savedUser = userRepository.save(Objects.requireNonNull(user, "user"));

        // Pre-create progress tracking data
        progressService.getOrCreateProgress(savedUser);

        // Seed comprehensive computer science notes
        noteSeederService.seedNotesForUser(savedUser);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}
