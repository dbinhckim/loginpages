const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define Interview model
const Interview = sequelize.define('Interview', {
  interview_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  application_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'candidate_job_applications',
      key: 'application_id'
    }
  },
  interview_type: {
    type: DataTypes.ENUM('PHONE', 'TECHNICAL', 'HR', 'FINAL'),
    allowNull: false
  },
  scheduled_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  meeting_link: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'),
    defaultValue: 'SCHEDULED'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'interviews',
  timestamps: false
});

module.exports = Interview;
