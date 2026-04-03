export const successResponse = (res, payload = {}, status = 200) =>
  res.status(status).json({
    success: true,
    ...payload
  });

export const errorResponse = (res, status, message) =>
  res.status(status).json({
    success: false,
    message
  });
