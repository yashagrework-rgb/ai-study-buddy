package com.studybuddy.service;

import com.studybuddy.model.Note;
import com.studybuddy.repository.NoteRepository;
import org.springframework.lang.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NoteService {

    @Autowired
    private NoteRepository noteRepository;

    public Note saveNote(@NonNull Note note) {
        return noteRepository.save(note);
    }

    public List<Note> getNotesByUserId(@NonNull Long userId) {
        return noteRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Optional<Note> getNoteById(@NonNull Long noteId) {
        return noteRepository.findById(noteId);
    }

    public boolean deleteNote(@NonNull Long noteId, @NonNull Long userId) {
        Optional<Note> noteOpt = noteRepository.findById(noteId);
        if (noteOpt.isPresent()) {
            Note note = noteOpt.get();
            if (note.getUser().getId().equals(userId)) {
                noteRepository.delete(note);
                return true;
            }
        }
        return false;
    }
}
