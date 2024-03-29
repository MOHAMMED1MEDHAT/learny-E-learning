const Notification = require("./../controllers/notificationsController");
const router = require("express").Router();

//get all user notification
router.get("/", Notification.getAllNotificationsByUserId);

//delete all user notification
router.delete("/", Notification.deleteAllNotificationsByUserId);

module.exports = router;
