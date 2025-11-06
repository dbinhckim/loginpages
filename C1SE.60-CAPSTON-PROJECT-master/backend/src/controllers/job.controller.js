const { 
  JobPosition, 
  User, 
  CandidateJobApplication, 
  Candidate 
} = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Create a new job position
exports.createJobPosition = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { 
      title, 
      department, 
      description, 
      requirements 
    } = req.body;

    // Create job position
    const jobPosition = await JobPosition.create({
      title,
      department,
      description,
      requirements,
      is_active: true,
      created_by: req.userId
    }, { transaction: t });

    await t.commit();
    
    logger.info(`New job position created: ${jobPosition.title}`);
    
    return res.status(201).json({
      success: true,
      message: 'Job position created successfully',
      data: jobPosition
    });
    
  } catch (error) {
    await t.rollback();
    logger.error(`Error creating job position: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to create job position',
      error: error.message
    });
  }
};

// Get all job positions
exports.getAllJobPositions = async (req, res) => {
  try {
    const { 
      isActive, 
      search, 
      department,
      page = 1,
      limit = 10
    } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    // Filter by active status if provided
    if (isActive !== undefined) {
      whereClause.is_active = isActive === 'true';
    }
    
    // Filter by department if provided
    if (department) {
      whereClause.department = department;
    }
    
    // Add search filter if provided
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Get job positions with pagination
    const { count, rows: positions } = await JobPosition.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      include: [
        {
          model: User,
          as: 'Creator',
          attributes: ['user_id', 'username', 'full_name']
        }
      ]
    });
    
    return res.status(200).json({
      success: true,
      message: 'Job positions retrieved successfully',
      data: {
        positions,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
    
  } catch (error) {
    logger.error(`Error retrieving job positions: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve job positions',
      error: error.message
    });
  }
};

// Get job position by ID
exports.getJobPositionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const jobPosition = await JobPosition.findByPk(id, {
      include: [
        {
          model: User,
          as: 'Creator',
          attributes: ['user_id', 'username', 'full_name']
        }
      ]
    });
    
    if (!jobPosition) {
      return res.status(404).json({
        success: false,
        message: 'Job position not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Job position retrieved successfully',
      data: jobPosition
    });
    
  } catch (error) {
    logger.error(`Error retrieving job position: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve job position',
      error: error.message
    });
  }
};

// Update job position
exports.updateJobPosition = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { 
      title, 
      department, 
      description, 
      requirements,
      is_active
    } = req.body;
    
    const jobPosition = await JobPosition.findByPk(id, { transaction: t });
    
    if (!jobPosition) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Job position not found'
      });
    }
    
    // Update job position
    await jobPosition.update({
      title: title || jobPosition.title,
      department: department || jobPosition.department,
      description: description || jobPosition.description,
      requirements: requirements || jobPosition.requirements,
      is_active: is_active !== undefined ? is_active : jobPosition.is_active
    }, { transaction: t });
    
    await t.commit();
    
    logger.info(`Job position updated: ${jobPosition.title}`);
    
    return res.status(200).json({
      success: true,
      message: 'Job position updated successfully',
      data: jobPosition
    });
    
  } catch (error) {
    await t.rollback();
    logger.error(`Error updating job position: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to update job position',
      error: error.message
    });
  }
};

// Delete job position
exports.deleteJobPosition = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    const jobPosition = await JobPosition.findByPk(id, { transaction: t });
    
    if (!jobPosition) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Job position not found'
      });
    }
    
    // Check if there are any active applications for this position
    const activeApplications = await CandidateJobApplication.count({
      where: {
        position_id: id,
        status: {
          [Op.notIn]: ['REJECTED', 'HIRED']
        }
      },
      transaction: t
    });
    
    if (activeApplications > 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot delete job position with active applications'
      });
    }
    
    // Delete job position
    await jobPosition.destroy({ transaction: t });
    
    await t.commit();
    
    logger.info(`Job position deleted: ID ${id}`);
    
    return res.status(200).json({
      success: true,
      message: 'Job position deleted successfully'
    });
    
  } catch (error) {
    await t.rollback();
    logger.error(`Error deleting job position: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete job position',
      error: error.message
    });
  }
};

// Create a job application
exports.createJobApplication = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { 
      candidate_id, 
      position_id, 
      recruiter_id,
      status
    } = req.body;
    
    // Check if candidate exists
    const candidate = await Candidate.findByPk(candidate_id, { transaction: t });
    if (!candidate) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }
    
    // Check if position exists
    const position = await JobPosition.findByPk(position_id, { transaction: t });
    if (!position) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Job position not found'
      });
    }
    
    // Check if recruiter exists if provided
    if (recruiter_id) {
      const recruiter = await User.findByPk(recruiter_id, { transaction: t });
      if (!recruiter) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: 'Recruiter not found'
        });
      }
    }
    
    // Check if application already exists
    const existingApplication = await CandidateJobApplication.findOne({
      where: {
        candidate_id,
        position_id,
        status: {
          [Op.notIn]: ['REJECTED']
        }
      },
      transaction: t
    });
    
    if (existingApplication) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Candidate has already applied for this position'
      });
    }
    
    // Create application
    const application = await CandidateJobApplication.create({
      candidate_id,
      position_id,
      recruiter_id: recruiter_id || req.userId,
      status: status || 'APPLIED',
      application_date: new Date()
    }, { transaction: t });
    
    // Update candidate status if needed
    if (candidate.status === 'NEW') {
      await candidate.update({ status: 'SCREENING' }, { transaction: t });
    }
    
    await t.commit();
    
    logger.info(`New job application created: Candidate ID ${candidate_id} for Position ID ${position_id}`);
    
    return res.status(201).json({
      success: true,
      message: 'Job application created successfully',
      data: application
    });
    
  } catch (error) {
    await t.rollback();
    logger.error(`Error creating job application: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to create job application',
      error: error.message
    });
  }
};

