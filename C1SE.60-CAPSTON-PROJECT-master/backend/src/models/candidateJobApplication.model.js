const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define CandidateJobApplication model
const CandidateJobApplication = sequelize.define('CandidateJobApplication', {
  application_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  candidate_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'candidates',
      key: 'candidate_id'
    }
  },
  position_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'job_positions',
      key: 'position_id'
    }
  },
  application_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('APPLIED', 'SCREENING', 'TESTING', 'INTERVIEWING', 'OFFERED', 'HIRED', 'REJECTED'),
    defaultValue: 'APPLIED'
  },
  recruiter_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  }
}, {
  tableName: 'candidate_job_applications',
  timestamps: false
});

module.exports = CandidateJobApplication;
