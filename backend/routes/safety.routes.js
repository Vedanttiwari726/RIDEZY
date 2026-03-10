const express = require("express");
const router = express.Router();

const { authUser } = require("../middlewares/auth.middleware");
const { triggerSOS } = require("../controllers/safetyController");

router.post("/sos", authUser, triggerSOS);

module.exports = router;