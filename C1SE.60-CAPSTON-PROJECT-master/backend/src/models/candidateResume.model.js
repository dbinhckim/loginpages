const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define Candidate Resume model
const CandidateResume = sequelize.define('CandidateResume', {
  resume_id: {
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
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  file_type: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  uploaded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  is_primary: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'candidate_resumes',
  timestamps: false
});

module.exports = CandidateResume;
