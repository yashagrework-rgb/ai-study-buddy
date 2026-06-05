package com.studybuddy.dto;

public class QuizSubmitRequest {
    private Long quizId;
    private Integer score;
    private Long studyTime; // in minutes to add

    public QuizSubmitRequest() {}

    public QuizSubmitRequest(Long quizId, Integer score, Long studyTime) {
        this.quizId = quizId;
        this.score = score;
        this.studyTime = studyTime;
    }

    public Long getQuizId() { return quizId; }
    public void setQuizId(Long quizId) { this.quizId = quizId; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public Long getStudyTime() { return studyTime; }
    public void setStudyTime(Long studyTime) { this.studyTime = studyTime; }
}
