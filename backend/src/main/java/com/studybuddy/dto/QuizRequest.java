package com.studybuddy.dto;

public class QuizRequest {
    private Long noteId;
    private String content; // fallback if noteId not selected
    private Integer questionCount; // e.g. 5, 10

    public QuizRequest() {}

    public QuizRequest(Long noteId, String content, Integer questionCount) {
        this.noteId = noteId;
        this.content = content;
        this.questionCount = questionCount;
    }

    public Long getNoteId() { return noteId; }
    public void setNoteId(Long noteId) { this.noteId = noteId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Integer getQuestionCount() { return questionCount; }
    public void setQuestionCount(Integer questionCount) { this.questionCount = questionCount; }
}
