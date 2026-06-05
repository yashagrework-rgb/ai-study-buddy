# AI Study Buddy

An AI-powered web platform where students can upload study guides, ask context-aware questions, generate summaries, create dynamic MCQ quizzes, and track learning achievements.

---

## Technical Stack
- **Frontend:** React.js (Vite), Tailwind CSS, Axios, React Router, Lucide Icons
- **Backend:** Java Spring Boot, Spring Security, JWT Auth, Hibernate, Maven
- **Database:** PostgreSQL (Neon Cloud DB in production, H2 local database in development)
- **AI Core:** Google Gemini API (`gemini-2.5-flash`)

---

## Directory Structure
```
AI Study Buddy/
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/studybuddy/
│   │       │   ├── config/             # Security & Exception configurations
│   │       │   ├── controller/         # REST Controllers (Auth, Notes, AI, Quiz, Progress)
│   │       │   ├── dto/                # Request & Response Data Transfer Objects
│   │       │   ├── model/              # Database entities (User, Note, Quiz, Progress)
│   │       │   ├── repository/         # JPA Spring Data Repositories
│   │       │   ├── security/           # JWT Utils & Filters
│   │       │   └── service/            # Core business logic & Gemini integrations
│   │       └── resources/
│   │           └── application.properties # Server properties & local H2 default fallback
│   ├── Dockerfile                      # Multistage docker build
│   └── pom.xml                         # Maven dependencies
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── pages/                      # SPA Pages (Landing, Dashboard, Notes, Chat, Quiz, etc.)
│   │   ├── services/
│   │   │   └── api.js                  # Axios client configuration with JWT injection
│   │   ├── App.jsx                     # Layout shell and Router mapping
│   │   ├── index.css                   # Custom styles, animations, & glassmorphic classes
│   │   └── main.jsx                    # React bootstrap
│   ├── index.html                      # HTML entrypoint with font imports
│   ├── tailwind.config.js              # Theme customization
│   ├── postcss.config.js               
│   ├── vite.config.js                  # React build hooks & backend proxies
│   └── vercel.json                     # Vercel configuration for SPA router fallbacks
├── docs/                               # Project Documentation
│   ├── project_report.md               # Major Project Report
│   ├── resume_description.md           # Professional CV description bullet points
│   ├── viva_questions.md               # Interview & Viva Q&A
│   └── ppt_slides.md                   # 15 structured presentation slides outline
└── .gitignore                          # Clean repository ignoring files & target directories
```

---

## Step-by-Step Setup & Running Locally

### Prerequisites
- **Java JDK 17** or higher
- **Node.js** (v18 or higher) & **npm**
- **Maven** (optional, you can compile from IDE or command terminal)
- **Google Gemini API Key** (Get it from [Google AI Studio](https://aistudio.google.com/))

---

### 1. Running the Backend
By default, the backend will run using a local H2 file database if no environment variables are provided. This allows instant setup without installing PostgreSQL locally.

1. Open a command prompt inside the `backend/` directory.
2. Build the project using Maven:
   ```bash
   mvn clean install
   ```
3. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   *The server will start on port `8080`.*
   *H2 console is available locally at: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:file:./data/studybuddy`, Username: `sa`, Password: ``)*

4. **Configuring Gemini Key & Production Database (Optional):**
   Set the following environment variables in your terminal or IDE before running:
   ```bash
   # Linux/macOS
   export GEMINI_API_KEY="your_api_key_here"
   export DATABASE_URL="jdbc:postgresql://your-neon-db-url"
   export DATABASE_USERNAME="your-username"
   export DATABASE_PASSWORD="your-password"
   export DATABASE_DRIVER="org.postgresql.Driver"
   export DATABASE_DIALECT="org.hibernate.dialect.PostgreSQLDialect"

   # Windows (CMD)
   set GEMINI_API_KEY=your_api_key_here
   ...
   ```

---

### 2. Running the Frontend

1. Open a command prompt inside the `frontend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite developer server:
   ```bash
   npm run dev
   ```
   *The React app will open on `http://localhost:5173/`.*
   *All API requests to `/api` are automatically proxied to the backend on port `8080`.*

---

## Deployment Instructions

### A. Frontend (Vercel)
1. Commit the project to your GitHub repository.
2. Link your repository inside your Vercel Dashboard.
3. Configure the following:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add the Environment Variable `VITE_API_URL` pointing to your deployed backend URL.
5. Deploy. (The `vercel.json` file ensures that all React Router pages route correctly on page refresh).

### B. Backend (Render)
1. Create a new **Web Service** on Render.
2. Connect your GitHub repository.
3. Configure settings:
   - **Root Directory:** `backend`
   - **Runtime:** `Docker` (Render will automatically detect the `Dockerfile` and compile the multistage build)
4. Add the following Environment Variables on Render under the settings tab:
   - `JWT_SECRET`: A long random base64-encoded string.
   - `GEMINI_API_KEY`: Your live key from Google AI Studio.
   - `DATABASE_URL`: Connection string from Neon PostgreSQL.
   - `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_DRIVER`, `DATABASE_DIALECT`: Configured for Postgres database.
5. Deploy.

### C. Database (Neon PostgreSQL)
1. Sign up on [Neon.tech](https://neon.tech/) and spin up a free PostgreSQL database.
2. Copy the JDBC connection details and paste them into the Render Environment Variables tab. The tables will be auto-generated on startup by Hibernate (`spring.jpa.hibernate.ddl-auto=update`).
