const captainModel = require('../models/captain.model');
const captainService = require('../services/captain.service');
const blackListTokenModel = require('../models/blackListToken.model');
const { validationResult } = require('express-validator');


/* =========================
   REGISTER
========================= */
module.exports.registerCaptain = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

    const { fullname, email, password, vehicle, phone } = req.body;

    const exists = await captainModel.findOne({ email });
    if (exists)
        return res.status(400).json({ message: 'Captain already exist' });

    const hashedPassword = await captainModel.hashPassword(password);

    const captain = await captainService.createCaptain({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword,
        phone,
        status: 'offline',
        color: vehicle.color,
        plate: vehicle.plate,
        capacity: vehicle.capacity,
        vehicleType: vehicle.vehicleType
    });

    const token = captain.generateAuthToken();

    res.status(201).json({ token, captain });
};



/* =========================
   LOGIN
========================= */
module.exports.loginCaptain = async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    const captain = await captainModel.findOne({ email }).select('+password');

    if (!captain)
        return res.status(401).json({ message: 'Invalid email or password' });

    const match = await captain.comparePassword(password);

    if (!match)
        return res.status(401).json({ message: 'Invalid email or password' });

    /* ⭐ LOGIN = ONLINE */
    captain.status = "online";
    captain.isOnline = true;
    await captain.save();

    const token = captain.generateAuthToken();

    res.status(200).json({ token, captain });
};



/* =========================
   PROFILE
========================= */
module.exports.getCaptainProfile = async (req, res) => {
    res.status(200).json({ captain: req.captain });
};



/* =========================
   ONLINE / OFFLINE TOGGLE
========================= */
module.exports.updateOnlineStatus = async (req, res) => {
    try {

        if (!req.captain)
            return res.status(401).json({ message: "Unauthorized" });

        const { isOnline } = req.body;

        const updated = await captainModel.findByIdAndUpdate(
            req.captain._id,
            {
                $set:{
                    isOnline: Boolean(isOnline),
                    status: isOnline ? "online" : "offline"
                }
            },
            { new: true }
        );

        console.log("Driver status:", updated._id, updated.isOnline);

        res.status(200).json({
            success:true,
            isOnline: updated.isOnline
        });

    } catch (err) {
        console.log("STATUS ERROR:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};



/* =========================
   LOGOUT
========================= */
module.exports.logoutCaptain = async (req, res) => {

    try{

        const token = req.headers.authorization?.split(' ')[1];

        if (token)
            await blackListTokenModel.create({ token });

        /* ⭐ LOGOUT = OFFLINE */
        await captainModel.findByIdAndUpdate(
            req.captain._id,
            {
                isOnline:false,
                status:"offline",
                socketId:null
            }
        );

        res.status(200).json({ message: 'Logout successfully' });

    }catch(err){
        res.status(500).json({ message:"Logout error" });
    }
};