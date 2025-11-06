const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Role = require('./role.model');
const User = require('./user.model');
const Permission = require('./permission.model');
const SystemLog = require('./systemLog.model');
const Candidate = require('./candidate.model');
const QuestionCategory = require('./questionCategory.model');
const Question = require('./question.model');
const QuestionOption = require('./questionOption.model');
const CodingQuestionTemplate = require('./codingQuestionTemplate.model');
const Test = require('./test.model');
const TestQuestion = require('./testQuestion.model');
const CandidateResume = require('./candidateResume.model');
const JobPosition = require('./jobPosition.model');
const CandidateJobApplication = require('./candidateJobApplication.model');
const Interview = require('./interview.model');
const InterviewParticipant = require('./interviewParticipant.model');
const InterviewFeedback = require('./interviewFeedback.model');
const CandidateTest = require('./candidateTest.model');
const CandidateTestAnswer = require('./candidateTestAnswer.model');
const TestFraudLog = require('./testFraudLog.model');
const CandidateTestResult = require('./candidateTestResult.model');

// ===== Thiết lập quan hệ giữa các bảng =====

// User - Role
User.belongsTo(Role, { foreignKey: 'role_id' });
Role.hasMany(User, { foreignKey: 'role_id' });

// Role - Permission (many-to-many without junction model)
Role.belongsToMany(Permission, { through: 'role_permissions', foreignKey: 'role_id', otherKey: 'permission_id' });
Permission.belongsToMany(Role, { through: 'role_permissions', foreignKey: 'permission_id', otherKey: 'role_id' });

// User - SystemLog
User.hasMany(SystemLog, { foreignKey: 'user_id' });
SystemLog.belongsTo(User, { foreignKey: 'user_id' });

// User - Candidate
User.hasOne(Candidate, { foreignKey: 'user_id' });
Candidate.belongsTo(User, { foreignKey: 'user_id' });

// Candidate - CandidateResume
Candidate.hasMany(CandidateResume, { foreignKey: 'candidate_id' });
CandidateResume.belongsTo(Candidate, { foreignKey: 'candidate_id' });

// User - Question
User.hasMany(Question, { foreignKey: 'created_by', as: 'CreatedQuestions' });
Question.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });

// QuestionCategory - Question
QuestionCategory.hasMany(Question, { foreignKey: 'category_id' });
Question.belongsTo(QuestionCategory, { foreignKey: 'category_id' });

// Question - QuestionOption
Question.hasMany(QuestionOption, { foreignKey: 'question_id' });
QuestionOption.belongsTo(Question, { foreignKey: 'question_id' });

// Question - CodingQuestionTemplate
Question.hasMany(CodingQuestionTemplate, { foreignKey: 'question_id' });
CodingQuestionTemplate.belongsTo(Question, { foreignKey: 'question_id' });

// User - Test
User.hasMany(Test, { foreignKey: 'created_by', as: 'CreatedTests' });
Test.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });

// Test - Question
Test.belongsToMany(Question, { through: TestQuestion, foreignKey: 'test_id', otherKey: 'question_id' });
Question.belongsToMany(Test, { through: TestQuestion, foreignKey: 'question_id', otherKey: 'test_id' });

// User - JobPosition
User.hasMany(JobPosition, { foreignKey: 'created_by', as: 'CreatedPositions' });
JobPosition.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });

// Candidate - CandidateJobApplication
Candidate.hasMany(CandidateJobApplication, { foreignKey: 'candidate_id' });
CandidateJobApplication.belongsTo(Candidate, { foreignKey: 'candidate_id' });

// JobPosition - CandidateJobApplication
JobPosition.hasMany(CandidateJobApplication, { foreignKey: 'position_id' });
CandidateJobApplication.belongsTo(JobPosition, { foreignKey: 'position_id' });

// User - CandidateJobApplication
User.hasMany(CandidateJobApplication, { foreignKey: 'recruiter_id', as: 'RecruitedApplications' });
CandidateJobApplication.belongsTo(User, { foreignKey: 'recruiter_id', as: 'Recruiter' });

// CandidateJobApplication - Interview
CandidateJobApplication.hasMany(Interview, { foreignKey: 'application_id' });
Interview.belongsTo(CandidateJobApplication, { foreignKey: 'application_id' });

// User - Interview
User.hasMany(Interview, { foreignKey: 'created_by', as: 'CreatedInterviews' });
Interview.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });

// Interview - InterviewParticipant
Interview.hasMany(InterviewParticipant, { foreignKey: 'interview_id' });
InterviewParticipant.belongsTo(Interview, { foreignKey: 'interview_id' });

// User - InterviewParticipant
User.hasMany(InterviewParticipant, { foreignKey: 'user_id' });
InterviewParticipant.belongsTo(User, { foreignKey: 'user_id' });

// Interview - InterviewFeedback
Interview.hasMany(InterviewFeedback, { foreignKey: 'interview_id' });
InterviewFeedback.belongsTo(Interview, { foreignKey: 'interview_id' });

// User - InterviewFeedback
User.hasMany(InterviewFeedback, { foreignKey: 'reviewer_id', as: 'GivenFeedbacks' });
InterviewFeedback.belongsTo(User, { foreignKey: 'reviewer_id', as: 'Reviewer' });

// Candidate - CandidateTest
Candidate.hasMany(CandidateTest, { foreignKey: 'candidate_id' });
CandidateTest.belongsTo(Candidate, { foreignKey: 'candidate_id' });

// Test - CandidateTest
Test.hasMany(CandidateTest, { foreignKey: 'test_id' });
CandidateTest.belongsTo(Test, { foreignKey: 'test_id' });

// CandidateJobApplication - CandidateTest
CandidateJobApplication.hasMany(CandidateTest, { foreignKey: 'application_id' });
CandidateTest.belongsTo(CandidateJobApplication, { foreignKey: 'application_id' });

// CandidateTest - CandidateTestAnswer
CandidateTest.hasMany(CandidateTestAnswer, { foreignKey: 'candidate_test_id' });
CandidateTestAnswer.belongsTo(CandidateTest, { foreignKey: 'candidate_test_id' });

// Question - CandidateTestAnswer
Question.hasMany(CandidateTestAnswer, { foreignKey: 'question_id' });
CandidateTestAnswer.belongsTo(Question, { foreignKey: 'question_id' });

// CandidateTest - TestFraudLog
CandidateTest.hasMany(TestFraudLog, { foreignKey: 'candidate_test_id' });
TestFraudLog.belongsTo(CandidateTest, { foreignKey: 'candidate_test_id' });

// CandidateTest - CandidateTestResult
CandidateTest.hasOne(CandidateTestResult, { foreignKey: 'candidate_test_id' });
CandidateTestResult.belongsTo(CandidateTest, { foreignKey: 'candidate_test_id' });

// User - CandidateTestResult
User.hasMany(CandidateTestResult, { foreignKey: 'reviewed_by', as: 'ReviewedResults' });
CandidateTestResult.belongsTo(User, { foreignKey: 'reviewed_by', as: 'Reviewer' });

// ===== Xuất đối tượng DB =====
const db = {
  sequelize,
  Sequelize,
  Role,
  User,
  Permission,
  SystemLog,
  Candidate,
  QuestionCategory,
  Question,
  QuestionOption,
  CodingQuestionTemplate,
  Test,
  TestQuestion,
  CandidateResume,
  JobPosition,
  CandidateJobApplication,
  Interview,
  InterviewParticipant,
  InterviewFeedback,
  CandidateTest,
  CandidateTestAnswer,
  TestFraudLog,
  CandidateTestResult
};

module.exports = db;
