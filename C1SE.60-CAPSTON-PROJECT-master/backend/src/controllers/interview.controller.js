const { 
  Interview, 
  InterviewParticipant, 
  InterviewFeedback, 
  CandidateJobApplication, 
  Candidate, 
  JobPosition, 
  User 
} = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Schedule a new interview
exports.scheduleInterview = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { 
      application_id, 
      interview_type, 
      scheduled_date, 
      duration_minutes, 
      location,
      meeting_link,
      notes,
      participants
    } = req.body;

    // Check if application exists
    const application = await CandidateJobApplication.findByPk(application_id, {
      include: [
        {
          model: Candidate,
          attributes: ['first_name', 'last_name', 'email']
        },
        {
          model: JobPosition,
          attributes: ['title', 'department']
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
    
    // Create interview
    const interview = await Interview.create({
      application_id,
      interview_type,
      scheduled_date,
      duration_minutes,
      location,
      meeting_link,
      notes,
      status: 'SCHEDULED',
      created_by: req.userId
    }, { transaction: t });
    
    // Add participants if provided
    if (participants && participants.length > 0) {
      const participantRecords = participants.map(p => ({
        interview_id: interview.interview_id,
        user_id: p.user_id,
        role: p.role
      }));
      
      await InterviewParticipant.bulkCreate(participantRecords, { transaction: t });
    }
    
    // Update application status to INTERVIEWING if not already
    if (application.status !== 'INTERVIEWING') {
      await application.update({ status: 'INTERVIEWING' }, { transaction: t });
      
      // Update candidate status to INTERVIEWING if not already
      if (application.Candidate.status !== 'INTERVIEWING') {
        await Candidate.update(
          { status: 'INTERVIEWING' },
          { 
            where: { candidate_id: application.candidate_id },
            transaction: t
          }
        );
      }
    }
    
    await t.commit();
    
    logger.info(`New interview scheduled for candidate ${application.Candidate.first_name} ${application.Candidate.last_name} for position ${application.JobPosition.title}`);
    
    return res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      data: interview
    });
    
  } catch (error) {
    await t.rollback();
    logger.error(`Error scheduling interview: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to schedule interview',
      error: error.message
    });
  }
};

// Get all interviews
exports.getAllInterviews = async (req, res) => {
  try {
    const { 
      status, 
      type, 
      start_date, 
      end_date,
      page = 1,
      limit = 10
    } = req.query;
    
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    // Filter by status if provided
    if (status) {
      whereClause.status = status;
    }
    
    // Filter by interview type if provided
    if (type) {
      whereClause.interview_type = type;
    }
    
    // Filter by date range if provided
    if (start_date || end_date) {
      whereClause.scheduled_date = {};
      
      if (start_date) {
        whereClause.scheduled_date[Op.gte] = new Date(start_date);
      }
      
      if (end_date) {
        whereClause.scheduled_date[Op.lte] = new Date(end_date);
      }
    }
    
    // Get interviews with pagination
    const { count, rows: interviews } = await Interview.findAndCountAll({
      where: whereClause,
      order: [['scheduled_date', 'ASC']],
      limit: parseInt(limit),
      offset: offset,
      include: [
        {
          model: CandidateJobApplication,
          include: [
            {
              model: Candidate,
              attributes: ['candidate_id', 'first_name', 'last_name', 'email']
            },
            {
              model: JobPosition,
              attributes: ['position_id', 'title', 'department']
            }
          ]
        },
        {
          model: User,
          as: 'Creator',
          attributes: ['user_id', 'username', 'full_name']
        },
        {
          model: InterviewParticipant,
          include: [
            {
              model: User,
              attributes: ['user_id', 'username', 'full_name', 'email']
            }
          ]
        }
      ]
    });
    
    return res.status(200).json({
      success: true,
      message: 'Interviews retrieved successfully',
      data: {
        interviews,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
    
  } catch (error) {
    logger.error(`Error retrieving interviews: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve interviews',
      error: error.message
    });
  }
};

// Get interview by ID
exports.getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const interview = await Interview.findByPk(id, {
      include: [
        {
          model: CandidateJobApplication,
          include: [
            {
              model: Candidate,
              attributes: ['candidate_id', 'first_name', 'last_name', 'email', 'phone', 'current_position']
            },
            {
              model: JobPosition,
              attributes: ['position_id', 'title', 'department', 'description']
            }
          ]
        },
        {
          model: User,
          as: 'Creator',
          attributes: ['user_id', 'username', 'full_name']
        },
        {
          model: InterviewParticipant,
          include: [
            {
              model: User,
              attributes: ['user_id', 'username', 'full_name', 'email']
            }
          ]
        },
        {
          model: InterviewFeedback,
          include: [
            {
              model: User,
              as: 'Reviewer',
              attributes: ['user_id', 'username', 'full_name']
            }
          ]
        }
      ]
    });
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Interview retrieved successfully',
      data: interview
    });
    
  } catch (error) {
    logger.error(`Error retrieving interview: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve interview',
      error: error.message
    });
  }
};

// Update interview
exports.updateInterview = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { 
      scheduled_date, 
      duration_minutes, 
      location,
      meeting_link,
      notes,
      status
    } = req.body;
    
    const interview = await Interview.findByPk(id, { transaction: t });
    
    if (!interview) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }
    
    // Update interview
    await interview.update({
      scheduled_date: scheduled_date || interview.scheduled_date,
      duration_minutes: duration_minutes || interview.duration_minutes,
      location: location || interview.location,
      meeting_link: meeting_link || interview.meeting_link,
      notes: notes || interview.notes,
      status: status || interview.status
    }, { transaction: t });
    
    await t.commit();
    
    logger.info(`Interview ID ${id} updated`);
    
    return res.status(200).json({
      success: true,
      message: 'Interview updated successfully',
      data: interview
    });
    
  } catch (error) {
    await t.rollback();
    logger.error(`Error updating interview: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to update interview',
      error: error.message
    });
  }
};

