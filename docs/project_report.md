# Major Project Report: AI Study Buddy

## Abstract
The **AI Study Buddy** is a modern, responsive web application designed to act as an intelligent learning partner for students. Built with a robust full-stack architecture comprising a React.js (Vite) frontend, a Java Spring Boot backend, a PostgreSQL database, and Google's Gemini API, the platform provides automated summary drafting, contextual chatting on note guides, MCQ quiz generation, and student performance metrics. This application aims to improve learning retention, reduce time spent creating study guides, and deliver a personalized, structured learning dashboard.

---

## 1. Introduction
With the rapid increase in academic workloads and digital learning materials, students face challenges in organizing study notes, assessing their knowledge, and seeking immediate conceptual explanations outside class hours. Traditional study tools are often passive, requiring students to manually summarize textbooks or design flashcards. 

AI Study Buddy solves this issue by leveraging Generative AI. It reads uploaded lecture documents or copy-pasted notes, synthesizes key terms, generates custom practice assessments, and answers user questions directly related to their notes, creating a dynamic, self-paced learning loop.

---

## 2. Objectives
1. **Automate Document Comprehension:** Provide immediate summary generation and study scheduling based on student-supplied guides.
2. **Context-Aware Assistance:** Implement a chat interface where the AI refers to specific note contents to explain concepts.
3. **Automated Assessment:** Generate MCQ quizzes directly from note files and calculate scores upon submission.
4. **Progress Analytics:** Record scores and time spent on quizzes to show historical charts and statistics.
5. **Secure User Boundaries:** Protect student profiles and data using Spring Security with stateless JWT tokens.

---

## 3. Scope
The application is scoped for individual students seeking a centralized dashboard to track their learning targets. It handles text extraction from typed notes and files up to 10MB, communicates with the Gemini API to formulate responses, and saves user states securely. The system is designed to scale to multi-tenant educational portals and integrates seamlessly with cloud environments.

---

## 4. Technologies Used
- **Frontend Framework:** React.js 18 (Vite build engine)
- **Styling Layer:** Tailwind CSS 3 (curated theme configurations, responsive grids)
- **Icons & Visuals:** Lucide React
- **API Communication:** Axios (interceptor pattern for JWT validation)
- **Backend Framework:** Java Spring Boot 3.3.0
- **Security Protocols:** Spring Security 6, JJWT (JWT generation & decryption)
- **Persistence Layer:** Spring Data JPA, Hibernate ORM
- **Database Engine:** PostgreSQL (Neon Cloud DB in production, local H2 in development)
- **AI Core:** Google Gemini API (gemini-2.5-flash)
- **Containerization:** Docker

---

## 5. System Architecture
The application follows a classic three-tier architecture:

```
+-------------------------------------------------------------+
|                     Presentation Tier                       |
|           React.js SPA (Vite) - Deployed on Vercel          |
+------------------------------+------------------------------+
                               |
                        HTTPS (REST + JWT)
                               |
                               v
+-------------------------------------------------------------+
|                     Application Tier                        |
|        Java Spring Boot Web API - Deployed on Render        |
+-------------------+--------------------+--------------------+
                    |                    |
             JDBC / Hibernate      HTTP / JSON
                    |                    |
                    v                    v
+-----------------------+    +-----------------------+
|    Database Tier      |    |        AI Tier        |
| Neon Cloud PostgreSQL |    |   Google Gemini API   |
+-----------------------+    +-----------------------+
```

### System Architecture Flow:
1. **Auth Phase:** User logs in, backend generates a JWT token, and the frontend stores it in localStorage.
2. **Request Phase:** Frontend sends requests with `Authorization: Bearer <token>`. Spring Security intercepts, verifies the JWT, and loads the user context.
3. **AI Generation Phase:** When a user requests a quiz, chat, or summary, the Spring controller fetches note details, formats the prompt template, and calls the Google Gemini REST API.
4. **Result Storage Phase:** Quiz scores and study durations are saved to PostgreSQL via Spring Data JPA, updating the user's progress records.

---

## 6. Database Design
The schema consists of four tables with foreign key relationships linked to the `users` table:

```
  +--------------------------------+
  |             users              |
  +--------------------------------+
  | id (PK) - BIGINT SERIAL        |
  | name - VARCHAR                 |
  | email (UQ) - VARCHAR           |
  | password - VARCHAR             |
  | role - VARCHAR                 |
  | created_at - TIMESTAMP         |
  +---------------+----------------+
                  |
         +--------+--------+
         |                 |
         v                 v
  +----------------+  +----------------+
  |     notes      |  |    quizzes     |
  +----------------+  +----------------+
  | id (PK)        |  | id (PK)        |
  | title          |  | title          |
  | content        |  | questions(JSON)|
  | file_url       |  | score          |
  | user_id (FK)   |  | user_id (FK)   |
  | created_at     |  | created_at     |
  +----------------+  +----------------+
         |                 |
         +--------+--------+
                  |
                  v
  +--------------------------------+
  |            progress            |
  +--------------------------------+
  | id (PK) - BIGINT SERIAL        |
  | user_id (FK, UQ) - BIGINT      |
  | quizzes_completed - INT        |
  | average_score - DOUBLE         |
  | total_study_time - BIGINT      |
  +--------------------------------+
```

---

## 7. Implementation Details
The backend source code is modularized into discrete controllers, models, and services. The JWT filter runs before standard security filters. Prompt engineering is used in the `GeminiService` class to ensure structured JSON outputs for quizzes and markdown layouts for summaries. The frontend handles API calls using an Axios client and manages user sessions with React hooks.

---

## 8. Results
- **Seamless Setup:** Complete setup can be run in seconds using local file H2 fallbacks and Vite dev servers.
- **AI-Powered Assessments:** Dynamic, contextual multiple-choice quiz questions generated on-demand.
- **Accurate Progression Charts:** SVG line plots visualize improvements in exam score tracking.
- **Responsive Theme:** Modern, glassmorphism dark-mode UI that works on mobile and desktop.

---

## 9. Future Scope
1. **Collaborative Study Rooms:** Allow multiple students to join a room, share notes, and test each other.
2. **Audio/Video Note Parsing:** Expand upload parsing to support transcript generation from lectures and videos.
3. **Gamification Achievements:** Introduce study badges and leaderboard standings.

---

## 10. Conclusion
The AI Study Buddy application demonstrates the integration of modern cloud stacks and Generative AI to solve educational challenges. Combining React, Spring Boot, PostgreSQL, and Google Gemini API, this application serves as a production-ready template for web development.
