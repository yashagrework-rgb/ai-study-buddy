package com.studybuddy.dto;

import jakarta.validation.constraints.NotBlank;

public class NoteRequest {
    @NotBlank
    private String title;

    private String content;
    private String fileUrl;

    public NoteRequest() {}

    public NoteRequest(String title, String content, String fileUrl) {
        this.title = title;
        this.content = content;
        this.fileUrl = fileUrl;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
}
