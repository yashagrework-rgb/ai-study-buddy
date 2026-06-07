package com.studybuddy.service;

import java.util.*;

public class LocalAiFallback {

    public static String generateLocalSummary(String noteContent) {
        if (noteContent == null || noteContent.trim().isEmpty()) {
            return "### Note Summary\n\nNo content available to summarize.";
        }
        
        StringBuilder summary = new StringBuilder();
        summary.append("### Study Summary (Offline Local Mode)\n\n");
        
        String[] lines = noteContent.split("\n");
        int bulletCount = 0;
        boolean hasHeadings = false;
        
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;
            
            if (trimmed.startsWith("#") || trimmed.startsWith("CHAPTER") || trimmed.matches("^[0-9]+\\..*") || 
               (trimmed.length() < 50 && trimmed.toUpperCase().equals(trimmed) && trimmed.matches("^[A-Z\\s]+$"))) {
                summary.append("\n**").append(trimmed.replaceAll("#", "").trim()).append("**\n");
                bulletCount = 0;
                hasHeadings = true;
            } else if (trimmed.startsWith("-") || trimmed.startsWith("*") || trimmed.matches("^[a-z]\\).*") || trimmed.matches("^[0-9]+\\).*")) {
                if (bulletCount < 3) {
                    summary.append("  * ").append(trimmed.replaceAll("^[-*\\d\\)\\.]+", "").trim()).append("\n");
                    bulletCount++;
                }
            } else {
                if (bulletCount < 2 && trimmed.length() > 10) {
                    summary.append("  * ").append(trimmed).append("\n");
                    bulletCount++;
                }
            }
        }
        
        if (!hasHeadings) {
            summary.append("Here are the key points extracted from the text:\n\n");
            int count = 0;
            for (String line : lines) {
                if (line.trim().length() > 30) {
                    summary.append("* ").append(line.trim()).append("\n");
                    count++;
                    if (count >= 6) break;
                }
            }
        }
        
