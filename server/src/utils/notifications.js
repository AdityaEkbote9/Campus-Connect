import { Notification } from "../models/Notification.js";

export const createNotification = async ({ userId, type, title, body, link = "" }) => {
  return Notification.create({
    userId,
    type,
    title,
    body,
    link
  });
};
