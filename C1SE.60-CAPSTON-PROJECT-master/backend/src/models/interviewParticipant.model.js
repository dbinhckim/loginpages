const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define InterviewParticipant model
const InterviewParticipant = sequelize.define('InterviewParticipant', {
  interview_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'interviews',
      key: 'interview_id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  role: {
    type: DataTypes.ENUM('INTERVIEWER', 'OBSERVER', 'HR'),
    allowNull: false
  }
}, {
  tableName: 'interview_participants',
  timestamps: false
});

module.exports = InterviewParticipant;
