-- ============================================
-- MODÈLE CONCEPTUEL DE DONNÉES (MCD)
-- Quiz Generator Application
-- ============================================

-- ========== TABLE: users ==========
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
    avatar VARCHAR(255),
    bio TEXT,
    institution VARCHAR(255),
    total_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== TABLE: badges ==========
CREATE TABLE badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    badge_type VARCHAR(20) DEFAULT 'bronze' CHECK (badge_type IN ('bronze', 'silver', 'gold', 'platinum')),
    points_required INTEGER DEFAULT 0,
    quizzes_required INTEGER DEFAULT 0
);

-- ========== TABLE: user_badges (N:N) ==========
CREATE TABLE user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_id)
);

-- ========== TABLE: courses ==========
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'other' CHECK (category IN ('science', 'math', 'history', 'language', 'it', 'other')),
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT FALSE,
    thumbnail VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== TABLE: documents ==========
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file VARCHAR(255) NOT NULL,
    file_type VARCHAR(20) CHECK (file_type IN ('pdf', 'docx', 'txt', 'image')),
    file_size INTEGER DEFAULT 0,
    extracted_text TEXT,
    processing_status VARCHAR(20) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    processing_error TEXT,
    uploaded_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== TABLE: course_enrollments (N:N) ==========
CREATE TABLE course_enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress FLOAT DEFAULT 0.0,
    UNIQUE(student_id, course_id)
);

-- ========== TABLE: quizzes ==========
CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    difficulty VARCHAR(20) DEFAULT 'intermediaire' CHECK (difficulty IN ('debutant', 'intermediaire', 'avance')),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    time_limit INTEGER DEFAULT 30,
    passing_score INTEGER DEFAULT 60,
    shuffle_questions BOOLEAN DEFAULT TRUE,
    show_correct_answers BOOLEAN DEFAULT TRUE,
    created_by_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== TABLE: quiz_documents (N:N) ==========
CREATE TABLE quiz_documents (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    UNIQUE(quiz_id, document_id)
);

-- ========== TABLE: questions ==========
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    question_type VARCHAR(20) CHECK (question_type IN ('qcm', 'vf', 'ouvert', 'completion')),
    text TEXT NOT NULL,
    choices JSONB DEFAULT '[]',
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    points INTEGER DEFAULT 1,
    "order" INTEGER DEFAULT 0
);

-- ========== TABLE: quiz_attempts ==========
CREATE TABLE quiz_attempts (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    score FLOAT DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    time_spent INTEGER DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- ========== TABLE: user_answers ==========
CREATE TABLE user_answers (
    id SERIAL PRIMARY KEY,
    attempt_id INTEGER REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    answer TEXT,
    is_correct BOOLEAN DEFAULT FALSE,
    points_earned INTEGER DEFAULT 0,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(attempt_id, question_id)
);

-- ========== TABLE: flashcards ==========
CREATE TABLE flashcards (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    hint TEXT,
    "order" INTEGER DEFAULT 0
);

-- ========== INDEX POUR PERFORMANCES ==========
CREATE INDEX idx_documents_course ON documents(course_id);
CREATE INDEX idx_documents_status ON documents(processing_status);
CREATE INDEX idx_quizzes_course ON quizzes(course_id);
CREATE INDEX idx_quizzes_status ON quizzes(status);
CREATE INDEX idx_questions_quiz ON questions(quiz_id);
CREATE INDEX idx_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX idx_attempts_student ON quiz_attempts(student_id);
CREATE INDEX idx_answers_attempt ON user_answers(attempt_id);

-- ========== DONNÉES INITIALES: BADGES ==========
INSERT INTO badges (name, description, icon, badge_type, points_required, quizzes_required) VALUES
('Débutant', 'Premier quiz complété', 'emoji_events', 'bronze', 0, 1),
('Assidu', '10 quiz complétés', 'workspace_premium', 'bronze', 0, 10),
('Expert', '50 quiz complétés', 'military_tech', 'silver', 0, 50),
('100 Points', 'Atteindre 100 points', 'stars', 'bronze', 100, 0),
('500 Points', 'Atteindre 500 points', 'stars', 'silver', 500, 0),
('1000 Points', 'Atteindre 1000 points', 'stars', 'gold', 1000, 0),
('Perfectionniste', 'Score parfait sur un quiz', 'verified', 'gold', 0, 0),
('Maître du temps', 'Terminer un quiz en moins de 5 minutes', 'timer', 'silver', 0, 0);
