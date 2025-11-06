const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define InterviewFeedback model
const InterviewFeedback = sequelize.define('InterviewFeedback', {
  feedback_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  interview_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'interviews',
      key: 'interview_id'
    }
  },
  reviewer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  technical_score: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  communication_score: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  culture_fit_score: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  overall_rating: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  strengths: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  weaknesses: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  recommendation: {
    type: DataTypes.ENUM('STRONG_HIRE', 'HIRE', 'NEUTRAL', 'NO_HIRE', 'STRONG_NO_HIRE'),
    allowNull: false
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  submitted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'interview_feedback',
  timestamps: false
});

module.exports = InterviewFeedback;