// Add interview participants
exports.addInterviewParticipants = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { participants } = req.body;
    
    const interview = await Interview.findByPk(id, { transaction: t });
    
    if (!interview) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }
    
    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Participants array is required'
      });
    }
    
    // Validate participants
    for (const participant of participants) {
      const user = await User.findByPk(participant.user_id, { transaction: t });
      if (!user) {
        await t.rollback();
        return res.status(404).json({
          success: false,
          message: `User ID ${participant.user_id} not found`
        });
      }
      
      // Check if user is already a participant
      const existingParticipant = await InterviewParticipant.findOne({
        where: {
          interview_id: id,
          user_id: participant.user_id
        },
        transaction: t
      });
      
      if (existingParticipant) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: `User ID ${participant.user_id} is already a participant`
        });
      }
    }
    
    // Add participants
    const participantRecords = participants.map(p => ({
      interview_id: id,
      user_id: p.user_id,
      role: p.role
    }));
    
    const createdParticipants = await InterviewParticipant.bulkCreate(participantRecords, { 
      transaction: t,
      returning: true
    });
    
    await t.commit();
    
    logger.info(`Added ${createdParticipants.length} participants to interview ID ${id}`);
    
    return res.status(201).json({
      success: true,
      message: 'Participants added successfully',
      data: createdParticipants
    });
    
  } catch (error) {
    await t.rollback();
    logger.error(`Error adding interview participants: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to add participants',
      error: error.message
    });
  }
};

// Remove interview participant
exports.removeInterviewParticipant = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { interviewId, userId } = req.params;
    
    const participant = await InterviewParticipant.findOne({
      where: {
        interview_id: interviewId,
        user_id: userId
      },
      transaction: t
    });
    
    if (!participant) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }
    
    // Remove participant
    await participant.destroy({ transaction: t });
    
    await t.commit();
    
    logger.info(`Removed participant user ID ${userId} from interview ID ${interviewId}`);
    
    return res.status(200).json({
      success: true,
      message: 'Participant removed successfully'
    });
    
  } catch (error) {
    await t.rollback();
    logger.error(`Error removing interview participant: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove participant',
      error: error.message
    });
  }
};

// Submit interview feedback
exports.submitFeedback = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { 
      technical_score, 
      communication_score, 
      culture_fit_score, 
      overall_rating,
      strengths,
      weaknesses,
      recommendation,
      comments
    } = req.body;
    
    // Check if interview exists
    const interview = await Interview.findByPk(id, { transaction: t });
    
    if (!interview) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }
    
    // Check if user is a participant of the interview
    const isParticipant = await InterviewParticipant.findOne({
      where: {
        interview_id: id,
        user_id: req.userId
      },
      transaction: t
    });
    
    if (!isParticipant) {
      await t.rollback();
      return res.status(403).json({
        success: false,
        message: 'Only interview participants can submit feedback'
      });
    }
    
    // Check if feedback already exists from this user
    const existingFeedback = await InterviewFeedback.findOne({
      where: {
        interview_id: id,
        reviewer_id: req.userId
      },
      transaction: t
    });
    
    if (existingFeedback) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'You have already submitted feedback for this interview'
      });
    }
    
    // Create feedback
    const feedback = await InterviewFeedback.create({
      interview_id: id,
      reviewer_id: req.userId,
      technical_score,
      communication_score,
      culture_fit_score,
      overall_rating,
      strengths,
      weaknesses,
      recommendation,
      comments,
      submitted_at: new Date()
    }, { transaction: t });
    
    // Update interview status if not already completed
    if (interview.status !== 'COMPLETED') {
      await interview.update({ status: 'COMPLETED' }, { transaction: t });
    }
    
    await t.commit();
    
    logger.info(`Feedback submitted for interview ID ${id} by user ID ${req.userId}`);
    
    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
    
  } catch (error) {
    await t.rollback();
    logger.error(`Error submitting interview feedback: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
};

// Get all feedback for an interview
exports.getInterviewFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    
    const feedback = await InterviewFeedback.findAll({
      where: { interview_id: id },
      include: [
        {
          model: User,
          as: 'Reviewer',
          attributes: ['user_id', 'username', 'full_name']
        }
      ],
      order: [['submitted_at', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      message: 'Interview feedback retrieved successfully',
      data: feedback
    });
    
  } catch (error) {
    logger.error(`Error retrieving interview feedback: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve feedback',
      error: error.message
    });
  }
};