// Get job applications
exports.getJobApplications = async (req, res) => {
  try {
    const { 
      candidate_id, 
      position_id, 
      status,
      page = 1,
      limit = 10
    } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    // Filter by candidate if provided
    if (candidate_id) {
      whereClause.candidate_id = candidate_id;
    }
    
    // Filter by position if provided
    if (position_id) {
      whereClause.position_id = position_id;
    }
    
    // Filter by status if provided
    if (status) {
      whereClause.status = status;
    }
    
    // Get applications with pagination
    const { count, rows: applications } = await CandidateJobApplication.findAndCountAll({
      where: whereClause,
      order: [['application_date', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      include: [
        {
          model: Candidate,
          attributes: ['candidate_id', 'first_name', 'last_name', 'email']
        },
        {
          model: JobPosition,
          attributes: ['position_id', 'title', 'department']
        },
        {
          model: User,
          as: 'Recruiter',
          attributes: ['user_id', 'username', 'full_name']
        }
      ]
    });
    
    return res.status(200).json({
      success: true,
      message: 'Job applications retrieved successfully',
      data: {
        applications,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
    
  } catch (error) {
    logger.error(`Error retrieving job applications: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve job applications',
      error: error.message
    });
  }
};

// Update job application status
exports.updateApplicationStatus = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { status, recruiter_id } = req.body;
    
    const application = await CandidateJobApplication.findByPk(id, {
      include: [
        {
          model: Candidate,
          attributes: ['candidate_id', 'status']
        }
      ],
      transaction: t
    });
    
    if (!application) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Job application not found'
      });
    }
    
    // Check if recruiter exists if provided
    if (recruiter_id) {
      const recruiter = await User.findByPk(recruiter_id, { transaction: t });
      if (!recruiter) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: 'Recruiter not found'
        });
      }
    }
    
    // Update application
    await application.update({
      status: status || application.status,
      recruiter_id: recruiter_id || application.recruiter_id
    }, { transaction: t });
    
    // Update candidate status based on application status if needed
    if (status) {
      let candidateStatus = application.Candidate.status;
      
      switch (status) {
        case 'TESTING':
          candidateStatus = 'TESTING';
          break;
        case 'INTERVIEWING':
          candidateStatus = 'INTERVIEWING';
          break;
        case 'OFFERED':
          candidateStatus = 'OFFERED';
          break;
        case 'HIRED':
          candidateStatus = 'HIRED';
          break;
        case 'REJECTED':
          // Only update candidate status if all applications are rejected
          const activeApplications = await CandidateJobApplication.count({
            where: {
              candidate_id: application.candidate_id,
              application_id: { [Op.not]: id },
              status: {
                [Op.notIn]: ['REJECTED']
              }
            },
            transaction: t
          });
          
          if (activeApplications === 0) {
            candidateStatus = 'REJECTED';
          }
          break;
      }
      
      if (candidateStatus !== application.Candidate.status) {
        await Candidate.update(
          { status: candidateStatus },
          { 
            where: { candidate_id: application.candidate_id },
            transaction: t
          }
        );
      }
    }
    
    await t.commit();
    
    logger.info(`Job application ${id} status updated to ${status}`);
    
    return res.status(200).json({
      success: true,
      message: 'Job application status updated successfully',
      data: application
    });
    
  } catch (error) {
    await t.rollback();
    logger.error(`Error updating job application status: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to update job application status',
      error: error.message
    });
  }
};
