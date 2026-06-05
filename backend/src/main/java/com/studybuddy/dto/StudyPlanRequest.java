package com.studybuddy.dto;

public class StudyPlanRequest {
    private Long noteId;
    private String topic; // fallback topic
    private Integer durationDays; // e.g. 7, 30

    public StudyPlanRequest() {}

    public StudyPlanRequest(Long noteId, String topic, Integer durationDays) {
        this.noteId = noteId;
        this.topic = topic;
        this.durationDays = durationDays;
    }

    public Long getNoteId() { return noteId; }
    public void setNoteId(Long noteId) { this.noteId = noteId; }
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public Integer getDurationDays() { return durationDays; }
    public void setDurationDays(Integer durationDays) { this.durationDays = durationDays; }
}
