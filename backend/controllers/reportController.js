const { createSessionReport } = require('../services/reportService');

const generateReport = async (req, res) => {
  try {
    // Admin ID is available via req.admin populated by authenticateAdmin middleware
    const adminId = req.admin ? req.admin._id : null;
    
    const result = await createSessionReport(req.body, adminId);

    res.status(200).json({
      success: true,
      report: result.reportText,
      savedReport: result.savedReport
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to generate Gemini report'
    });
  }
};

module.exports = { generateReport };