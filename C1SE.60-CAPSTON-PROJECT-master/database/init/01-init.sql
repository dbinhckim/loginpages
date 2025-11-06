-- Init database for CS60 Recruitment System

-- Core tables for user management and authentication (Module 1)
CREATE TABLE IF NOT EXISTS roles ( -- Thêm IF NOT EXISTS
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions ( -- Thêm IF NOT EXISTS
    permission_id INT PRIMARY KEY AUTO_INCREMENT,
    permission_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_permissions ( -- Thêm IF NOT EXISTS
    role_id INT,
    permission_id INT,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users ( -- Thêm IF NOT EXISTS
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role_id INT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    -- ----- MỚI: Thêm cột cho chức năng Quên Mật Khẩu -----
    reset_password_token VARCHAR(255) NULL DEFAULT NULL,
    reset_password_expires TIMESTAMP NULL DEFAULT NULL,
    -- -------------------------------------------------
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE SET NULL -- Đổi thành SET NULL để khớp Model
);

CREATE TABLE IF NOT EXISTS system_logs ( -- Thêm IF NOT EXISTS
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Question and test management (Module 2) - Bỏ qua chi tiết, thêm IF NOT EXISTS
CREATE TABLE IF NOT EXISTS question_categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS questions (
    question_id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT,
    question_text TEXT NOT NULL,
    question_type ENUM('MULTIPLE_CHOICE', 'SINGLE_CHOICE', 'TEXT', 'CODING') NOT NULL,
    difficulty_level ENUM('EASY', 'MEDIUM', 'HARD', 'EXPERT') NOT NULL,
    created_by INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES question_categories(category_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);
CREATE TABLE IF NOT EXISTS question_options (
    option_id INT PRIMARY KEY AUTO_INCREMENT,
    question_id INT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS coding_question_templates (
     template_id INT PRIMARY KEY AUTO_INCREMENT,
     question_id INT NOT NULL,
     programming_language VARCHAR(50) NOT NULL,
     code_template TEXT,
     test_cases TEXT,
     FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS tests (
     test_id INT PRIMARY KEY AUTO_INCREMENT,
     test_name VARCHAR(100) NOT NULL,
     description TEXT,
     duration_minutes INT NOT NULL,
     passing_score INT,
     is_active BOOLEAN DEFAULT TRUE,
     created_by INT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     FOREIGN KEY (created_by) REFERENCES users(user_id)
);
CREATE TABLE IF NOT EXISTS test_questions (
     test_id INT,
     question_id INT,
     question_order INT NOT NULL,
     score_weight INT DEFAULT 1,
     PRIMARY KEY (test_id, question_id),
     FOREIGN KEY (test_id) REFERENCES tests(test_id) ON DELETE CASCADE,
     FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
);

-- Candidate management (Module 3 & 5) - Bỏ qua chi tiết, thêm IF NOT EXISTS
CREATE TABLE IF NOT EXISTS candidates (
     candidate_id INT PRIMARY KEY AUTO_INCREMENT,
     user_id INT UNIQUE,
     first_name VARCHAR(50) NOT NULL,
     last_name VARCHAR(50) NOT NULL,
     email VARCHAR(100) NOT NULL UNIQUE,
     phone VARCHAR(20),
     current_position VARCHAR(100),
     years_of_experience INT,
     education TEXT,
     skills TEXT,
     source VARCHAR(100),
     status ENUM('NEW', 'SCREENING', 'TESTING', 'INTERVIEWING', 'OFFERED', 'HIRED', 'REJECTED') DEFAULT 'NEW',
     notes TEXT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS candidate_resumes (
     resume_id INT PRIMARY KEY AUTO_INCREMENT,
     candidate_id INT NOT NULL,
     file_name VARCHAR(255) NOT NULL,
     file_path VARCHAR(255) NOT NULL,
     file_type VARCHAR(50),
     file_size INT,
     uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     is_primary BOOLEAN DEFAULT TRUE,
     FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS job_positions (
     position_id INT PRIMARY KEY AUTO_INCREMENT,
     title VARCHAR(100) NOT NULL,
     department VARCHAR(100),
     description TEXT,
     requirements TEXT,
     is_active BOOLEAN DEFAULT TRUE,
     created_by INT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     FOREIGN KEY (created_by) REFERENCES users(user_id)
);
CREATE TABLE IF NOT EXISTS candidate_job_applications (
     application_id INT PRIMARY KEY AUTO_INCREMENT,
     candidate_id INT NOT NULL,
     position_id INT NOT NULL,
     application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     status ENUM('APPLIED', 'SCREENING', 'TESTING', 'INTERVIEWING', 'OFFERED', 'HIRED', 'REJECTED') DEFAULT 'APPLIED',
     recruiter_id INT,
     FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id) ON DELETE CASCADE,
     FOREIGN KEY (position_id) REFERENCES job_positions(position_id),
     FOREIGN KEY (recruiter_id) REFERENCES users(user_id)
);

-- Interview management (Module 3) - Bỏ qua chi tiết, thêm IF NOT EXISTS
CREATE TABLE IF NOT EXISTS interviews (
    interview_id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    interview_type ENUM('PHONE', 'TECHNICAL', 'HR', 'FINAL') NOT NULL,
    scheduled_date DATETIME NOT NULL,
    duration_minutes INT NOT NULL,
    location VARCHAR(255),
    meeting_link VARCHAR(255),
    notes TEXT,
    status ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED') DEFAULT 'SCHEDULED',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES candidate_job_applications(application_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);
CREATE TABLE IF NOT EXISTS interview_participants (
    interview_id INT,
    user_id INT,
    role ENUM('INTERVIEWER', 'OBSERVER', 'HR'),
    PRIMARY KEY (interview_id, user_id),
    FOREIGN KEY (interview_id) REFERENCES interviews(interview_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS interview_feedback (
     feedback_id INT PRIMARY KEY AUTO_INCREMENT,
     interview_id INT NOT NULL,
     reviewer_id INT NOT NULL,
     technical_score INT,
     communication_score INT,
     culture_fit_score INT,
     overall_rating INT NOT NULL,
     strengths TEXT,
     weaknesses TEXT,
     recommendation ENUM('STRONG_HIRE', 'HIRE', 'NEUTRAL', 'NO_HIRE', 'STRONG_NO_HIRE') NOT NULL,
     comments TEXT,
     submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (interview_id) REFERENCES interviews(interview_id) ON DELETE CASCADE,
     FOREIGN KEY (reviewer_id) REFERENCES users(user_id)
);

-- Test taking (Module 4 & 5) - Bỏ qua chi tiết, thêm IF NOT EXISTS
CREATE TABLE IF NOT EXISTS candidate_tests (
     candidate_test_id INT PRIMARY KEY AUTO_INCREMENT,
     candidate_id INT NOT NULL,
     test_id INT NOT NULL,
     application_id INT,
     start_time TIMESTAMP NULL,
     end_time TIMESTAMP NULL,
     status ENUM('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED') DEFAULT 'ASSIGNED',
     score INT,
     passing_status ENUM('PASSED', 'FAILED', 'PENDING') DEFAULT 'PENDING',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id) ON DELETE CASCADE,
     FOREIGN KEY (test_id) REFERENCES tests(test_id) ON DELETE CASCADE,
     FOREIGN KEY (application_id) REFERENCES candidate_job_applications(application_id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS candidate_test_answers (
    answer_id INT PRIMARY KEY AUTO_INCREMENT,
    candidate_test_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_options VARCHAR(255),
    text_answer TEXT,
    code_answer TEXT,
    is_correct BOOLEAN DEFAULT FALSE,
    score_earned DECIMAL(5,2),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_test_id) REFERENCES candidate_tests(candidate_test_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(question_id)
);
CREATE TABLE IF NOT EXISTS test_fraud_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    candidate_test_id INT NOT NULL,
    event_type ENUM('TAB_SWITCH', 'COPY_PASTE', 'MULTIPLE_WINDOWS', 'SCREENSHOT', 'OTHER') NOT NULL,
    event_count INT DEFAULT 1,
    event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    FOREIGN KEY (candidate_test_id) REFERENCES candidate_tests(candidate_test_id) ON DELETE CASCADE
);

-- Additional tables for Module 5 (Reports and analytics) - Bỏ qua chi tiết, thêm IF NOT EXISTS
CREATE TABLE IF NOT EXISTS candidate_test_results (
     result_id INT PRIMARY KEY AUTO_INCREMENT,
     candidate_test_id INT UNIQUE,
     total_score INT NOT NULL,
     max_possible_score INT NOT NULL,
     percentage DECIMAL(5,2) NOT NULL,
     passed BOOLEAN DEFAULT FALSE,
     strength_areas TEXT,
     improvement_areas TEXT,
     feedback TEXT,
     reviewed_by INT,
     reviewed_at TIMESTAMP NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (candidate_test_id) REFERENCES candidate_tests(candidate_test_id) ON DELETE CASCADE,
     FOREIGN KEY (reviewed_by) REFERENCES users(user_id)
);
CREATE TABLE IF NOT EXISTS recruitment_reports (
     report_id INT PRIMARY KEY AUTO_INCREMENT,
     report_name VARCHAR(100) NOT NULL,
     report_type ENUM('CANDIDATE_PIPELINE', 'TEST_PERFORMANCE', 'INTERVIEWER_EFFICIENCY', 'HIRING_METRICS', 'CUSTOM') NOT NULL,
     parameters TEXT,
     created_by INT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- ----- DỮ LIỆU BAN ĐẦU -----
-- Sử dụng INSERT IGNORE để tránh lỗi nếu dữ liệu đã tồn tại (khi chạy lại mà không xóa volume)
-- Insert default roles
INSERT IGNORE INTO roles (role_name, description) VALUES
('ADMIN', 'System administrator with full access'),
('RECRUITER', 'HR staff managing recruitment process'),
('INTERVIEWER', 'Technical staff conducting interviews'),
-- ----- SỬA: Đổi CANDIDATE thành APPLICANT -----
('APPLICANT', 'Job applicant user role');

-- Insert default permissions
INSERT IGNORE INTO permissions (permission_name, description) VALUES
('USER_MANAGEMENT', 'Create, update, delete users'),
('ROLE_MANAGEMENT', 'Manage roles and permissions'),
('QUESTION_MANAGEMENT', 'Create and manage questions'),
('TEST_MANAGEMENT', 'Create and manage tests'),
('CANDIDATE_MANAGEMENT', 'Manage candidate profiles'),
('INTERVIEW_MANAGEMENT', 'Schedule and manage interviews'),
('TEST_TAKING', 'Take assigned tests'),
('REPORTING', 'Generate and view reports');

-- Assign permissions to roles
-- Lưu ý: ID của roles có thể thay đổi nếu bảng không trống khi INSERT IGNORE
-- Cách an toàn hơn là dùng subquery, nhưng để đơn giản ta giả sử ID là 1, 2, 3, 4
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.role_name = 'ADMIN'; -- Admin gets all

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.role_name = 'RECRUITER' AND p.permission_name IN
('QUESTION_MANAGEMENT', 'TEST_MANAGEMENT', 'CANDIDATE_MANAGEMENT', 'INTERVIEW_MANAGEMENT', 'REPORTING');

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
WHERE r.role_name = 'INTERVIEWER' AND p.permission_name IN
('INTERVIEW_MANAGEMENT'); -- Chỉ có quyền liên quan phỏng vấn

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM roles r, permissions p
-- ----- SỬA: Đổi CANDIDATE thành APPLICANT -----
WHERE r.role_name = 'APPLICANT' AND p.permission_name IN
('TEST_TAKING'); -- Chỉ có quyền làm test

-- Insert admin user (password: admin123) - Giả sử role_id của ADMIN là 1
INSERT IGNORE INTO users (username, email, password_hash, full_name, role_id)
VALUES ('admin', 'admin@cs60.com', '$2a$10$8uN2o9m4Qr1UG4lqjJ9iteNWF2cwURVIwO9oM1kyxTqH4tK70QUOy', 'System Administrator', (SELECT role_id FROM roles WHERE role_name = 'ADMIN'));
