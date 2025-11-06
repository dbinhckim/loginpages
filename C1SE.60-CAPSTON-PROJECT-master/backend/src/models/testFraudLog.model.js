const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Define TestFraudLog model
const TestFraudLog = sequelize.define('TestFraudLog', {
  log_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  candidate_test_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'candidate_tests',
      key: 'candidate_test_id'
    }
  },
  event_type: {
    type: DataTypes.ENUM('TAB_SWITCH', 'COPY_PASTE', 'MULTIPLE_WINDOWS', 'SCREENSHOT', 'OTHER'),
    allowNull: false
  },
  event_count: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  event_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'test_fraud_logs',
  timestamps: false
});

module.exports = TestFraudLog;
