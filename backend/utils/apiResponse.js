const sendSuccess = (res, statusCode, data = null) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

module.exports = {
  sendSuccess,
};
