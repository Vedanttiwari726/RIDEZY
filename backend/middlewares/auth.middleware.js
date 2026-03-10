const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const blackListTokenModel = require('../models/blacklistToken.model');
const captainModel = require('../models/captain.model');
const mongoose = require("mongoose");


/* ==========================
   TOKEN EXTRACTOR
========================== */
const extractToken = (req) => {

    let token = null;

    const header = req.headers.authorization;

    if (header && header.toLowerCase().startsWith("bearer "))
        token = header.split(" ")[1];

    if (!token && req.cookies?.token)
        token = req.cookies.token;

    if (!token && req.query?.token)
        token = req.query.token;

    if (!token) return null;

    return token.trim().replace(/"/g, "");
};



/* ==========================
   USER AUTH
========================== */
module.exports.authUser = async (req, res, next) => {
    try {

        const token = extractToken(req);
        if (!token)
            return res.status(401).json({ message: "Unauthorized" });

        const blacklisted = await blackListTokenModel.findOne({ token });
        if (blacklisted)
            return res.status(401).json({ message: "Token blacklisted" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userId =
            decoded._id ||
            decoded.id ||
            decoded.userId ||
            decoded.user;

        if (!mongoose.Types.ObjectId.isValid(userId))
            return res.status(401).json({ message: "Invalid token payload" });

        const user = await userModel.findById(userId);
        if (!user)
            return res.status(401).json({ message: "User not found" });

        req.user = user;
        next();

    } catch (err) {
        console.log("USER AUTH ERROR:", err.message);
        return res.status(401).json({ message: "Unauthorized" });
    }
};



/* ==========================
   CAPTAIN AUTH (FIXED FINAL)
========================== */
module.exports.authCaptain = async (req, res, next) => {
    try {

        const token = extractToken(req);

        if (!token)
            return res.status(401).json({ message: "Unauthorized — No token" });

        const blacklisted = await blackListTokenModel.findOne({ token });
        if (blacklisted)
            return res.status(401).json({ message: "Token blacklisted" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        /* FIX — accept id OR _id */
        const captainId =
            decoded.id ||
            decoded._id ||
            decoded.captainId ||
            decoded.captain;

        if (!mongoose.Types.ObjectId.isValid(captainId))
            return res.status(401).json({ message: "Invalid token id" });

        const captain = await captainModel.findById(captainId);

        if (!captain)
            return res.status(401).json({ message: "Captain not found" });

        req.captain = captain;

        next();

    } catch (err) {
        console.log("CAPTAIN AUTH ERROR:", err.message);
        return res.status(401).json({ message: "Unauthorized" });
    }
};