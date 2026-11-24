// Every successful JSON response has the shape {success: true, data}.
export const sendSuccess = (res, data, status = 200) => res.status(status).json({ success: true, data });
