const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');

const captainModel = require('../models/captain.model');

/* AUTH MIDDLEWARE */
const { authCaptain } = require('../middlewares/auth.middleware');

/* CONTROLLERS */
const captainController = require('../controllers/captain.controller');
const rideController = require('../controllers/ride.controller');


/* =========================
   REGISTER
========================= */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Invalid Email'),
    body('fullname.firstname').isLength({ min: 3 }).withMessage('First name min 3'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6'),
    body('vehicle.color').isLength({ min: 3 }).withMessage('Color min 3'),
    body('vehicle.plate').isLength({ min: 3 }).withMessage('Plate min 3'),
    body('vehicle.capacity').isInt({ min: 1 }).withMessage('Capacity min 1'),
    body('vehicle.vehicleType').isIn(['car','motorcycle','auto']).withMessage('Invalid type')
  ],
  captainController.registerCaptain
);


/* =========================
   LOGIN
========================= */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6')
  ],
  captainController.loginCaptain
);


/* =========================
   PROFILE
========================= */
router.get(
  '/profile',
  authCaptain,
  captainController.getCaptainProfile
);


/* =========================
   LOGOUT
========================= */
router.get(
  '/logout',
  authCaptain,
  captainController.logoutCaptain
);


/* =========================
   DASHBOARD (EARNINGS)
========================= */
router.get(
  '/dashboard',
  authCaptain,
  async (req,res)=>{
    try{

      if(!rideController.getCaptainDashboard){
        return res.status(500).json({
          message:"getCaptainDashboard controller missing"
        })
      }

      return rideController.getCaptainDashboard(req,res)

    }catch(err){
      res.status(500).json({message:err.message})
    }
  }
);


/* =========================
   ONLINE / OFFLINE STATUS
========================= */
router.patch(
  '/online-status',
  authCaptain,
  async (req,res)=>{

    try{

      const { isOnline } = req.body

      const updated = await captainModel.findByIdAndUpdate(
        req.captain._id,
        {
          isOnline,
          status: isOnline ? "online" : "offline"
        },
        { new:true }
      )

      return res.json({
        success:true,
        isOnline:updated.isOnline
      })

    }catch(err){

      res.status(500).json({
        message:err.message
      })

    }

  }
)

module.exports = router;