        return summary.toString();
    }

    public static String generateLocalStudyPlan(String topicOrContent, int durationDays) {
        if (topicOrContent == null || topicOrContent.trim().isEmpty()) {
            return "### Daily Study Plan\n\nNo topic context provided.";
        }
        
        List<String> topics = new ArrayList<>();
        String[] lines = topicOrContent.split("\n");
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.startsWith("#") || trimmed.startsWith("CHAPTER") || trimmed.matches("^[0-9]+\\..*") || 
               (trimmed.length() < 40 && trimmed.length() > 3 && trimmed.toUpperCase().equals(trimmed))) {
                topics.add(trimmed.replaceAll("#", "").trim());
            }
        }
        
        if (topics.isEmpty()) {
            topics.add("Core Concepts Review");
            topics.add("Detailed Terms Study");
            topics.add("Practical Exercises");
            topics.add("Mock Assessment & Review");
        }
        
        StringBuilder plan = new StringBuilder();
        plan.append("### ").append(durationDays).append("-Day Study Plan (Offline Local Mode)\n\n");
        plan.append("Here is your customized day-by-day learning schedule:\n\n");
        
        for (int day = 1; day <= durationDays; day++) {
            plan.append("📅 **Day ").append(day).append(":** ");
            int topicIdx = (day - 1) % topics.size();
            String currentTopic = topics.get(topicIdx);
            plan.append("Focus on **").append(currentTopic).append("**\n");
            plan.append("  * 📖 *Read & Highlight:* Review sections of your guide relating to ").append(currentTopic).append(".\n");
            plan.append("  * ✍️ *Active Recall:* Summarize the key formulas or design architectures in your own words.\n");
            plan.append("  * 🧪 *Practice:* Take a mock practice quiz on this specific topic.\n\n");
        }
        
        return plan.toString();
    }

    public static String generateLocalChatReply(String noteContent, String question) {
        if (noteContent == null || noteContent.trim().isEmpty()) {
            return "Hello! I am your AI Study Lounge co-pilot. (Running in offline mode). Please verify your API keys.";
        }
        
        String query = question.toLowerCase();
        String[] sentences = noteContent.split("[.!?\n]+");
        List<String> matches = new ArrayList<>();
        
        String[] queryWords = query.split("\\s+");
        for (String sentence : sentences) {
            String sentenceLower = sentence.toLowerCase();
            int matchScore = 0;
            for (String word : queryWords) {
                if (word.length() > 3 && sentenceLower.contains(word)) {
                    matchScore++;
                }
            }
            if (matchScore > 0) {
                matches.add(sentence.trim());
            }
        }
        
        if (!matches.isEmpty()) {
            StringBuilder reply = new StringBuilder();
            reply.append("🔍 **Found in your study guide (Local Match):**\n\n");
            int count = 0;
            for (String match : matches) {
                if (match.length() > 10) {
                    reply.append("> ... ").append(match).append(" ...\n\n");
                    count++;
                    if (count >= 4) break;
                }
            }
            reply.append("*(Note: I am running locally offline. The above answers are extracted directly from your study guide.)*");
            return reply.toString();
        }
        
        return "I searched your study guide for \"" + question + "\" but couldn't find any direct matches.\n\n" +
               "*(Please note that I am currently running offline. You can switch to Google Gemini in the settings and enter a valid API key to get full conversational AI answers!)*";
    }

    public static String getMockQuestionsForSubject(String title, String contentSource, int count) {
        String titleLower = (title != null ? title : "").toLowerCase();
        String contentLower = (contentSource != null ? contentSource : "").toLowerCase();

        // 1. Match by Title first (more specific and accurate)
        if (titleLower.contains("java") || titleLower.contains("csharp") || titleLower.contains("c#")) {
            return limitQuestions(getJavaQuestions(), count);
        } else if (titleLower.contains("python")) {
            return limitQuestions(getPythonQuestions(), count);
        } else if (titleLower.contains("c++") || titleLower.contains("cpp")) {
            return limitQuestions(getCppQuestions(), count);
        } else if (titleLower.contains("c programming") || titleLower.equals("c")) {
            return limitQuestions(getCQuestions(), count);
        } else if (titleLower.contains("html") || titleLower.contains("css") || titleLower.contains("javascript") || titleLower.contains("react") || titleLower.contains("web")) {
            return limitQuestions(getWebQuestions(), count);
        } else if (titleLower.contains("sql")) {
            return limitQuestions(getSqlQuestions(), count);
        } else if (titleLower.contains("dbms") || titleLower.contains("database")) {
            return limitQuestions(getDbmsQuestions(), count);
        } else if (titleLower.contains("operating system") || titleLower.contains("os ") || titleLower.equals("os") || titleLower.contains("coa") || titleLower.contains("computer organization") || titleLower.contains("architecture")) {
            return limitQuestions(getOsQuestions(), count);
        } else if (titleLower.contains("network") || titleLower.contains("security") || titleLower.contains("cryptography") || titleLower.contains("cloud") || titleLower.contains("devops")) {
            return limitQuestions(getNetworkQuestions(), count);
        } else if (titleLower.contains("dsa") || titleLower.contains("structure") || titleLower.contains("complexity") || titleLower.contains("algorithm")) {
            return limitQuestions(getDsaQuestions(), count);
        } else if (titleLower.contains("agile") || titleLower.contains("scrum") || titleLower.contains("software engineering") || titleLower.contains("system design")) {
            return limitQuestions(getAgileQuestions(), count);
        } else if (titleLower.contains("machine learning") || titleLower.contains("artificial intelligence") || titleLower.contains("deep learning") || titleLower.contains("ml") || titleLower.contains("ai") || titleLower.contains("dl")) {
            return limitQuestions(getMlQuestions(), count);
        } else if (titleLower.contains("compiler") || titleLower.contains("toc") || titleLower.contains("theory of computation") || titleLower.contains("automata")) {
            return limitQuestions(getCompilerQuestions(), count);
        }

        // 2. Fallback to Content Keywords
        if (contentLower.contains("java") || contentLower.contains("jvm")) {
            return limitQuestions(getJavaQuestions(), count);
        } else if (contentLower.contains("python") || contentLower.contains("gil")) {
            return limitQuestions(getPythonQuestions(), count);
        } else if (contentLower.contains("c++") || contentLower.contains("stl")) {
            return limitQuestions(getCppQuestions(), count);
        } else if (contentLower.contains("c programming") || contentLower.contains("malloc")) {
            return limitQuestions(getCQuestions(), count);
        } else if (contentLower.contains("html") || contentLower.contains("css") || contentLower.contains("javascript") || contentLower.contains("react")) {
            return limitQuestions(getWebQuestions(), count);
        } else if (contentLower.contains("sql") || contentLower.contains("join")) {
            return limitQuestions(getSqlQuestions(), count);
        } else if (contentLower.contains("dbms") || contentLower.contains("acid")) {
            return limitQuestions(getDbmsQuestions(), count);
        } else if (contentLower.contains("operating system") || contentLower.contains("deadlock") || contentLower.contains("coa") || contentLower.contains("computer organization")) {
            return limitQuestions(getOsQuestions(), count);
        } else if (contentLower.contains("network") || contentLower.contains("osi") || contentLower.contains("cryptography") || contentLower.contains("cloud") || contentLower.contains("devops")) {
            return limitQuestions(getNetworkQuestions(), count);
        } else if (contentLower.contains("dsa") || contentLower.contains("complexity") || contentLower.contains("algorithm")) {
            return limitQuestions(getDsaQuestions(), count);
        } else if (contentLower.contains("agile") || contentLower.contains("scrum") || contentLower.contains("system design")) {
            return limitQuestions(getAgileQuestions(), count);
        } else if (contentLower.contains("machine learning") || contentLower.contains("classification") || contentLower.contains("deep learning")) {
            return limitQuestions(getMlQuestions(), count);
        } else if (contentLower.contains("compiler") || contentLower.contains("parser") || contentLower.contains("toc") || contentLower.contains("automata")) {
            return limitQuestions(getCompilerQuestions(), count);
        }

        // 3. Absolute Fallback (General Stack)
        return limitQuestions(getDefaultQuestions(), count);
    }

    private static String limitQuestions(String json, int count) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            List<?> list = mapper.readValue(json, List.class);
            if (list.size() > count) {
                list = list.subList(0, count);
            }
            return mapper.writeValueAsString(list);
        } catch (Exception e) {
            return json;
        }
    }

    private static String getJavaQuestions() {
        return "[\n" +
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
    }

    private static String getPythonQuestions() {
        return "[\n" +
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
    }

    private static String getCQuestions() {
        return "[\n" +
                "  {\n" +
                "    \"question\": \"Which function is used in C to dynamically allocate memory on the heap without zero-initializing it?\",\n" +
                "    \"options\": [\"calloc()\", \"malloc()\", \"realloc()\", \"free()\"],\n" +
                "    \"answer\": \"malloc()\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"What holds the memory address of another variable in C?\",\n" +
                "    \"options\": [\"Array\", \"Pointer\", \"Struct\", \"Union\"],\n" +
                "    \"answer\": \"Pointer\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"In C, which struct-like structure shares the same memory space for all its members?\",\n" +
                "    \"options\": [\"Union\", \"Typedef\", \"Class\", \"Pointer struct\"],\n" +
                "    \"answer\": \"Union\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"All preprocessor directives in C begin with which symbol?\",\n" +
                "    \"options\": [\"$\", \"@\", \"#\", \"&\"],\n" +
                "    \"answer\": \"#\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"Which C standard library function is used to release heap-allocated memory blocks?\",\n" +
                "    \"options\": [\"release()\", \"free()\", \"delete()\", \"clear()\"],\n" +
                "    \"answer\": \"free()\"\n" +
                "  }\n" +
                "]";
    }

    private static String getCppQuestions() {
        return "[\n" +
                "  {\n" +
                "    \"question\": \"In C++, which component of the Standard Template Library (STL) provides pre-built dynamically-resizable array structures?\",\n" +
                "    \"options\": [\"vector\", \"list\", \"map\", \"set\"],\n" +
                "    \"answer\": \"vector\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"What is an alias for an existing variable in C++ that cannot be null or reassigned?\",\n" +
                "    \"options\": [\"Pointer\", \"Reference\", \"Template\", \"Iterator\"],\n" +
                "    \"answer\": \"Reference\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"Which operators are used for manual memory management (alloc/dealloc) in C++?\",\n" +
                "    \"options\": [\"malloc and free\", \"new and delete\", \"alloc and clear\", \"create and destroy\"],\n" +
                "    \"answer\": \"new and delete\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"Which mechanism in C++ allows writing generic functions and classes?\",\n" +
                "    \"options\": [\"Polymorphism\", \"Templates\", \"Namespaces\", \"Inheritance\"],\n" +
                "    \"answer\": \"Templates\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"What is the primary benefit of C++ Smart Pointers?\",\n" +
                "    \"options\": [\"Automatic memory deallocation via RAII\", \"Double precision compile speeds\", \"Bypassing private access controls\", \"Eliminating syntax errors\"],\n" +
                "    \"answer\": \"Automatic memory deallocation via RAII\"\n" +
                "  }\n" +
                "]";
    }

    private static String getWebQuestions() {
        return "[\n" +
                "  {\n" +
                "    \"question\": \"In web development, which CSS layout model is designed for 1-dimensional layouts (either columns or rows)?\",\n" +
                "    \"options\": [\"Flexbox\", \"CSS Grid\", \"Float\", \"Absolute positioning\"],\n" +
                "    \"answer\": \"Flexbox\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"In React, which hook is used to perform side effects in functional components?\",\n" +
                "    \"options\": [\"useState\", \"useContext\", \"useEffect\", \"useRef\"],\n" +
                "    \"answer\": \"useEffect\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"Which interface represents the full parsed HTML page hierarchy in JavaScript browser execution?\",\n" +
                "    \"options\": [\"JSON Parser\", \"Virtual Layer\", \"Document Object Model (DOM)\", \"AJAX Router\"],\n" +
                "    \"answer\": \"Document Object Model (DOM)\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"Which keyword is used to declare variables scoped to the immediate block in modern JavaScript?\",\n" +
                "    \"options\": [\"var\", \"let\", \"global\", \"static\"],\n" +
                "    \"answer\": \"let\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"Which HTML5 semantic element is most appropriate for containing the primary navigational links of a page?\",\n" +
                "    \"options\": [\"<section>\", \"<nav>\", \"<aside>\", \"<header>\"],\n" +
                "    \"answer\": \"<nav>\"\n" +
                "  }\n" +
                "]";
    }

    private static String getSqlQuestions() {
        return "[\n" +
                "  {\n" +
                "    \"question\": \"Which SQL command type covers data structure actions like CREATE, ALTER, and DROP?\",\n" +
                "    \"options\": [\"DML\", \"DDL\", \"DCL\", \"TCL\"],\n" +
                "    \"answer\": \"DDL\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"Which SQL Join combines all rows from the left table and matched rows from the right table?\",\n" +
                "    \"options\": [\"INNER JOIN\", \"LEFT JOIN\", \"RIGHT JOIN\", \"FULL OUTER JOIN\"],\n" +
                "    \"answer\": \"LEFT JOIN\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"What clause is used in SQL queries to filter groups after an aggregation function has been run?\",\n" +
                "    \"options\": [\"WHERE\", \"HAVING\", \"GROUP BY\", \"ORDER BY\"],\n" +
                "    \"answer\": \"HAVING\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"Which index type is most commonly used in RDBMS to speed up matching column range queries?\",\n" +
                "    \"options\": [\"B-Tree Index\", \"Hash Index\", \"Spatial Index\", \"Bitmap Index\"],\n" +
                "    \"answer\": \"B-Tree Index\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"Which keyword is used to permanently save transaction database changes in SQL?\",\n" +
                "    \"options\": [\"SAVEPOINT\", \"ROLLBACK\", \"COMMIT\", \"SET STATUS\"],\n" +
                "    \"answer\": \"COMMIT\"\n" +
                "  }\n" +
                "]";
    }

    private static String getDbmsQuestions() {
        return "[\n" +
                "  {\n" +
                "    \"question\": \"What does the 'A' in ACID transaction properties stand for?\",\n" +
                "    \"options\": [\"Atomicity\", \"Association\", \"Authentication\", \"Algorithm\"],\n" +
                "    \"answer\": \"Atomicity\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"Which database normalization form focuses on removing transitive functional dependencies?\",\n" +
                "    \"options\": [\"1NF\", \"2NF\", \"3NF\", \"Boyce-Codd Normal Form\"],\n" +
                "    \"answer\": \"3NF\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"What type of database key enforces referential integrity between two tables?\",\n" +
                "    \"options\": [\"Primary Key\", \"Foreign Key\", \"Candidate Key\", \"Super Key\"],\n" +
                "    \"answer\": \"Foreign Key\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"Which concurrency control protocol splits lock management into a growing phase and a shrinking phase?\",\n" +
                "    \"options\": [\"Time-stamping\", \"Two-Phase Locking (2PL)\", \"Validation Protocol\", \"Shared locking\"],\n" +
                "    \"answer\": \"Two-Phase Locking (2PL)\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"Which transaction property ensures that changes are permanently saved and not lost even in a system crash?\",\n" +
                "    \"options\": [\"Durability\", \"Consistency\", \"Isolation\", \"Atomicity\"],\n" +
                "    \"answer\": \"Durability\"\n" +
                "  }\n" +
                "]";
    }

    private static String getOsQuestions() {
        return "[\n" +
                "  {\n" +
                "    \"question\": \"Which scheduling algorithm executes CPU processes in a cyclical time-slice sequence?\",\n" +
                "    \"options\": [\"First In First Out (FIFO)\", \"Round Robin\", \"Shortest Job First (SJF)\", \"Priority Scheduling\"],\n" +
                "    \"answer\": \"Round Robin\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"Which algorithmic method is used to avoid deadlocks by dynamically checking resource allocations?\",\n" +
                "    \"options\": [\"Dijkstra's Algorithm\", \"Kruskal's Algorithm\", \"Banker's Algorithm\", \"Round Robin Scheduling\"],\n" +
                "    \"answer\": \"Banker's Algorithm\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"What state occurs when threads or processes are blocked indefinitely waiting for resources held by each other?\",\n" +
                "    \"options\": [\"Race Condition\", \"Deadlock\", \"Segmentation Fault\", \"Page Fault\"],\n" +
                "    \"answer\": \"Deadlock\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"Which memory management scheme divides virtual memory into fixed-size blocks?\",\n" +
                "    \"options\": [\"Paging\", \"Segmentation\", \"Virtual allocation\", \"Swapping\"],\n" +
                "    \"answer\": \"Paging\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"What is the smallest schedulable unit of CPU execution inside a process that shares memory resources?\",\n" +
                "    \"options\": [\"Daemon\", \"Thread\", \"Semaphore\", \"Subprocess\"],\n" +
                "    \"answer\": \"Thread\"\n" +
                "  }\n" +
                "]";
    }

    private static String getNetworkQuestions() {
        return "[\n" +
                "  {\n" +
                "    \"question\": \"Which layer of the OSI model handles packet routing, IP addressing, and path determination?\",\n" +
                "    \"options\": [\"Physical Layer\", \"Data Link Layer\", \"Network Layer\", \"Transport Layer\"],\n" +
                "    \"answer\": \"Network Layer\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"Which Transport layer protocol is connectionless and fast, commonly used for DNS queries and video streams?\",\n" +
                "    \"options\": [\"TCP\", \"UDP\", \"FTP\", \"HTTP\"],\n" +
                "    \"answer\": \"UDP\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"Which protocol is responsible for resolving domain names like 'google.com' into IP addresses?\",\n" +
                "    \"options\": [\"DHCP\", \"DNS\", \"ARP\", \"BGP\"],\n" +
                "    \"answer\": \"DNS\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"How many bits make up an IPv4 address?\",\n" +
                "    \"options\": [\"16 bits\", \"32 bits\", \"64 bits\", \"128 bits\"],\n" +
                "    \"answer\": \"32 bits\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"Which protocol resolves a known Network layer IP address to a physical hardware MAC address?\",\n" +
                "    \"options\": [\"DNS\", \"DHCP\", \"ARP\", \"ICMP\"],\n" +
                "    \"answer\": \"ARP\"\n" +
                "  }\n" +
                "]";
    }

    private static String getDsaQuestions() {
        return "[\n" +
                "  {\n" +
                "    \"question\": \"What is the average time complexity of searching a value in a balanced Binary Search Tree (BST)?\",\n" +
                "    \"options\": [\"O(1)\", \"O(log N)\", \"O(N)\", \"O(N log N)\"],\n" +
                "    \"answer\": \"O(log N)\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"Which linear data structure operates on a Last In First Out (LIFO) execution stack basis?\",\n" +
                "    \"options\": [\"Queue\", \"Stack\", \"Linked List\", \"Binary Tree\"],\n" +
                "    \"answer\": \"Stack\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"Which sorting algorithm splits an array in half, recursively sorts each half, and merges them back (O(N log N) time)?\",\n" +
                "    \"options\": [\"Bubble Sort\", \"Quick Sort\", \"Merge Sort\", \"Insertion Sort\"],\n" +
                "    \"answer\": \"Merge Sort\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"Which traversal algorithm uses a Queue structure to traverse graphs layer-by-layer to find the shortest path?\",\n" +
                "    \"options\": [\"Breadth-First Search (BFS)\", \"Depth-First Search (DFS)\", \"In-order traversal\", \"Post-order traversal\"],\n" +
                "    \"answer\": \"Breadth-First Search (BFS)\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"What is the worst-case time complexity of sorting an array using Quick Sort?\",\n" +
                "    \"options\": [\"O(N)\", \"O(N log N)\", \"O(N^2)\", \"O(2^N)\"],\n" +
                "    \"answer\": \"O(N^2)\"\n" +
                "  }\n" +
                "]";
    }

    private static String getAgileQuestions() {
        return "[\n" +
                "  {\n" +
                "    \"question\": \"In Agile Scrum, what is the role responsible for defining backlog items and prioritizing features?\",\n" +
                "    \"options\": [\"Scrum Master\", \"Product Owner\", \"Developer\", \"Project Manager\"],\n" +
                "    \"answer\": \"Product Owner\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"Which testing type focuses on verifying the interfaces and communication between integrated modules?\",\n" +
                "    \"options\": [\"Unit Testing\", \"Integration Testing\", \"System Testing\", \"Acceptance Testing\"],\n" +
                "    \"answer\": \"Integration Testing\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"What is the standard duration of a Sprint in the Scrum methodology?\",\n" +
                "    \"options\": [\"1 to 2 days\", \"2 to 4 weeks\", \"6 months\", \"1 year\"],\n" +
                "    \"answer\": \"2 to 4 weeks\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"Which software model is a linear, sequential development approach with strict reviews?\",\n" +
                "    \"options\": [\"Waterfall Model\", \"Spiral Model\", \"Agile Model\", \"Scrum\"],\n" +
                "    \"answer\": \"Waterfall Model\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"What is a daily ceremony in Scrum to align the development team and check blockers?\",\n" +
                "    \"options\": [\"Sprint Planning\", \"Daily Standup\", \"Sprint Review\", \"Retrospective\"],\n" +
                "    \"answer\": \"Daily Standup\"\n" +
                "  }\n" +
                "]";
    }

    private static String getMlQuestions() {
        return "[\n" +
                "  {\n" +
                "    \"question\": \"Which algorithm is a supervised learning method used for classification based on the majority vote of nearest points?\",\n" +
                "    \"options\": [\"K-Means\", \"K-Nearest Neighbors (KNN)\", \"Linear Regression\", \"Apriori\"],\n" +
                "    \"answer\": \"K-Nearest Neighbors (KNN)\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"What function is commonly used in binary classification to map outputs to probabilities between 0 and 1?\",\n" +
                "    \"options\": [\"ReLU\", \"Sigmoid Function\", \"Tanh\", \"Softmax\"],\n" +
                "    \"answer\": \"Sigmoid Function\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"What is the phenomenon where a model learns training data noise and performs poorly on unseen test data?\",\n" +
                "    \"options\": [\"Underfitting\", \"Overfitting\", \"Regularization\", \"Normalization\"],\n" +
                "    \"answer\": \"Overfitting\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"Which optimization algorithm is standard for minimizing loss functions in neural network training?\",\n" +
                "    \"options\": [\"Gradient Descent\", \"Binary Search\", \"Kruskal's Algorithm\", \"A* Search\"],\n" +
                "    \"answer\": \"Gradient Descent\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"What type of neural network is widely used for processing grid-structured data like images?\",\n" +
                "    \"options\": [\"Recurrent Neural Network (RNN)\", \"Convolutional Neural Network (CNN)\", \"Transformer\", \"Feedforward Net\"],\n" +
                "    \"answer\": \"Convolutional Neural Network (CNN)\"\n" +
                "  }\n" +
                "]";
    }

    private static String getCompilerQuestions() {
        return "[\n" +
                "  {\n" +
                "    \"question\": \"Which phase of a compiler performs lexical analysis, grouping characters into tokens?\",\n" +
                "    \"options\": [\"Lexer (Lexical Analyzer)\", \"Parser (Syntax Analyzer)\", \"Semantic Analyzer\", \"Code Generator\"],\n" +
                "    \"answer\": \"Lexer (Lexical Analyzer)\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"What grammar type is commonly used to describe the syntax structure of programming languages?\",\n" +
                "    \"options\": [\"Regular Grammar\", \"Context-Free Grammar (CFG)\", \"Context-Sensitive Grammar\", \"Unrestricted Grammar\"],\n" +
                "    \"answer\": \"Context-Free Grammar (CFG)\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"Which machine is used to recognize languages generated by Context-Free Grammars?\",\n" +
                "    \"options\": [\"Finite Automata\", \"Pushdown Automata (PDA)\", \"Turing Machine\", \"Linear Bounded Automata\"],\n" +
                "    \"answer\": \"Pushdown Automata (PDA)\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"What parser type builds the parse tree starting from the leaves up to the start symbol?\",\n" +
                "    \"options\": [\"Top-down Parser\", \"Bottom-up Parser\", \"Recursive Descent Parser\", \"LL(1) Parser\"],\n" +
                "    \"answer\": \"Bottom-up Parser\"\n" +
                "  },\n" +
                "  {\n" +
                "    \"question\": \"Which phase of a compiler checks for type compatibility and semantic correctness?\",\n" +
                "    \"options\": [\"Lexical Analyzer\", \"Syntax Analyzer\", \"Semantic Analyzer\", \"Code Optimizer\"],\n" +
                "    \"answer\": \"Semantic Analyzer\"\n" +
                "  }\n" +
                "]";
    }

    private static String getDefaultQuestions() {
        return "[\n" +
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
}
