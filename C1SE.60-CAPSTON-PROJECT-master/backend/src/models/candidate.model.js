const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define Candidate model
const Candidate = sequelize.define('Candidate', {
  candidate_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    unique: true,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  first_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  current_position: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  years_of_experience: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  education: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  skills: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  source: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('NEW', 'SCREENING', 'TESTING', 'INTERVIEWING', 'OFFERED', 'HIRED', 'REJECTED'),
    defaultValue: 'NEW'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'candidates',
  timestamps: false
});

module.exports = Candidate;
