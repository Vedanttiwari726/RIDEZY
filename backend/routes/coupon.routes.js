const express = require("express");
const router = express.Router();

const { applyCoupon } = require("../services/coupon.service");

router.post("/apply",async(req,res)=>{

try{

const { code,fare } = req.body;

const result = await applyCoupon(code,fare);

res.json(result);

}catch(err){

res.status(400).json({
message:err.message
});

}

});

module.exports = router;