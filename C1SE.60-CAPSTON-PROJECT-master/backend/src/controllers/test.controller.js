const { Test, Question, TestQuestion, User, sequelize } = require('../models');
const logger = require('../utils/logger');

/**
 * Test management controller
 */
const testController = {
  /**
   * Get all tests with pagination and filters
   */
  getAllTests: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        isActive
      } = req.query;
      
      const offset = (page - 1) * limit;
      
      // Build where conditions
      const whereConditions = {};
      if (isActive !== undefined) whereConditions.is_active = isActive === 'true';
      
      // Add search condition if provided
      if (search) {
        whereConditions[sequelize.Op.or] = [
          { test_name: { [sequelize.Op.like]: `%${search}%` } },
          { description: { [sequelize.Op.like]: `%${search}%` } }
        ];
      }
      
      // Get tests with pagination
      const { count, rows: tests } = await Test.findAndCountAll({
        where: whereConditions,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            model: User,
            as: 'Creator',
            attributes: ['user_id', 'username', 'full_name']
          }
        ],
        order: [['created_at', 'DESC']]
      });
      
      // Calculate total pages
      const totalPages = Math.ceil(count / limit);
      
      return res.status(200).json({
        success: true,
        data: {
          tests,
          pagination: {
            total: count,
            totalPages,
            currentPage: parseInt(page),
            limit: parseInt(limit)
          }
        }
      });
      
    } catch (error) {
      logger.error(`Get all tests error: ${error.message}`);
      return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi lấy danh sách bài test' });
    }
  },
  
  /**
   * Get test by ID with all details including questions
   */
  getTestById: async (req, res) => {
    try {
      const testId = req.params.id;
      
      // Get test with details
      const test = await Test.findByPk(testId, {
        include: [
          {
            model: Question,
            through: {
              attributes: ['question_order', 'score_weight']
            },
            include: [
              {
                model: User,
                as: 'Creator',
                attributes: ['user_id', 'username', 'full_name']
              }
            ]
          },
          {
            model: User,
            as: 'Creator',
            attributes: ['user_id', 'username', 'full_name']
          }
        ]
      });
      
      if (!test) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bài test' });
      }
      
      return res.status(200).json({
        success: true,
        data: test
      });
      
    } catch (error) {
      logger.error(`Get test by ID error: ${error.message}`);
      return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi lấy thông tin bài test' });
    }
  },
  
  /**
   * Create new test
   */
  createTest: async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
      const {
        test_name,
        description,
        duration_minutes,
        passing_score,
        questions
      } = req.body;
      
      // Validate input
      if (!test_name) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: 'Tên bài test là bắt buộc' });
      }
      
      if (!duration_minutes || isNaN(duration_minutes) || duration_minutes <= 0) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: 'Thời gian làm bài phải lớn hơn 0' });
      }
      
      // Create test
      const newTest = await Test.create({
        test_name,
        description,
        duration_minutes,
        passing_score: passing_score || null,
        is_active: true,
        created_by: req.user.user_id,
        created_at: new Date(),
        updated_at: new Date()
      }, { transaction });
      
      // Add questions if provided
      if (questions && questions.length > 0) {
        // Validate questions
        const questionIds = questions.map(q => q.question_id);
        const existingQuestions = await Question.findAll({
          where: { question_id: questionIds }
        });
        
        if (existingQuestions.length !== questionIds.length) {
          await transaction.rollback();
          return res.status(400).json({ success: false, message: 'Một số câu hỏi không tồn tại' });
        }
        
        // Add questions to test
        await Promise.all(questions.map((question, index) => {
          return TestQuestion.create({
            test_id: newTest.test_id,
            question_id: question.question_id,
            question_order: question.question_order || index + 1,
            score_weight: question.score_weight || 1
          }, { transaction });
        }));
      }
      
      // Commit transaction
      await transaction.commit();
      
      // Get the created test with all details
      const createdTest = await Test.findByPk(newTest.test_id, {
        include: [
          {
            model: Question,
            through: {
              attributes: ['question_order', 'score_weight']
            }
          },
          {
            model: User,
            as: 'Creator',
            attributes: ['user_id', 'username', 'full_name']
          }
        ]
      });
      
      return res.status(201).json({
        success: true,
        message: 'Tạo bài test mới thành công',
        data: createdTest
      });
      
    } catch (error) {
      // Rollback transaction in case of error
      await transaction.rollback();
      
      logger.error(`Create test error: ${error.message}`);
      return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi tạo bài test mới' });
    }
  },
  
  /**
   * Update test
   */
  updateTest: async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
      const testId = req.params.id;
      const {
        test_name,
        description,
        duration_minutes,
        passing_score,
        is_active,
        questions
      } = req.body;
      
      // Check if test exists
      const test = await Test.findByPk(testId);
      
      if (!test) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: 'Không tìm thấy bài test' });
      }
      
      // Update test
      await test.update({
        test_name: test_name || test.test_name,
        description: description !== undefined ? description : test.description,
        duration_minutes: duration_minutes || test.duration_minutes,
        passing_score: passing_score !== undefined ? passing_score : test.passing_score,
        is_active: is_active !== undefined ? is_active : test.is_active,
        updated_at: new Date()
      }, { transaction });
      
      // Update questions if provided
      if (questions) {
        // Delete existing test questions
        await TestQuestion.destroy({
          where: { test_id: testId },
          transaction
        });
        
        // Add new questions
        if (questions.length > 0) {
          // Validate questions
          const questionIds = questions.map(q => q.question_id);
          const existingQuestions = await Question.findAll({
            where: { question_id: questionIds }
          });
          
          if (existingQuestions.length !== questionIds.length) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Một số câu hỏi không tồn tại' });
          }
          
          // Add questions to test
          await Promise.all(questions.map((question, index) => {
            return TestQuestion.create({
              test_id: testId,
              question_id: question.question_id,
              question_order: question.question_order || index + 1,
              score_weight: question.score_weight || 1
            }, { transaction });
          }));
        }
      }
      
      // Commit transaction
      await transaction.commit();
      
      // Get the updated test with all details
      const updatedTest = await Test.findByPk(testId, {
        include: [
          {
            model: Question,
            through: {
              attributes: ['question_order', 'score_weight']
            }
          },
          {
            model: User,
            as: 'Creator',
            attributes: ['user_id', 'username', 'full_name']
          }
        ]
      });
      
      return res.status(200).json({
        success: true,
        message: 'Cập nhật bài test thành công',
        data: updatedTest
      });
      
    } catch (error) {
      // Rollback transaction in case of error
      await transaction.rollback();
      
      logger.error(`Update test error: ${error.message}`);
      return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi cập nhật bài test' });
    }
  },
  
  /**
   * Delete test
   */
  deleteTest: async (req, res) => {
    try {
      const testId = req.params.id;
      
      // Check if test exists
      const test = await Test.findByPk(testId);
      
      if (!test) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bài test' });
      }
      
      // Check if test is being used by any candidate tests
      const candidateTestCount = await CandidateTest.count({
        where: { test_id: testId }
      });
      
      if (candidateTestCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa bài test đã được gán cho ứng viên'
        });
      }
      
      // Delete test (test questions will be cascade deleted)
      await test.destroy();
      
      return res.status(200).json({
        success: true,
        message: 'Xóa bài test thành công'
      });
      
    } catch (error) {
      logger.error(`Delete test error: ${error.message}`);
      return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi xóa bài test' });
    }
  },
  
  /**
   * Add questions to test
   */
  addQuestionsToTest: async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
      const testId = req.params.id;
      const { questions } = req.body;
      
      // Check if test exists
      const test = await Test.findByPk(testId);
      
      if (!test) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: 'Không tìm thấy bài test' });
      }
      
      // Validate input
      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: 'Danh sách câu hỏi không hợp lệ' });
      }
      
      // Validate questions
      const questionIds = questions.map(q => q.question_id);
      const existingQuestions = await Question.findAll({
        where: { question_id: questionIds }
      });
      
      if (existingQuestions.length !== questionIds.length) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: 'Một số câu hỏi không tồn tại' });
      }
      
      // Get existing test questions
      const existingTestQuestions = await TestQuestion.findAll({
        where: { test_id: testId }
      });
      
      // Get max question order
      let maxOrder = 0;
      if (existingTestQuestions.length > 0) {
        maxOrder = Math.max(...existingTestQuestions.map(q => q.question_order));
      }
      
      // Filter out questions that already exist in the test
      const existingQuestionIds = existingTestQuestions.map(q => q.question_id);
      const newQuestions = questions.filter(q => !existingQuestionIds.includes(q.question_id));
      
      if (newQuestions.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: 'Tất cả câu hỏi đã tồn tại trong bài test' });
      }
      
      // Add new questions to test
      await Promise.all(newQuestions.map((question, index) => {
        return TestQuestion.create({
          test_id: testId,
          question_id: question.question_id,
          question_order: question.question_order || maxOrder + index + 1,
          score_weight: question.score_weight || 1
        }, { transaction });
      }));
      
      // Commit transaction
      await transaction.commit();
      
      // Get the updated test with all questions
      const updatedTest = await Test.findByPk(testId, {
        include: [
          {
            model: Question,
            through: {
              attributes: ['question_order', 'score_weight']
            }
          }
        ]
      });
      
      return res.status(200).json({
        success: true,
        message: 'Thêm câu hỏi vào bài test thành công',
        data: updatedTest
      });
      
    } catch (error) {
      // Rollback transaction in case of error
      await transaction.rollback();
      
      logger.error(`Add questions to test error: ${error.message}`);
      return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi thêm câu hỏi vào bài test' });
    }
  },
  
  /**
   * Remove question from test
   */
  removeQuestionFromTest: async (req, res) => {
    try {
      const testId = req.params.testId;
      const questionId = req.params.questionId;
      
      // Check if test exists
      const test = await Test.findByPk(testId);
      
      if (!test) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bài test' });
      }
      
      // Check if question exists in test
      const testQuestion = await TestQuestion.findOne({
        where: {
          test_id: testId,
          question_id: questionId
        }
      });
      
      if (!testQuestion) {
        return res.status(404).json({ success: false, message: 'Câu hỏi không tồn tại trong bài test' });
      }
      
      // Delete test question
      await testQuestion.destroy();
      
      return res.status(200).json({
        success: true,
        message: 'Xóa câu hỏi khỏi bài test thành công'
      });
      
    } catch (error) {
      logger.error(`Remove question from test error: ${error.message}`);
      return res.status(500).json({ success: false, message: 'Đã xảy ra lỗi khi xóa câu hỏi khỏi bài test' });
    }
  }
};

module.exports = testController;
