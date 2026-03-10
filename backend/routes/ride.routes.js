const express = require('express')
const router = express.Router()
const { body, query, validationResult } = require('express-validator')

const rideController = require('../controllers/ride.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const rideModel = require('../models/ride.model');


/* ==========================
   VALIDATION CHECK MIDDLEWARE
========================== */
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() })
  next()
}


/* ==========================
   CREATE RIDE (USER)
========================== */
router.post(
  '/create',
  authMiddleware.authUser,
  body('pickup').isString().isLength({ min: 3 }),
  body('destination').isString().isLength({ min: 3 }),
  body('vehicleType').isIn(['auto','bike','sedan','mini','suv']),
  validate,
  rideController.createRide
)


/* ==========================
   GET FARE
========================== */
router.get(
  '/get-fare',
  query('pickup').isString().isLength({ min: 3 }),
  query('destination').isString().isLength({ min: 3 }),
  validate,
  rideController.getFare
)


/* ==========================
   CONFIRM RIDE
========================== */
router.post(
  '/confirm',
  authMiddleware.authCaptain,
  body('rideId').isMongoId(),
  validate,
  rideController.confirmRide
)


/* ==========================
   START RIDE
========================== */
router.get(
  '/start',
  authMiddleware.authCaptain,
  query('rideId').isMongoId(),
  query('otp').isLength({ min: 6, max: 6 }),
  validate,
  rideController.startRide
)


/* ==========================
   END RIDE
========================== */
router.post(
  '/end',
  authMiddleware.authCaptain,
  body('rideId').isMongoId(),
  validate,
  rideController.endRide
)


/* ==========================
   USER HISTORY
========================== */
router.get(
  '/history',
  authMiddleware.authUser,
  rideController.getUserRideHistory
)


/* ==========================
   CAPTAIN HISTORY
========================== */
router.get(
  '/captain/history',
  authMiddleware.authCaptain,
  rideController.getCaptainRideHistory
)


/* ==========================
   ⭐ CAPTAIN TRIPS
========================== */
router.get(
  '/captain/trips',
  authMiddleware.authCaptain,
  rideController.getCaptainTrips
)


/* ==========================
   ⭐ DELETE TRIP HISTORY
========================== */
router.delete(
  '/captain/trips/:id',
  authMiddleware.authCaptain,
  rideController.deleteCaptainTrip
)


/* ==========================
   CAPTAIN EARNINGS
========================== */
router.get(
  '/captain/earnings',
  authMiddleware.authCaptain,
  rideController.getCaptainEarnings
)


/* ==========================
   ⭐ DELETE USER RIDE HISTORY
========================== */
router.delete(
  '/history/:id',
  authMiddleware.authUser,
  async (req, res) => {
    try {

      const ride = await rideModel.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id
      });

      if (!ride)
        return res.status(404).json({
          message: "Ride not found"
        });

      res.json({
        message: "Ride deleted successfully"
      });

    } catch (err) {
      res.status(500).json({
        message: err.message
      });
    }
  }
);


/* CANCEL-RIDE */
router.post(
"/cancel",
authMiddleware.authUser,
rideController.cancelRide
)


/* ==========================
   ⭐ LIVE RIDE SHARING (MOVED LAST)
========================== */
router.get(
  '/:id',
  async (req,res)=>{
    try{

      const ride = await rideModel
      .findById(req.params.id)
      .populate('user')
      .populate('captain')

      if(!ride)
        return res.status(404).json({message:"Ride not found"})

      res.json(ride)

    }catch(err){

      res.status(500).json({message:err.message})

    }
  }
)

module.exports = router