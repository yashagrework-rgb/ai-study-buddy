package com.studybuddy.dto;

public class JwtResponse {
    private String token;
    private final String type = "Bearer";
    private Long id;
    private String name;
    private String email;
    private String role;
    private String geminiApiKey;
    private String openAiApiKey;

    public JwtResponse() {}

    public JwtResponse(String token, Long id, String name, String email, String role, String geminiApiKey, String openAiApiKey) {
        this.token = token;
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.geminiApiKey = geminiApiKey;
        this.openAiApiKey = openAiApiKey;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getType() { return type; }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getGeminiApiKey() { return geminiApiKey; }
    public void setGeminiApiKey(String geminiApiKey) { this.geminiApiKey = geminiApiKey; }
    public String getOpenAiApiKey() { return openAiApiKey; }
    public void setOpenAiApiKey(String openAiApiKey) { this.openAiApiKey = openAiApiKey; }
}
