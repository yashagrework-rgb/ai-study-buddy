# PPT Presentation Structure: AI Study Buddy

This document outlines the content and layout for a 15-slide project presentation.

---

### Slide 1: Title Slide
- **Slide Title:** AI Study Buddy
- **Subtitle:** An Intelligent, AI-Powered Student Learning Companion
- **Content:**
  - Full-stack Web Application integrating Generative AI
  - Presented by: [Your Name]
  - Technologies: React, Spring Boot, PostgreSQL, Gemini API

---

### Slide 2: Introduction
- **Slide Title:** Introduction
- **Content:**
  - Massive academic pressure requires structured learning guides.
  - Traditional study tools are static and do not adapt to individual notes.
  - AI Study Buddy provides a dynamic interface to convert raw notes into active learning resources.

---

### Slide 3: Problem Statement
- **Slide Title:** The Problem
- **Content:**
  - **Information Overload:** Students struggle to parse large PDF handouts.
  - **Self-Assessment Gaps:** Creating practice quizzes manually takes valuable study time.
  - **Lack of Tutoring:** Instant conceptual queries are hard to resolve outside of school hours.

---

### Slide 4: Proposed Solution
- **Slide Title:** Proposed Solution
- **Content:**
  - A responsive platform where students can:
    - Centralize and upload notes guides.
    - Generate summary reviews and custom 7-day study plans.
    - Test retention with instantly formulated multiple-choice questions.
    - Receive immediate context-aware tutoring from an AI Co-pilot.

---

### Slide 5: Project Objectives
- **Slide Title:** Project Objectives
- **Content:**
  - Implement secure user signups and JWT auth boundaries.
  - Build responsive text parsing and notes management directories.
  - Orchestrate API bridges between Spring Boot and Google Gemini models.
  - Design statistics widgets to track quiz averages and study minutes.

---

### Slide 6: System Architecture
- **Slide Title:** System Architecture Diagram
- **Content:**
  - **Frontend:** React SPA (Vite) hosted on Vercel
  - **Backend REST API:** Java Spring Boot hosted on Render
  - **Database:** PostgreSQL hosted on Neon Cloud
  - **AI Engine:** Google Gemini REST Endpoint
  - Secure communication protected via standard JWT token headers.

---

### Slide 7: Database Schema
- **Slide Title:** Database Design & Relationships
- **Content:**
  - **Users Table:** Login details, hashed passwords, roles.
  - **Notes Table:** Title, content body, file URL references, linked via Many-to-One.
  - **Quizzes Table:** Generated MCQs in JSON, final scores achieved.
  - **Progress Table:** Tracks completed counts, running averages, and durations.

---

### Slide 8: Key Features
- **Slide Title:** Core Platform Features
- **Content:**
  - **Auth:** Registration, JWT Login, Secure Session Guard.
  - **Notes:** File parser & custom editor, CRUD dashboard.
  - **Study AI:** Note summary guides, day-by-day learning timelines.
  - **Assessment:** MCQ testing page, evaluation, score submission.

---

### Slide 9: Backend Implementation
- **Slide Title:** Backend Technologies (Spring Boot)
- **Content:**
  - Spring Boot 3 framework for REST API development.
  - Spring Data JPA + Hibernate ORM for schema mappings.
  - Controller-Service-Repository architecture pattern.
  - Global error interception and JSON serialization.

---

### Slide 10: Frontend Implementation
- **Slide Title:** Frontend Technologies (React)
- **Content:**
  - Single Page Application (SPA) utilizing React Router 6.
  - Tailwind CSS for modern glassmorphism styled cards.
  - Axios interceptors for automated JWT authorization header updates.
  - Fully responsive grid overlays tailored for mobile and tablet views.

---

### Slide 11: Security & Auth Mechanism
- **Slide Title:** Security Architecture
- **Content:**
  - Password hashing utilizing the `BCryptPasswordEncoder` bean.
  - Stateless API sessions; no server-side HTTP sessions stored.
  - Interceptor filter validates token authenticity on every incoming request.
  - Protected page routes block unauthorized traffic on the frontend.

---

### Slide 12: Google Gemini AI Integration
- **Slide Title:** Gemini AI Integration & Prompt Templates
- **Content:**
  - Uses `gemini-2.5-flash` model for high-speed textual queries.
  - API payload structure: RestTemplate POST to Google API endpoints.
  - Strict system prompt guidance to guarantee standardized JSON outputs.
  - Graceful mock fallbacks to maintain system operability offline.

---

### Slide 13: Deployment Architecture
- **Slide Title:** Deployment & Infrastructure Setup
- **Content:**
  - **Database:** Serverless Neon PostgreSQL database.
  - **Backend:** Render web service built via a multi-stage `Dockerfile`.
  - **Frontend:** Vercel deployment with rewrite rules for client routing.
  - Environment variables keep API keys and DB credentials out of version control.

---

### Slide 14: Future Enhancements
- **Slide Title:** Future Project Roadmap
- **Content:**
  - Voice-to-text notes transcripts.
  - Shared study rooms for student group quizzes.
  - Gamified achievement badges and study-streak counters.
  - Integration with college LMS platforms (Canvas, Blackboard).

---

### Slide 15: Conclusion & Q&A
- **Slide Title:** Conclusion
- **Content:**
  - AI Study Buddy provides a modern, functional, and scalable prototype for educational platforms.
  - Synthesizes React, Spring Boot, Postgres, and Gemini API.
  - Thank you! Any questions?
