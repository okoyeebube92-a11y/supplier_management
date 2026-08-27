const { getDashboard } = require("../services/dashboardService");

const getDashboardController = async (req, res, next) => {
    try {
        return res.status(200).json(await getDashboard());
    } catch (error) {
        return next(error);
    }
};

module.exports = { getDashboardController };
