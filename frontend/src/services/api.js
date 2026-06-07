import axios from 'axios';

// Toggle this flag to run the app completely standalone inside the browser (localStorage)
// Set to false to connect to the Spring Boot backend server on port 8080.
const USE_LOCAL_MOCK = false;

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// If using the real backend, inject JWT token and handle 401 redirects
if (!USE_LOCAL_MOCK) {
  api.interceptors.request.use(
    (config) => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && user.token) {
            config.headers['Authorization'] = `Bearer ${user.token}`;
          }
        } catch (e) {
          console.error('Error parsing auth token', e);
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
          window.location.href = '/login?expired=true';
        }
      }
      return Promise.reject(error);
    }
  );
} else {
  // ==========================================
  // STANDALONE LOCAL MOCK ENGINE FOR PRESENTATION
  // ==========================================
  
  // Helper to simulate network latency
  const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

  // Direct Browser-to-Gemini API Connector
  const callRealGeminiDirectly = async (prompt) => {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey || apiKey.trim() === '') {
      return null; // Fallback to offline mock answers
    }
    const model = localStorage.getItem('gemini_model') || 'models/gemini-1.5-flash';
    try {
      const url = `/gemini-api/v1/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      };
      
      const res = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty response from Gemini API");
      return text;
    } catch (err) {
      console.error("Error calling Gemini API directly from browser:", err);
      throw new Error("Gemini API Error: " + (err.response?.data?.error?.message || err.message));
    }
  };

  const cleanJsonString = (rawJson) => {
    if (!rawJson) return "[]";
    let cleaned = rawJson.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replaceAll(/^```(json)?/g, "");
      cleaned = cleaned.replaceAll(/```$/g, "");
    }
    return cleaned.trim();
  };

  // Initialize localStorage data if empty
  const initMockDatabase = () => {
    if (!localStorage.getItem('mock_users')) {
      localStorage.setItem('mock_users', JSON.stringify([]));
    }
    if (!localStorage.getItem('mock_notes')) {
      const defaultNotes = [
        {
          id: 300,
          title: "Ultimate Computer Science Reference Handbook (Chapters 1-9)",
          content: `======================================================================
UNIVERSITY OF COMPUTER SCIENCE AND ENGINEERING
COURSES: CS101 - CS404 UNIFIED STUDENT SYLLABUS REFERENCE HANDBOOK
COMPILED BY: DEPARTMENT OF SOFTWARE ARCHITECTURE AND ENGINEERING
======================================================================

CHAPTER 1: SOFTWARE ENGINEERING & AGILE METHODOLOGY
----------------------------------------------------------------------
Software Engineering is the systematic, disciplined, quantifiable approach to the development, operation, and maintenance of software.

1.1 SOFTWARE DEVELOPMENT LIFECYCLE (SDLC) MODELS
- Waterfall Model: Linear, sequential model. Phase-locked gates. Ideal for systems with static, well-defined requirements.
- Spiral Model: Iterative, risk-driven model. Combines iterative prototyping with systematic waterfalls. Divided into four quadrants: Determine objectives, Identify and resolve risks, Development and testing, Plan next iteration.
- V-Model (Verification and Validation): Extension of waterfall. Testing is planned in parallel with corresponding development phases.
- Agile Scrum: Iterative, customer-collaborative model. Work is chunked into 2 to 4-week sprints. Roles: Product Owner, Scrum Master, Developers. Ceremonies: Sprint Planning, Daily Standup, Sprint Review, Sprint Retrospective.

1.2 SOFTWARE TESTING STRATEGIES
- Unit Testing: Verifies individual functions/classes.
- Integration Testing: Verifies data interfaces between modules.
- System Testing: End-to-end checks on complete integrated software.
- Acceptance Testing: Verified by the client (Alpha/Beta tests) to check business criteria.


CHAPTER 2: JAVA PROGRAMMING AND ADVANCED JVM INTERNALS
----------------------------------------------------------------------
Java is a class-based, concurrent, strongly-typed, object-oriented language.

2.1 JAVA VIRTUAL MACHINE (JVM) ARCHITECTURE
- Class Loader Subsystem: Loading (Bootstrap, Extension, Application classloaders), Linking (Verify, Prepare, Resolve), and Initialization.
- JVM Memory Structure:
  * Heap Memory: Shared memory area storing all class objects and instance variables. Divided into Young Generation (Eden, Survivor spaces S0/S1) and Old (Tenured) Generation.
  * JVM Stack: Thread-private memory. Stores frame data, local variables, and method calls.
  * Method Area: Shared area storing class-level structures, runtime constant pools, and method bytecodes.
  * PC Register: Stores address of current executing instruction.
  * Native Method Stack: For native JNI calls (C/C++ libraries).
- Execution Engine: JIT (Just-In-Time) compiler translates bytecode to native instructions. Garbage Collector (GC) runs in the Heap to reclaim memory of unreferenced objects using Mark-Sweep-Compact or G1 GC algorithms.

2.2 CLASSICAL OBJECT-ORIENTED PROGRAMMING (OOP)
- Encapsulation: Data hiding via private fields and public getters/setters.
- Inheritance: Subclass reuses parent attributes via the 'extends' keyword.
- Polymorphism: Method Overloading (compile-time, same method name but different parameter list) and Method Overriding (runtime, subclass redefines parent method signature).
- Abstraction: Hiding implementation details via Interfaces (100% abstract contract) and Abstract Classes.


CHAPTER 3: PYTHON ECOSYSTEM, GIL, & CONCURRENCY
----------------------------------------------------------------------
Python is an interpreted, dynamically-typed, high-level language.

3.1 DYNAMIC TYPING & MEMORY MANAGEMENT
- In Python, variable declarations do not specify types. Types are bound to values at runtime.
- Memory allocation uses an internal private heap managed by a memory manager.
- Reclaims memory via reference counting. When reference count drops to 0, memory is immediately deallocated. To solve cyclic reference dependency loops, Python runs a cyclic garbage collector.

3.2 THE GLOBAL INTERPRETER LOCK (GIL)
- The GIL is a locking mechanism (mutex) that ensures only one native thread executes Python bytecode at any given moment.
- Designed to make memory management thread-safe.
- Limitation: Restricts CPU-bound operations in multi-threaded programs.
- Workaround: Use the 'multiprocessing' module (spawns separate processes with their own memory spaces and GILs) or asynchronous libraries (asyncio) for I/O-bound tasks.

3.3 ADVANCED SYNTAX AND ECOSYSTEM
- Generators: Functions returning iterators lazily using 'yield', minimizing memory usage.
- Decorators: Higher-order functions that wrap another function to modify its behavior dynamically.
- Core Data Structures: Lists (mutable arrays), Tuples (immutable lists), Sets (unique elements), and Dicts (hash tables).


CHAPTER 4: C PROCEDURAL LANGUAGE & SYSTEM PROGRAMMING
----------------------------------------------------------------------
C is a procedural, statically-typed compiled language.

4.1 POINTERS & MANUAL MEMORY MANAGEMENT
- Pointers hold the hexadecimal memory address of variables. Double pointers (**ptr) store the address of a pointer.
- Memory Layout of a C Program:
  * Text Segment: Compiled machine code.
  * Data Segment: Initialized global/static variables.
  * BSS Segment: Uninitialized global/static variables.
  * Heap: Managed manually using dynamic functions: malloc() (allocates raw memory block), calloc() (allocates and zero-initializes memory), realloc() (resizes block), and free() (releases memory back to system).
  * Stack: Automatic storage of local variables and function execution frames.

4.2 STRUCTURES & UNIONS
- Structs allocate separate memory locations for all members. Size is at least the sum of member sizes.
- Unions share the same memory space for all members. Occupies only the size of the largest member.


CHAPTER 5: RELATIONAL DBMS ARCHITECTURE & NORMALIZATION
----------------------------------------------------------------------
DBMS is software designed to configure, search, and maintain databases.

5.1 ACID PROPERTIES
- Atomicity: Transactions must complete fully or fail completely (all-or-nothing).
- Consistency: Transactions must transition the database from one valid state to another, preserving all constraints.
- Isolation: Concurrent transactions execute without interfering with each other.
- Durability: Once committed, changes are permanently written to non-volatile storage.

5.2 NORMALIZATION ALGORITHMS
- First Normal Form (1NF): All attributes must contain atomic (indivisible) values. No repeating groups.
- Second Normal Form (2NF): Must be in 1NF. Removes partial dependencies (every non-prime attribute must depend on the entire candidate key).
- Third Normal Form (3NF): Must be in 2NF. Removes transitive dependencies (no non-prime attribute should depend on another non-prime attribute).
- Boyce-Codd Normal Form (BCNF): Stronger 3NF. For every functional dependency X -> Y, X must be a super key.


CHAPTER 6: SQL QUERY OPTIMIZATION AND JOINS
----------------------------------------------------------------------
Structured Query Language (SQL) manages relational data.

6.1 JOIN TYPES & ALGORITHMS
- INNER JOIN: Returns matching rows in both tables.
- LEFT OUTER JOIN: Returns all rows from left table + matching rows from right.
- Join Algorithms inside Database Engine:
  * Nested Loop Join: For each row in outer table, scan inner table.
  * Hash Join: Creates a hash table in memory of the smaller table to match keys. Very fast for large datasets.
  * Sort Merge Join: Sorts both tables on join keys, then merges.

6.2 INDEXES
- Clustered Index: Sorts and stores data rows in the table physically based on keys. Only one clustered index per table.
- Non-Clustered Index: Creates a separate structure containing pointers to physical data rows.


CHAPTER 7: OPERATING SYSTEMS INTERNALS & PROCESSES
----------------------------------------------------------------------
An OS manages computer hardware, schedules tasks, and supports processes.

7.1 PROCESS SCHEDULING ALGORITHMS
- First-Come, First-Served (FCFS): Non-preemptive scheduling. Suffers from Convoy Effect.
- Shortest Job First (SJF): Schedules process with shortest CPU burst. Provides minimal average waiting time.
- Round Robin (RR): Preemptive scheduler allocating fixed CPU time-slices (quanta) in a cycle.

7.2 DEADLOCK PREVENTION & BANKER'S ALGORITHM
- A deadlock occurs when processes wait indefinitely for resources held by each other. Four conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.
- Banker's Algorithm: Algorithmic safe-state checker used to avoid deadlocks. Evaluates process maximum demands, current allocations, and system resources before granting resource allocations.

7.3 VIRTUAL MEMORY
- Virtual memory maps virtual addresses to physical RAM using page tables.
- Paging: Divides memory into fixed-size pages. Page fault occurs when a virtual page is not loaded in RAM, triggering disk read swaps. Replacement policies: LRU (Least Recently Used), FIFO.


CHAPTER 8: COMPUTER NETWORKS & TCP/IP SUITE
----------------------------------------------------------------------
Computer Networks route data packets across physical and logical nodes.

8.1 OSI 7-LAYER VS TCP/IP PROTOCOLS
- OSI Model Layers: Physical, Data Link, Network (IP routing), Transport (TCP/UDP), Session, Presentation, Application.
- TCP (Transmission Control Protocol): Connection-oriented, reliable, guarantees packet delivery and order using slide window and flow control. Uses a 3-way handshake to establish connection: SYN -> SYN-ACK -> ACK.
- UDP (User Datagram Protocol): Connectionless, fast, unreliable (no ordering or handshake), low latency.

8.2 DOMAIN NAME SYSTEM (DNS)
- Resolves human-readable domain names (google.com) to machine IP addresses. Performs iterative and recursive queries across Root, TLD, and Authoritative Name Servers.


CHAPTER 9: DATA STRUCTURES & ASYMPTOTIC ALGORITHMS
----------------------------------------------------------------------
Data Structures organize memory, and algorithms process data paths.

9.1 TIME COMPLEXITIES (BIG O NOTATION)
- O(1): Constant time (Array lookup by index).
- O(log N): Logarithmic time (Binary Search on sorted list).
- O(N): Linear time (Linear Search).
- O(N log N): Linearithmic time (Merge Sort, Heap Sort).
- O(N^2): Quadratic time (Bubble Sort, Selection Sort).

9.2 BASIC ALGORITHMS
- Graph Traversals:
  * Breadth-First Search (BFS): Explores adjacent nodes layer by layer using a Queue. Finds shortest path in unweighted graphs.
  * Depth-First Search (DFS): Explores nodes deep along each branch using a Stack (or recursion).
- Sorting Algorithms: Merge Sort (stable, divide-and-conquer), Quick Sort (average O(N log N), in-place sorting).

======================================================================
END OF REFERENCE HANDBOOK - STUDY FOR EXAMS
======================================================================`,
          fileUrl: null,
          createdAt: new Date().toISOString()
        },
        {
          id: 201,
          title: "Java Programming Core Guide",
          content: "Java is a class-based, object-oriented programming language designed to have as few implementation dependencies as possible. Key concepts:\n\n1. **JVM Architecture:** The Java Virtual Machine (JVM) executes bytecode. It consists of the Class Loader, JVM Memory (Heap, Stack, Method Area, PC Registers), and the Execution Engine (JIT Compiler, Garbage Collector).\n2. **OOP Principles:** Java implements Encapsulation (hiding data using private access modifiers), Inheritance (extends keyword), Polymorphism (Overloading and Overriding), and Abstraction (abstract classes and interfaces).\n3. **Memory Management:** Java uses automatic Garbage Collection (GC) in the Heap memory to free unreferenced objects. It has different GC algorithms (G1, ZGC, Serial).\n4. **Exception Handling:** Structured using try-catch-finally blocks. Exceptions are divided into Checked (compile-time, e.g., IOException) and Unchecked (runtime, e.g., NullPointerException).\n5. **Java Collection Framework:** Core interfaces: List (ArrayList, LinkedList), Set (HashSet, TreeSet), and Map (HashMap, TreeMap).",
          fileUrl: null,
          createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
        },
        {
          id: 202,
          title: "Python Language & Ecosystem",
          content: "Python is an interpreted, high-level, dynamically-typed programming language. Key concepts:\n\n1. **Dynamic Typing & Memory:** Variables are dynamically bound to values at runtime. Memory management is automated via reference counting and a cyclic garbage collector.\n2. **Global Interpreter Lock (GIL):** A mutex that allows only one thread to execute Python bytecode at once, limiting CPU-bound multithreaded performance. Multiprocessing is used to bypass this.\n3. **Core Data Structures:** Built-in structures include mutable Lists `[]`, immutable Tuples `()`, unique Sets `{}` and Key-Value Dictionaries `{\"\": \"\"}`.\n4. **Advanced Features:** Generators (using the `yield` keyword to return values lazily), Decorators (wrapping functions to modify behavior), and List Comprehensions.\n5. **Ecosystem:** Widely used in Data Science (NumPy, Pandas, Scikit-Learn), Web Development (Django, Flask, FastAPI), and Scripting.",
          fileUrl: null,
          createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
        },
        {
          id: 203,
          title: "C Procedural Programming",
          content: "C is a general-purpose, procedural computer programming language. Key concepts:\n\n1. **Procedural Nature:** C follows a top-down design structure, breaking down code into blocks of functions. It does not natively support OOP.\n2. **Pointers & Memory:** Pointers store the memory address of variables. Manual memory allocation is managed on the Heap using `malloc()`, `calloc()`, `realloc()`, and freed using `free()` to prevent memory leaks.\n3. **Structures and Unions:** Structs bundle variables of different types under a single name (allocating separate memory for each). Unions share the same memory location, occupying only the size of the largest member.\n4. **Preprocessor Directives:** Lines starting with `#` (e.g., `#include`, `#define`) are parsed by the preprocessor before actual compilation begins.\n5. **File Handling:** Read/write actions are managed using file pointers (`FILE *`) and functions like `fopen()`, `fclose()`, `fprintf()`, and `fscanf()`.",
          fileUrl: null,
          createdAt: new Date(Date.now() - 3600000 * 16).toISOString()
        },
        {
          id: 204,
          title: "C++ Programming & STL",
          content: "C++ is an extension of the C programming language that supports object-oriented, generic, and procedural programming. Key concepts:\n\n1. **OOP Extensions:** Introduces Classes, Objects, Access Specifiers (public, private, protected), and multiple inheritance.\n2. **Templates & Generic Programming:** Allows writing classes and functions with generic types, enabling code reuse. E.g., `template <typename T> T max(T a, T b)`.\n3. **Standard Template Library (STL):** Provides pre-built structures (Containers: vector, list, map, set), Iterators to traverse containers, and Algorithms (sort, binary_search, reverse).\n4. **References vs Pointers:** References are aliases for existing variables (cannot be null or reassigned), while pointers store raw addresses and can be manipulated using pointer arithmetic.\n5. **Resource Management:** Managed manually using `new` and `delete` operators, or modern Smart Pointers (`std::unique_ptr`, `std::shared_ptr`) for RAII (Resource Acquisition Is Initialization).",
          fileUrl: null,
          createdAt: new Date(Date.now() - 3600000 * 14).toISOString()
        },
        {
          id: 205,
          title: "Structured Query Language (SQL)",
          content: "SQL is the standard language for relational database management and data manipulation. Key concepts:\n\n1. **SQL Commands:** Divided into DDL (Data Definition Language: CREATE, ALTER, DROP) and DML (Data Manipulation Language: SELECT, INSERT, UPDATE, DELETE).\n2. **Queries and Filtering:** Retrieves data using SELECT columns FROM table WHERE condition. Advanced filtering is managed using GROUP BY (aggregations) and HAVING (filtering aggregated groups).\n3. **SQL Joins:** Used to combine rows from multiple tables based on related keys. Includes INNER JOIN (matches in both), LEFT JOIN (all left rows + matches), RIGHT JOIN, and FULL OUTER JOIN.\n4. **Indexes:** Speeds up search queries on columns (e.g., B-Tree indexes), but increases the execution time of INSERT/UPDATE operations.\n5. **Subqueries & CTEs:** Nested queries (Subqueries) or temporary named result sets (Common Table Expressions using `WITH`) used for complex querying.",
          fileUrl: null,
          createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
        },
        {
          id: 206,
          title: "Database Management Systems (DBMS)",
          content: "DBMS is software used to define, construct, manipulate, and share databases. Key concepts:\n\n1. **ACID Properties:** Essential for transaction reliability. Atomicity (all or nothing), Consistency (preserves database rules), Isolation (transactions run independently), and Durability (changes are permanent).\n2. **Normalization:** Database design technique that reduces redundancy and dependency. Form structures: 1NF (atomic values), 2NF (removes partial dependencies), and 3NF (removes transitive functional dependencies).\n3. **Keys:** Primary Key (uniquely identifies rows), Foreign Key (enforces referential integrity links between tables), and Candidate Keys.\n4. **Concurrency Control:** Manages simultaneous transaction executions using Locking protocols (Shared/Exclusive locks) and Two-Phase Locking (2PL) to prevent write-conflicts.",
          fileUrl: null,
          createdAt: new Date(Date.now() - 3600000 * 10).toISOString()
        },
        {
          id: 207,
          title: "Computer Networks & OSI Model",
          content: "Computer Networks govern how digital devices communicate and route packet information. Key concepts:\n\n1. **OSI 7-Layer Model:** Conceptual model dividing communication into 7 layers: Physical, Data Link (MAC addresses), Network (routing, IP addresses), Transport (TCP/UDP, ports), Session, Presentation, Application.\n2. **TCP vs UDP:** TCP is connection-oriented, reliable, guarantees packet ordering, and uses 3-way handshakes. UDP is connectionless, fast, has low overhead, and is used for streaming/DNS.\n3. **IP Addressing & Subnetting:** IPv4 uses 32-bit addresses divided into Classes (A, B, C, D). Subnetting divides a large network into smaller host segments using a subnet mask.\n4. **Domain Name System (DNS):** Resolves human-readable domain names (e.g., google.com) to machine IP addresses.\n5. **Routing Protocols:** Algorithmic path-finding protocols like OSPF (Link-state) and BGP (Path-vector used for Internet routing).",
          fileUrl: null,
          createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
        },
        {
          id: 208,
          title: "Operating Systems (OS) Core",
          content: "An Operating System is system software that manages computer hardware, software resources, and provides common services for computer programs. Key concepts:\n\n1. **Process Management:** A process is a program in execution. The CPU uses Scheduling Algorithms (FIFO, Round Robin, Shortest Job First, Priority) to allocate core execution cycles.\n2. **Deadlocks:** A state where processes are blocked waiting for resources held by each other. Conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait. Avoided using the Banker's Algorithm.\n3. **Memory Management:** Operates virtual memory using Paging (dividing memory into fixed pages) and Segmentation (variable segments). Handles page faults and paging replacement policies (LRU, FIFO).\n4. **Threads:** The smallest unit of execution inside a process. Threads share the process's memory space but have their own call stacks.\n5. **Virtual Memory:** Bypasses physical RAM limitations by temporarily swapping unused pages to storage disk memory.",
          fileUrl: null,
          createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
        },
        {
          id: 209,
          title: "Data Structures & Algorithms (DSA)",
          content: "DSA deals with organizing, managing, and storing data efficiently along with algorithmic steps to solve problems. Key concepts:\n\n1. **Asymptotic Complexity:** Measured using Big O notation to evaluate Time and Space complexity (e.g., O(1) constant, O(N) linear, O(log N) logarithmic, O(N log N) linearithmic).\n2. **Linear Structures:** Arrays (fixed memory, O(1) lookup), Linked Lists (nodes with pointers, O(1) insertions), Stacks (LIFO - Last In First Out), and Queues (FIFO - First In First Out).\n3. **Non-Linear Structures:** Trees (Binary Search Trees, AVL balanced trees for O(log N) lookup) and Graphs (represented using adjacency list or matrix).\n4. **Search and Sort:** Searching (Linear Search, Binary Search on sorted list). Sorting algorithms include Bubble, Insertion, Selection, Merge Sort (O(N log N), stable), and Quick Sort (O(N log N) average).\n5. **Graph Traversal:** Traversing nodes using Breadth-First Search (BFS, queue-based, shortest path) and Depth-First Search (DFS, stack-based).",
          fileUrl: null,
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
        }
      ];
      localStorage.setItem('mock_notes', JSON.stringify(defaultNotes));
    }
    if (!localStorage.getItem('mock_quizzes')) {
      localStorage.setItem('mock_quizzes', JSON.stringify([]));
    }
    if (!localStorage.getItem('mock_progress')) {
      localStorage.setItem('mock_progress', JSON.stringify({
        quizzesCompleted: 0,
        averageScore: 0.0,
        totalStudyTime: 0
      }));
    }
  };

  initMockDatabase();

  // Mock API intercept routes
  api.post = async (url, data) => {
    await delay(600);
    
    // Register Route
    if (url === '/api/auth/register') {
      const users = JSON.parse(localStorage.getItem('mock_users'));
      if (users.find(u => u.email === data.email)) {
        throw { response: { data: { message: "Error: Email is already in use!" } } };
      }
      users.push({ ...data, id: Date.now() });
      localStorage.setItem('mock_users', JSON.stringify(users));
      return { data: { message: "User registered successfully!" } };
    }

    // Login Route
    if (url === '/api/auth/login') {
      const users = JSON.parse(localStorage.getItem('mock_users'));
      // Fallback: If no users registered, allow login with any password >= 6 characters for safety!
      const user = users.find(u => u.email === data.email) || {
        name: data.email.split('@')[0],
        email: data.email,
        password: data.password,
        id: 999
      };
      
      if (data.password.length < 6) {
        throw { response: { data: { message: "Validation Error: password size must be between 6 and 40" } } };
      }

      const mockUserData = {
        token: "mock-jwt-token-" + Date.now(),
        id: user.id,
        name: user.name,
        email: user.email,
        role: "ROLE_USER"
      };
      return { data: mockUserData };
    }

    // Create Note Route
    if (url === '/api/notes') {
      const notes = JSON.parse(localStorage.getItem('mock_notes'));
      const newNote = {
        id: Date.now(),
        title: data.title,
        content: data.content || "Empty content",
        fileUrl: data.fileUrl || null,
        createdAt: new Date().toISOString()
      };
      notes.unshift(newNote);
      localStorage.setItem('mock_notes', JSON.stringify(notes));
      return { data: newNote };
    }

    // Generate Quiz Route
    if (url === '/api/quiz/generate') {
      const notes = JSON.parse(localStorage.getItem('mock_notes'));
      let noteContent = "General science and computing";
      let noteTitle = "Practice Quiz";

      if (data.noteId) {
        const note = notes.find(n => n.id === data.noteId);
        if (note) {
          noteContent = note.content;
          noteTitle = note.title;
        }
      }

      // If live API key is set, generate real quiz using Gemini API
      const apiKey = localStorage.getItem('gemini_api_key');
      if (apiKey && apiKey.trim() !== '') {
        try {
          const count = data.questionCount || 5;
          const prompt = `You are a professional quiz maker. Generate a quiz of exactly ${count} multiple choice questions (MCQs) based on the following notes. Your response must be a valid, raw JSON array of objects. Do not include markdown code block formatting (like \`\`\`json or \`\`\`). Each question object in the JSON array must follow this exact schema:
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "answer": "The exact string value matching the correct option from the options array"
}

Notes Content:
${noteContent}`;
          const rawResult = await callRealGeminiDirectly(prompt);
          const cleanedResult = cleanJsonString(rawResult);
          
          // Verify it parses as array
          JSON.parse(cleanedResult); 

          const newQuiz = {
            id: Date.now(),
            title: `Quiz: ${noteTitle}`,
            questions: cleanedResult,
            score: 0,
            createdAt: new Date().toISOString()
          };

          const quizzes = JSON.parse(localStorage.getItem('mock_quizzes'));
          quizzes.unshift(newQuiz);
          localStorage.setItem('mock_quizzes', JSON.stringify(quizzes));

          return { data: newQuiz };
        } catch (apiErr) {
          console.error("Failed to generate live quiz with Gemini, falling back to mock:", apiErr);
        }
      }

      // Local mock questions pool tailored to note contents
      let mockQuestions = [];
      const contentLower = noteContent.toLowerCase();
      const titleLower = noteTitle.toLowerCase();

      if (titleLower.includes("java") || contentLower.includes("jvm")) {
        mockQuestions = [
          {
            question: "Which component of the JVM executes class bytecodes and manages optimization via JIT compiler?",
            options: ["Class Loader", "Execution Engine", "Garbage Collector", "Method Area"],
            answer: "Execution Engine"
          },
          {
            question: "In Java OOP, which keyword is used to inherit a class?",
            options: ["implements", "inherits", "extends", "super"],
            answer: "extends"
          },
          {
            question: "Which of the following Java Collection interfaces allows storing key-value pairs?",
            options: ["List", "Set", "Queue", "Map"],
            answer: "Map"
          },
          {
            question: "Which of these is a Checked Exception in Java (evaluated at compile time)?",
            options: ["NullPointerException", "ArithmeticException", "IOException", "ArrayIndexOutOfBoundsException"],
            answer: "IOException"
          },
          {
            question: "Where in JVM memory are Java objects dynamically allocated?",
            options: ["JVM Stack", "Heap Memory", "Method Area", "PC Registers"],
            answer: "Heap Memory"
          }
        ];
      } else if (titleLower.includes("python") || contentLower.includes("gil")) {
        mockQuestions = [
          {
            question: "What is the name of the lock in Python that prevents multiple native threads from executing bytecode concurrently?",
            options: ["Global Interpreter Lock (GIL)", "Global Thread Lock", "Interpreter Mutex", "Process Locking Manager"],
            answer: "Global Interpreter Lock (GIL)"
          },
          {
            question: "Which Python data structure is immutable and declared using parentheses?",
            options: ["List", "Dictionary", "Tuple", "Set"],
            answer: "Tuple"
          },
          {
            question: "Which keyword is used in Python to return a value from a generator function lazily?",
            options: ["return", "yield", "send", "generate"],
            answer: "yield"
          },
          {
            question: "Which framework is a popular asynchronous web framework in the Python ecosystem?",
            options: ["Django", "Flask", "FastAPI", "React"],
            answer: "FastAPI"
          },
          {
            question: "How is memory management handled for unreferenced variables in Python?",
            options: ["Manual deallocation", "Garbage Collection & Reference Counting", "JVM Cleaner", "Pointers free()"],
            answer: "Garbage Collection & Reference Counting"
          }
        ];
      } else if (titleLower.includes("c ") || contentLower.includes("malloc")) {
        mockQuestions = [
          {
            question: "Which function is used in C to dynamically allocate memory on the heap without zero-initializing it?",
            options: ["calloc()", "malloc()", "realloc()", "free()"],
            answer: "malloc()"
          },
          {
            question: "What holds the memory address of another variable in C?",
            options: ["Array", "Pointer", "Struct", "Union"],
            answer: "Pointer"
          },
          {
            question: "In C, which struct-like structure shares the same memory space for all its members?",
            options: ["Union", "Typedef", "Class", "Pointer struct"],
            answer: "Union"
          },
          {
            question: "All preprocessor directives in C begin with which symbol?",
            options: ["$", "@", "#", "&"],
            answer: "#"
          },
          {
            question: "Which C standard library function is used to release heap-allocated memory blocks?",
            options: ["release()", "free()", "delete()", "clear()"],
            answer: "free()"
          }
        ];
      } else if (titleLower.includes("c++") || contentLower.includes("stl")) {
        mockQuestions = [
          {
            question: "In C++, which component of the Standard Template Library (STL) provides pre-built dynamically-resizable array structures?",
            options: ["vector", "list", "map", "set"],
            answer: "vector"
          },
          {
            question: "What is an alias for an existing variable in C++ that cannot be null or reassigned?",
            options: ["Pointer", "Reference", "Template", "Iterator"],
            answer: "Reference"
          },
          {
            question: "Which operators are used for manual memory management (alloc/dealloc) in C++?",
            options: ["malloc and free", "new and delete", "alloc and clear", "create and destroy"],
            answer: "new and delete"
          },
          {
            question: "Which mechanism in C++ allows writing generic functions and classes?",
            options: ["Polymorphism", "Templates", "Namespaces", "Inheritance"],
            answer: "Templates"
          },
          {
            question: "What is the primary benefit of C++ Smart Pointers?",
            options: ["Automatic memory deallocation via RAII", "Double precision compile speeds", "Bypassing private access controls", "Eliminating syntax errors"],
            answer: "Automatic memory deallocation via RAII"
          }
        ];
      } else if (titleLower.includes("sql") || contentLower.includes("join")) {
        mockQuestions = [
          {
            question: "Which SQL command type covers data structure actions like CREATE, ALTER, and DROP?",
            options: ["DML", "DDL", "DCL", "TCL"],
            answer: "DDL"
          },
          {
            question: "Which SQL Join combines all rows from the left table and matched rows from the right table?",
            options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
            answer: "LEFT JOIN"
          },
          {
            question: "What clause is used in SQL queries to filter groups after an aggregation function has been run?",
            options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"],
            answer: "HAVING"
          },
          {
            question: "Which index type is most commonly used in RDBMS to speed up matching column range queries?",
            options: ["B-Tree Index", "Hash Index", "Spatial Index", "Bitmap Index"],
            answer: "B-Tree Index"
          },
          {
            question: "Which keyword is used to permanently save transaction database changes in SQL?",
            options: ["SAVEPOINT", "ROLLBACK", "COMMIT", "SET STATUS"],
            answer: "COMMIT"
          }
        ];
      } else if (titleLower.includes("dbms") || contentLower.includes("acid")) {
        mockQuestions = [
          {
            question: "What does the 'A' in ACID transaction properties stand for?",
            options: ["Atomicity", "Association", "Authentication", "Algorithm"],
            answer: "Atomicity"
          },
          {
            question: "Which database normalization form focuses on removing transitive functional dependencies?",
            options: ["1NF", "2NF", "3NF", "Boyce-Codd Normal Form"],
            answer: "3NF"
          },
          {
            question: "What type of database key enforces referential integrity between two tables?",
            options: ["Primary Key", "Foreign Key", "Candidate Key", "Super Key"],
            answer: "Foreign Key"
          },
          {
            question: "Which concurrency control protocol splits lock management into a growing phase and a shrinking phase?",
            options: ["Time-stamping", "Two-Phase Locking (2PL)", "Validation Protocol", "Shared locking"],
            answer: "Two-Phase Locking (2PL)"
          },
          {
            question: "Which transaction property ensures that changes are permanently saved and not lost even in a system crash?",
            options: ["Durability", "Consistency", "Isolation", "Atomicity"],
            answer: "Durability"
          }
        ];
      } else if (titleLower.includes("network") || contentLower.includes("osi")) {
        mockQuestions = [
          {
            question: "Which layer of the OSI model handles packet routing, IP addressing, and path determination?",
            options: ["Physical Layer", "Data Link Layer", "Network Layer", "Transport Layer"],
            answer: "Network Layer"
          },
          {
            question: "Which Transport layer protocol is connectionless and fast, commonly used for DNS queries and video streams?",
            options: ["TCP", "UDP", "FTP", "HTTP"],
            answer: "UDP"
          },
          {
            question: "Which protocol is responsible for resolving domain names like 'google.com' into IP addresses?",
            options: ["DHCP", "DNS", "ARP", "BGP"],
            answer: "DNS"
          },
          {
            question: "How many bits make up an IPv4 address?",
            options: ["16 bits", "32 bits", "64 bits", "128 bits"],
            answer: "32 bits"
          },
          {
            question: "Which protocol resolves a known Network layer IP address to a physical hardware MAC address?",
            options: ["DNS", "DHCP", "ARP", "ICMP"],
            answer: "ARP"
          }
        ];
      } else if (titleLower.includes("operating") || contentLower.includes("deadlock")) {
        mockQuestions = [
          {
            question: "Which scheduling algorithm executes CPU processes in a cyclical time-slice sequence?",
            options: ["First In First Out (FIFO)", "Round Robin", "Shortest Job First (SJF)", "Priority Scheduling"],
            answer: "Round Robin"
          },
          {
            question: "Which algorithmic method is used to avoid deadlocks by dynamically checking resource allocations?",
            options: ["Dijkstra's Algorithm", "Kruskal's Algorithm", "Banker's Algorithm", "Round Robin Scheduling"],
            answer: "Banker's Algorithm"
          },
          {
            question: "What state occurs when threads or processes are blocked indefinitely waiting for resources held by each other?",
            options: ["Race Condition", "Deadlock", "Segmentation Fault", "Page Fault"],
            answer: "Deadlock"
          },
          {
            question: "Which memory management scheme divides virtual memory into fixed-size blocks?",
            options: ["Paging", "Segmentation", "Virtual allocation", "Swapping"],
            answer: "Paging"
          },
          {
            question: "What is the smallest schedulable unit of CPU execution inside a process that shares memory resources?",
            options: ["Daemon", "Thread", "Semaphore", "Subprocess"],
            answer: "Thread"
          }
        ];
      } else if (titleLower.includes("structure") || contentLower.includes("complexity") || titleLower.includes("dsa") || titleLower.includes("handbook")) {
        mockQuestions = [
          {
            question: "What is the average time complexity of searching a value in a balanced Binary Search Tree (BST)?",
            options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
            answer: "O(log N)"
          },
          {
            question: "Which linear data structure operates on a Last In First Out (LIFO) execution stack basis?",
            options: ["Queue", "Stack", "Linked List", "Binary Tree"],
            answer: "Stack"
          },
          {
            question: "Which sorting algorithm splits an array in half, recursively sorts each half, and merges them back (O(N log N) time)?",
            options: ["Bubble Sort", "Quick Sort", "Merge Sort", "Insertion Sort"],
            answer: "Merge Sort"
          },
          {
            question: "Which traversal algorithm uses a Queue structure to traverse graphs layer-by-layer to find the shortest path?",
            options: ["Breadth-First Search (BFS)", "Depth-First Search (DFS)", "In-order traversal", "Post-order traversal"],
            answer: "Breadth-First Search (BFS)"
          },
          {
            question: "What is the worst-case time complexity of sorting an array using Quick Sort?",
            options: ["O(N)", "O(N log N)", "O(N^2)", "O(2^N)"],
            answer: "O(N^2)"
          }
        ];
      } else {
        mockQuestions = [
          {
            question: "What is the primary language used to build a Spring Boot backend?",
            options: ["Python", "Java", "C++", "JavaScript"],
            answer: "Java"
          },
          {
            question: "Which protocol is standard for secure client-server API requests?",
            options: ["FTP", "SMTP", "HTTPS", "DHCP"],
            answer: "HTTPS"
          },
          {
            question: "What does JWT stand for in modern authentication stacks?",
            options: ["Java Web Token", "JSON Web Token", "Joint Web Technology", "JPA Web Transaction"],
            answer: "JSON Web Token"
          }
        ];
      }

      const count = data.questionCount || 3;
      const finalQuestions = mockQuestions.slice(0, count);

      const newQuiz = {
        id: Date.now(),
        title: `Quiz: ${noteTitle}`,
        questions: JSON.stringify(finalQuestions),
        score: 0,
        createdAt: new Date().toISOString()
      };

      const quizzes = JSON.parse(localStorage.getItem('mock_quizzes'));
      quizzes.unshift(newQuiz);
      localStorage.setItem('mock_quizzes', JSON.stringify(quizzes));

      return { data: newQuiz };
    }

    // Submit Quiz Route
    if (url === '/api/quiz/submit') {
      const quizzes = JSON.parse(localStorage.getItem('mock_quizzes'));
      const quiz = quizzes.find(q => q.id === data.quizId);
      if (quiz) {
        quiz.score = data.score;
        localStorage.setItem('mock_quizzes', JSON.stringify(quizzes));
      }

      // Update progress metrics
      const progress = JSON.parse(localStorage.getItem('mock_progress'));
      const currentCount = progress.quizzesCompleted;
      const currentAverage = progress.averageScore;
      
      const newAverage = ((currentAverage * currentCount) + data.score) / (currentCount + 1);
      
      progress.quizzesCompleted = currentCount + 1;
      progress.averageScore = Math.round(newAverage * 10.0) / 10.0;
      progress.totalStudyTime = progress.totalStudyTime + (data.studyTime || 5);
      
      localStorage.setItem('mock_progress', JSON.stringify(progress));

      return { data: quiz };
    }

    // AI Chat Route
    if (url === '/api/ai/chat') {
      const notes = JSON.parse(localStorage.getItem('mock_notes'));
      let noteText = "";
      let noteTitle = "General Subjects";
      if (data.noteId) {
        const note = notes.find(n => n.id === data.noteId);
        if (note) {
          noteText = note.content;
          noteTitle = note.title;
        }
      }

      // If live API key is set, get real answers directly from Google Gemini API
      const apiKey = localStorage.getItem('gemini_api_key');
      if (apiKey && apiKey.trim() !== '') {
        try {
          const prompt = `You are a helpful AI Study Buddy. Answer the user's question based on the provided notes context. If the answer is not in the notes, use your general knowledge but mention it is not explicitly in the notes. Use clean markdown formatting with key terms bolded. Keep your response conversational, supportive, and structured.

Notes Context:
${noteText || "No context note is selected. Answer general user query."}

User Question:
${data.message}`;
          const reply = await callRealGeminiDirectly(prompt);
          return { data: { response: reply } };
        } catch (apiErr) {
          console.error("Failed to generate live chat response from Gemini, falling back to mock:", apiErr);
        }
      }

      let aiResponse = "";
      const msg = data.message.toLowerCase();

      if (msg.includes("hello") || msg.includes("hi")) {
        aiResponse = `Hello! I am your AI Study Buddy. I have analyzed your study guide on **${noteTitle}**. Ask me to **explain** any complex concept, **summarize** the main terms, or suggest a **study schedule**!`;
      } else if (msg.includes("explain") || msg.includes("what is") || msg.includes("how does") || msg.includes("concept")) {
        aiResponse = `### AI Concept Explanation: ${noteTitle}\n\nBased on your study notes for **${noteTitle}**, here is the breakdown of the core concepts:\n\n* **Primary Focus:** Structured definitions and processes associated with the subject.\n* **Key Takeaway:** Active recalling and practice exams (like generating a quiz in the Quiz Room) are highly effective to master this material.\n\nLet me know if you want me to explain any specific term in detail!`;
      } else {
        aiResponse = `### AI Study Buddy Co-pilot: ${noteTitle}\n\nI have parsed your **${noteTitle}** guide. Here is my analysis:\n\n1. **Core Highlights:** Key variables, functions, and theories discussed in the notes.\n2. **Retention Tip:** Try generating a practice quiz from this note. It will help lock these details in your memory before the college midterm!\n\n*What else can I help you study?*`;
      }

      return { data: { response: aiResponse } };
    }

    // AI Summarize Route
    if (url === '/api/ai/summarize') {
      const notes = JSON.parse(localStorage.getItem('mock_notes'));
      const note = notes.find(n => n.id === data.noteId);
      const title = note ? note.title : "Study Guide";
      const content = note ? note.content : "General study concepts";

      // If live API key is set, generate summary using Gemini API
      const apiKey = localStorage.getItem('gemini_api_key');
      if (apiKey && apiKey.trim() !== '') {
        try {
          const prompt = `Summarize the following notes content in a clear, structured format using markdown. Highlight key concepts, vocabulary, and takeaways. Keep it concise yet comprehensive.

Notes:
${content}`;
          const summary = await callRealGeminiDirectly(prompt);
          return { data: { response: summary } };
        } catch (apiErr) {
          console.error("Failed to generate live summary with Gemini, falling back to mock:", apiErr);
        }
      }

      const summary = `### Executive Summary: ${title}\n\n* **Overview:** Summarized synthesis of "${title}" contents.\n* **Core Pillars:**\n  1. *Core Definitions:* Synthesized overview of key variables and definitions.\n  2. *Process Flows:* Explanation of primary algorithms, rules, or system characteristics.\n  3. *Academic takeaways:* Main structures to study for upcoming midterms.\n* **Vocabulary Terms:**\n  * **Recall Anchors:** Terms requiring spaced-repetition testing.\n  * **Key Formulae/Rules:** Essential theorems or models in the guide.`;

      return { data: { response: summary } };
    }

    // AI Study Plan Route
    if (url === '/api/ai/study-plan') {
      const notes = JSON.parse(localStorage.getItem('mock_notes'));
      const note = notes.find(n => n.id === data.noteId);
      const title = note ? note.title : "Subject Material";
      const content = note ? note.content : "General study material";

      // If live API key is set, generate study plan using Gemini API
      const apiKey = localStorage.getItem('gemini_api_key');
      if (apiKey && apiKey.trim() !== '') {
        try {
          const days = 7;
          const prompt = `Create a detailed ${days}-day daily study plan for the following topic/material. Structure it day-by-day. For each day specify: 1) What to focus on, 2) Study activities, and 3) Self-assessment questions. Use markdown formatting with emojis for readability.

Topic/Notes:
${content}`;
          const plan = await callRealGeminiDirectly(prompt);
          return { data: { response: plan } };
        } catch (apiErr) {
          console.error("Failed to generate live study plan with Gemini, falling back to mock:", apiErr);
        }
      }

      const studyPlan = `### 📅 7-Day Study Schedule: ${title}\n\nHere is your custom spaced-repetition plan:\n\n* **Day 1: Read & Anchor**\n  * Focus on the definitions. Write down flashcards for key terms.\n* **Day 2: Concept Mapping**\n  * Draw a visual diagram showing how the definitions connect.\n* **Day 3: Practice Quiz**\n  * Go to the *Quiz Room* on your sidebar and run a 5-question MCQ test.\n* **Day 4: Gap Review**\n  * Ask the *AI Study Chat* to explain any questions you answered incorrectly.\n* **Day 5: Synthesis**\n  * Teach the concepts out loud to a peer or draft a 1-page cheatsheet.\n* **Day 6: Final Self-Assessment**\n  * Take a 10-question MCQ quiz on the platform. Aim for >80%.\n* **Day 7: Exam Readiness**\n  * Quick review of key cheatsheets. Sleep well!`;

      return { data: { response: studyPlan } };
    }

    throw new Error("Local mock route not found: " + url);
  };

  api.get = async (url) => {
    await delay(300);

    // Get Notes
    if (url === '/api/notes') {
      const notes = JSON.parse(localStorage.getItem('mock_notes'));
      return { data: notes };
    }

    // Get Quiz Results
    if (url === '/api/quiz/results') {
      const quizzes = JSON.parse(localStorage.getItem('mock_quizzes'));
      return { data: quizzes.filter(q => q.score > 0) }; // only return completed quizzes
    }

    // Get Progress Metrics
    if (url === '/api/progress') {
      const progress = JSON.parse(localStorage.getItem('mock_progress'));
      return { data: progress };
    }

    throw new Error("Local mock route not found: " + url);
  };

  api.delete = async (url) => {
    await delay(400);

    // Delete Note
    if (url.startsWith('/api/notes/')) {
      const id = parseInt(url.split('/').pop());
      const notes = JSON.parse(localStorage.getItem('mock_notes'));
      const filtered = notes.filter(n => n.id !== id);
      localStorage.setItem('mock_notes', JSON.stringify(filtered));
      return { data: { message: "Note deleted successfully!" } };
    }

    throw new Error("Local mock route not found: " + url);
  };
}

export default api;
