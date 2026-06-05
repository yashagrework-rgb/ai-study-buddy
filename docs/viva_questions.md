# Viva Questions and Answers: AI Study Buddy

This guide contains the most common viva, project defense, and technical interview questions related to the AI Study Buddy application.

---

### Q1: What is the high-level architecture of your project?
**Answer:** The project follows a three-tier architecture:
- **Presentation Layer (Frontend):** React.js (built with Vite) styled with Tailwind CSS, communicating with the backend via RESTful APIs using Axios.
- **Application Layer (Backend):** Java Spring Boot which processes business logic, manages security rules, and makes REST queries to the Gemini API.
- **Database Layer (Persistence):** PostgreSQL (Neon Cloud DB in production, H2 local files in development) managed using Spring Data JPA / Hibernate.

---

### Q2: How did you implement user authentication and authorization?
**Answer:** We implemented token-based authentication using **Spring Security** and **JWT (JSON Web Tokens)**:
1. When a user registers, their password is encrypted using a `BCryptPasswordEncoder` bean and saved in the database.
2. During login, the `AuthenticationManager` authenticates the credentials.
3. Upon success, a JWT is signed using a HMAC-256 algorithm with a private key.
4. The client receives this token and stores it in `localStorage`.
5. On subsequent API calls, an Axios request interceptor attaches the JWT to the `Authorization` header as a `Bearer` token.
6. The backend intercept filter (`AuthTokenFilter`) extracts, decrypts, and validates the token before passing the request to the controllers.

---

### Q3: How does the AI quiz generation work? How do you ensure the response is in JSON?
**Answer:** We communicate with Google's **Gemini API** via the `gemini-2.5-flash` model. 
1. We construct a prompt template containing the note contents.
2. In the prompt instructions, we explicitly request Gemini to output *only* a valid, raw JSON array of objects conforming to a specific schema (with fields: `question`, `options`, and `answer`).
3. We instruct the model to avoid wrapping the output in markdown code blocks (e.g. ` ```json `).
4. As a fail-safe, the backend service runs a `cleanJsonString` method to strip out any markdown wraps if they are returned, ensuring that Jackson or the frontend can parse the string successfully.

---

### Q4: How is the learning progress calculated and saved?
**Answer:** We have a `Progress` table linked to the `users` table via a One-to-One relationship.
- When a user submits a completed quiz (`POST /api/quiz/submit`), the backend:
  1. Updates the individual `Quiz` record with the student's score.
  2. Increments the `quizzesCompleted` count.
  3. Re-calculates the running `averageScore` using the formula: `((currentAverage * currentCount) + newScore) / (currentCount + 1)`.
  4. Increments the `totalStudyTime` by adding minutes (approximated based on the number of questions answered).
  5. Persists the updated progress record.

---

### Q5: Why did you choose Vite over Create React App (CRA)?
**Answer:** Vite offers significant performance advantages over CRA:
- Vite uses **Esbuild** (written in Go) to pre-bundle dependencies, which is 10-100x faster than Webpack.
- It provides native ES modules (ESM) support during development, which means file edits (HMR - Hot Module Replacement) update almost instantly, regardless of the application size.
- Vite uses Rollup for clean, optimized production builds.

---

### Q6: How do you handle CORS (Cross-Origin Resource Sharing) between React and Spring Boot?
**Answer:** 
- In **development**, Vite is configured with a dev server proxy. Any requests sent to `/api` are automatically proxied to the backend at `http://localhost:8080`, bypassing browser CORS blockages because the server makes the request rather than the browser.
- In **production/backend**, we configure global CORS settings on our `WebSecurityConfig` class. We register a `CorsConfigurationSource` bean that allows specified headers (`Authorization`, `Content-Type`), methods (`GET`, `POST`, `DELETE`, etc.), and credential allowances.

---

### Q7: What is the purpose of JPA and Hibernate in the project?
**Answer:** 
- **JPA (Java Persistence API)** is a specification that defines standard Object-Relational Mapping (ORM) rules for Java applications.
- **Hibernate** is the actual ORM provider/implementation used by Spring Boot to map Java classes (Entities) to relational database tables. It auto-generates SQL queries, handles transactions, and manages entity life cycles, reducing the amount of raw JDBC code we have to write.
