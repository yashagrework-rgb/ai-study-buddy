package com.studybuddy.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "notes")
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "file_url")
    private String fileUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public Note() {}

    public Note(Long id, String title, String content, String fileUrl, User user, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.fileUrl = fileUrl;
        this.user = user;
        this.createdAt = createdAt;
    }

    // Builder Pattern
    public static NoteBuilder builder() {
        return new NoteBuilder();
    }

    public static class NoteBuilder {
        private Long id;
        private String title;
        private String content;
        private String fileUrl;
        private User user;
        private LocalDateTime createdAt;

        public NoteBuilder id(Long id) { this.id = id; return this; }
        public NoteBuilder title(String title) { this.title = title; return this; }
        public NoteBuilder content(String content) { this.content = content; return this; }
        public NoteBuilder fileUrl(String fileUrl) { this.fileUrl = fileUrl; return this; }
        public NoteBuilder user(User user) { this.user = user; return this; }
        public NoteBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Note build() {
            return new Note(id, title, content, fileUrl, user, createdAt);
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
