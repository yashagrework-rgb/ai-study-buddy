package com.studybuddy.service;

import com.studybuddy.model.Note;
import com.studybuddy.model.User;
import com.studybuddy.repository.NoteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@Service
public class NoteSeederService {

    private static final Logger logger = LoggerFactory.getLogger(NoteSeederService.class);

    @Autowired
    private ResourceLoader resourceLoader;

    @Autowired
    private NoteRepository noteRepository;

    private static final String[] SEED_FILES = {
        "java.txt", "c.txt", "cpp.txt", "python.txt", "ai.txt", "ml.txt", "dl.txt",
        "csharp.txt", "sql.txt", "dbms.txt", "os.txt", "system_design.txt", "html.txt",
        "css.txt", "javascript.txt", "react.txt", "networks.txt", "dsa.txt", "coa.txt",
        "software_engineering.txt", "toc.txt", "compiler_design.txt", "security.txt",
        "cloud.txt"
    };

    /**
     * Seeds notes for the given user from files on registration.
     * Runs inside a try-catch to avoid blocking user signup if a read error occurs.
     */
    public void seedNotesForUser(User user) {
        logger.info("Starting notes seeding process for user: {}", user.getEmail());
        
        for (String filename : SEED_FILES) {
            try {
                Resource resource = resourceLoader.getResource("classpath:seeds/" + filename);
                if (!resource.exists()) {
                    logger.warn("Seed resource file not found: {}", filename);
                    continue;
                }

                try (InputStream inputStream = resource.getInputStream();
                     BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {

                    String title = reader.readLine();
                    if (title == null || title.trim().isEmpty()) {
                        continue;
                    }

                    // Read next line. If it is a line separator (e.g. =====), skip it.
                    String nextLine = reader.readLine();
                    StringBuilder contentBuilder = new StringBuilder();
                    if (nextLine != null && !nextLine.startsWith("==")) {
                        contentBuilder.append(nextLine).append("\n");
                    }

                    String line;
                    while ((line = reader.readLine()) != null) {
                        contentBuilder.append(line).append("\n");
                    }

                    Note note = Note.builder()
                            .title(title.trim())
                            .content(contentBuilder.toString().trim())
                            .user(user)
                            .build();

                    noteRepository.save(note);
                }
            } catch (Exception e) {
                logger.error("Failed to seed note from file: " + filename, e);
            }
        }
        
        logger.info("Successfully completed seeding notes for user: {}", user.getEmail());
    }
}
