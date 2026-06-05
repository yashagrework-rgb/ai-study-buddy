package com.studybuddy.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "quizzes")
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String questions;

    @Column(nullable = false)
    private Integer score; // Max/achieved score or general score

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public Quiz() {}

    public Quiz(Long id, String title, String questions, Integer score, User user, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.questions = questions;
        this.score = score;
        this.user = user;
        this.createdAt = createdAt;
    }

    // Builder Pattern
    public static QuizBuilder builder() {
        return new QuizBuilder();
    }

    public static class QuizBuilder {
        private Long id;
        private String title;
        private String questions;
        private Integer score;
        private User user;
        private LocalDateTime createdAt;

        public QuizBuilder id(Long id) { this.id = id; return this; }
        public QuizBuilder title(String title) { this.title = title; return this; }
        public QuizBuilder questions(String questions) { this.questions = questions; return this; }
        public QuizBuilder score(Integer score) { this.score = score; return this; }
        public QuizBuilder user(User user) { this.user = user; return this; }
        public QuizBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Quiz build() {
            return new Quiz(id, title, questions, score, user, createdAt);
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getQuestions() { return questions; }
    public void setQuestions(String questions) { this.questions = questions; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
