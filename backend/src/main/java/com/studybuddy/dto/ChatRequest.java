package com.studybuddy.dto;

public class ChatRequest {
    private String message;
    private Long noteId;
    private String content; // optional context

    public ChatRequest() {}

    public ChatRequest(String message, Long noteId, String content) {
        this.message = message;
        this.noteId = noteId;
        this.content = content;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Long getNoteId() { return noteId; }
    public void setNoteId(Long noteId) { this.noteId = noteId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
