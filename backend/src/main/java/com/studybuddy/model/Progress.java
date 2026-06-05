package com.studybuddy.model;

import jakarta.persistence.*;

@Entity
@Table(name = "progress")
public class Progress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "quizzes_completed", nullable = false)
    private Integer quizzesCompleted;

    @Column(name = "average_score", nullable = false)
    private Double averageScore;

    @Column(name = "total_study_time", nullable = false)
    private Long totalStudyTime; // in minutes

    // Constructors
    public Progress() {}

    public Progress(Long id, User user, Integer quizzesCompleted, Double averageScore, Long totalStudyTime) {
        this.id = id;
        this.user = user;
        this.quizzesCompleted = quizzesCompleted;
        this.averageScore = averageScore;
        this.totalStudyTime = totalStudyTime;
    }

    // Builder Pattern
    public static ProgressBuilder builder() {
        return new ProgressBuilder();
    }

    public static class ProgressBuilder {
        private Long id;
        private User user;
        private Integer quizzesCompleted;
        private Double averageScore;
        private Long totalStudyTime;

        public ProgressBuilder id(Long id) { this.id = id; return this; }
        public ProgressBuilder user(User user) { this.user = user; return this; }
        public ProgressBuilder quizzesCompleted(Integer quizzesCompleted) { this.quizzesCompleted = quizzesCompleted; return this; }
        public ProgressBuilder averageScore(Double averageScore) { this.averageScore = averageScore; return this; }
        public ProgressBuilder totalStudyTime(Long totalStudyTime) { this.totalStudyTime = totalStudyTime; return this; }

        public Progress build() {
            return new Progress(id, user, quizzesCompleted, averageScore, totalStudyTime);
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Integer getQuizzesCompleted() { return quizzesCompleted; }
    public void setQuizzesCompleted(Integer quizzesCompleted) { this.quizzesCompleted = quizzesCompleted; }
    public Double getAverageScore() { return averageScore; }
    public void setAverageScore(Double averageScore) { this.averageScore = averageScore; }
    public Long getTotalStudyTime() { return totalStudyTime; }
    public void setTotalStudyTime(Long totalStudyTime) { this.totalStudyTime = totalStudyTime; }
}
