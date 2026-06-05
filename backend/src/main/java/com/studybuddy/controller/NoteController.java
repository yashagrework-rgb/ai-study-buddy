package com.studybuddy.controller;

import com.studybuddy.dto.MessageResponse;
import com.studybuddy.dto.NoteRequest;
import com.studybuddy.model.Note;
import com.studybuddy.model.User;
import com.studybuddy.repository.UserRepository;
import com.studybuddy.security.UserDetailsImpl;
import com.studybuddy.service.NoteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/notes")
public class NoteController {

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

    @PostMapping
    public ResponseEntity<?> createNote(@Valid @RequestBody NoteRequest noteRequest) {
        User currentUser = getCurrentUser();

        Note note = Note.builder()
                .title(noteRequest.getTitle())
                .content(noteRequest.getContent())
                .fileUrl(noteRequest.getFileUrl())
                .user(currentUser)
                .build();

        Note savedNote = noteService.saveNote(Objects.requireNonNull(note, "note"));
        return ResponseEntity.ok(savedNote);
    }

    @GetMapping
    public ResponseEntity<List<Note>> getAllUserNotes() {
        User currentUser = getCurrentUser();
        Long userId = Objects.requireNonNull(currentUser.getId(), "userId");
        List<Note> notes = noteService.getNotesByUserId(userId);
        return ResponseEntity.ok(notes);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        Long userId = Objects.requireNonNull(currentUser.getId(), "userId");
        boolean deleted = noteService.deleteNote(Objects.requireNonNull(id, "id"), userId);

        if (deleted) {
            return ResponseEntity.ok(new MessageResponse("Note deleted successfully!"));
        } else {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Note not found or unauthorized"));
        }
    }
}
