package com.studybuddy.service;

import com.studybuddy.dto.QuizRequest;
import com.studybuddy.dto.QuizSubmitRequest;
import com.studybuddy.model.Note;
import com.studybuddy.model.Quiz;
import com.studybuddy.model.User;
import com.studybuddy.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class QuizService {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private NoteService noteService;

    @Autowired
    private OllamaService ollamaService;

    @Autowired
    private ProgressService progressService;

    public Quiz generateQuiz(@NonNull User user, @NonNull QuizRequest quizRequest) {
        String contentSource = "";
        String quizTitle = "General Knowledge Quiz";

        // Fetch Note if ID is present
        if (quizRequest.getNoteId() != null) {
            Long noteId = Objects.requireNonNull(quizRequest.getNoteId(), "noteId");
            Optional<Note> noteOpt = noteService.getNoteById(noteId);
            if (noteOpt.isPresent()) {
                Note note = noteOpt.get();
                contentSource = note.getContent();
                quizTitle = "Quiz: " + note.getTitle();
            }
        } else if (quizRequest.getContent() != null && !quizRequest.getContent().trim().isEmpty()) {
            contentSource = quizRequest.getContent();
            quizTitle = "Custom Text Quiz";
        } else {
            contentSource = "General science, computer science, and logic principles.";
        }

        int count = quizRequest.getQuestionCount() != null ? quizRequest.getQuestionCount() : 5;

        // Generate MCQ questions using Ollama
        String questionsJson = ollamaService.generateQuiz(contentSource, count, null, null);

        boolean isValidJson = false;
        try {
            if (questionsJson != null && questionsJson.trim().startsWith("[")) {
                new com.fasterxml.jackson.databind.ObjectMapper().readTree(questionsJson);
                isValidJson = true;
            }
        } catch (Exception e) {
            // Ignore, will fall back
        }

        if (!isValidJson) {
            questionsJson = getDefaultMockQuestions(contentSource, count);
        }

        // Save generated quiz
        Quiz quiz = Quiz.builder()
                .title(quizTitle)
                .questions(questionsJson)
                .score(0) // 0 indicates not completed / default score
                .user(user)
                .build();

        return quizRepository.save(Objects.requireNonNull(quiz, "quiz"));
    }

    public Quiz submitQuiz(@NonNull User user, @NonNull QuizSubmitRequest submission) {
        Long quizId = Objects.requireNonNull(submission.getQuizId(), "quizId");
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found with id: " + quizId));

        if (!quiz.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: You do not own this quiz");
        }

        // Update quiz score
        quiz.setScore(submission.getScore());
        Quiz savedQuiz = quizRepository.save(quiz);

        // Update user learning progress
        long studyTime = submission.getStudyTime() != null ? submission.getStudyTime() : 5L; // default 5 minutes study time
        progressService.updateProgress(user, submission.getScore(), studyTime);

        return savedQuiz;
    }

    public List<Quiz> getQuizzesByUserId(Long userId) {
        return quizRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    private String getDefaultMockQuestions(String contentSource, int count) {
        String contentLower = contentSource.toLowerCase();
        String mockQuestionsJson;
        
        if (contentLower.contains("java") || contentLower.contains("jvm")) {
            mockQuestionsJson = "[\n" +
                    "  {\n" +
                    "    \"question\": \"Which component of the JVM executes class bytecodes and manages optimization via JIT compiler?\",\n" +
                    "    \"options\": [\"Class Loader\", \"Execution Engine\", \"Garbage Collector\", \"Method Area\"],\n" +
                    "    \"answer\": \"Execution Engine\"\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"question\": \"In Java OOP, which keyword is used to inherit a class?\",\n" +
                    "    \"options\": [\"implements\", \"inherits\", \"extends\", \"super\"],\n" +
                    "    \"answer\": \"extends\"\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"question\": \"Which of the following Java Collection interfaces allows storing key-value pairs?\",\n" +
                    "    \"options\": [\"List\", \"Set\", \"Queue\", \"Map\"],\n" +
                    "    \"answer\": \"Map\"\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"question\": \"Which of these is a Checked Exception in Java (evaluated at compile time)?\",\n" +
                    "    \"options\": [\"NullPointerException\", \"ArithmeticException\", \"IOException\", \"ArrayIndexOutOfBoundsException\"],\n" +
                    "    \"answer\": \"IOException\"\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"question\": \"Where in JVM memory are Java objects dynamically allocated?\",\n" +
                    "    \"options\": [\"JVM Stack\", \"Heap Memory\", \"Method Area\", \"PC Registers\"],\n" +
                    "    \"answer\": \"Heap Memory\"\n" +
                    "  }\n" +
                    "]";
        } else if (contentLower.contains("python") || contentLower.contains("gil")) {
            mockQuestionsJson = "[\n" +
                    "  {\n" +
                    "    \"question\": \"What is the name of the lock in Python that prevents multiple native threads from executing bytecode concurrently?\",\n" +
                    "    \"options\": [\"Global Interpreter Lock (GIL)\", \"Global Thread Lock\", \"Interpreter Mutex\", \"Process Locking Manager\"],\n" +
                    "    \"answer\": \"Global Interpreter Lock (GIL)\"\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"question\": \"Which Python data structure is immutable and declared using parentheses?\",\n" +
                    "    \"options\": [\"List\", \"Dictionary\", \"Tuple\", \"Set\"],\n" +
                    "    \"answer\": \"Tuple\"\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"question\": \"Which keyword is used in Python to return a value from a generator function lazily?\",\n" +
                    "    \"options\": [\"return\", \"yield\", \"send\", \"generate\"],\n" +
                    "    \"answer\": \"yield\"\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"question\": \"Which framework is a popular asynchronous web framework in the Python ecosystem?\",\n" +
                    "    \"options\": [\"Django\", \"Flask\", \"FastAPI\", \"React\"],\n" +
                    "    \"answer\": \"FastAPI\"\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"question\": \"How is memory management handled for unreferenced variables in Python?\",\n" +
                    "    \"options\": [\"Manual deallocation\", \"Garbage Collection & Reference Counting\", \"JVM Cleaner\", \"Pointers free()\"],\n" +
                    "    \"answer\": \"Garbage Collection & Reference Counting\"\n" +
                    "  }\n" +
                    "]";
        } else {
            mockQuestionsJson = "[\n" +
                    "  {\n" +
                    "    \"question\": \"What is the primary language used to build a Spring Boot backend?\",\n" +
                    "    \"options\": [\"Python\", \"Java\", \"C++\", \"JavaScript\"],\n" +
                    "    \"answer\": \"Java\"\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"question\": \"Which protocol is standard for secure client-server API requests?\",\n" +
                    "    \"options\": [\"FTP\", \"SMTP\", \"HTTPS\", \"DHCP\"],\n" +
                    "    \"answer\": \"HTTPS\"\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"question\": \"What does JWT stand for in modern authentication stacks?\",\n" +
                    "    \"options\": [\"Java Web Token\", \"JSON Web Token\", \"Joint Web Technology\", \"JPA Web Transaction\"],\n" +
                    "    \"answer\": \"JSON Web Token\"\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"question\": \"In a Relational Database, which key uniquely identifies a row?\",\n" +
                    "    \"options\": [\"Foreign Key\", \"Primary Key\", \"Candidate Key\", \"Super Key\"],\n" +
                    "    \"answer\": \"Primary Key\"\n" +
                    "  },\n" +
                    "  {\n" +
                    "    \"question\": \"Which structure operates on a Last In First Out (LIFO) basis?\",\n" +
                    "    \"options\": [\"Queue\", \"Stack\", \"Linked List\", \"Tree\"],\n" +
                    "    \"answer\": \"Stack\"\n" +
                    "  }\n" +
                    "]";
        }
        
        // Parse and limit count if necessary
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            List<?> list = mapper.readValue(mockQuestionsJson, List.class);
            if (list.size() > count) {
                list = list.subList(0, count);
            }
            return mapper.writeValueAsString(list);
        } catch (Exception e) {
            return mockQuestionsJson;
        }
    }
}
