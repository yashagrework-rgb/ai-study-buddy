package com.studybuddy.dto;

public class SummaryRequest {
    private Long noteId;
    private String content; // optional

    public SummaryRequest() {}

    public SummaryRequest(Long noteId, String content) {
        this.noteId = noteId;
        this.content = content;
    }

    public Long getNoteId() { return noteId; }
    public void setNoteId(Long noteId) { this.noteId = noteId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
