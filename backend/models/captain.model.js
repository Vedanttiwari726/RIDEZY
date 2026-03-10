const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const captainSchema = new mongoose.Schema({

    fullname:{
        firstname:{
            type:String,
            required:true,
            minlength:[3,'Firstname must be at least 3 characters long']
        },
        lastname:{
            type:String,
            minlength:[3,'Lastname must be at least 3 characters long']
        }
    },

    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        match:[/^\S+@\S+\.\S+$/,'Please enter a valid email']
    },

    password:{
        type:String,
        required:true,
        select:false
    },

    phone:{
        type:String,
        required:true,
        unique:true,
        match:[/^\d{10}$/,'Please enter valid phone']
    },

    socketId:{
        type:String,
        default:null
    },

    /* DRIVER ONLINE STATUS */
    status:{
        type:String,
        enum:["online","offline"],
        default:"offline"
    },

    /* QUICK BOOLEAN CHECK */
    isOnline:{
        type:Boolean,
        default:false
    },

    /* CURRENT RIDE LOCK */
    currentRide:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"ride",
        default:null
    },

    vehicle:{
        color:{type:String,required:true},
        plate:{type:String,required:true},
        capacity:{type:Number,required:true,min:1},
        vehicleType:{
            type:String,
            required:true,
            enum:["car","motorcycle","auto"]
        }
    },

    location:{
        lat:{type:Number,default:null},
        lng:{type:Number,default:null}
    }

},{timestamps:true})



/* ================= JWT TOKEN ================= */
captainSchema.methods.generateAuthToken=function(){
    return jwt.sign(
        {
            id:this._id.toString(),
            role:"captain",
            email:this.email
        },
        process.env.JWT_SECRET,
        {expiresIn:"24h"}
    )
}



/* ================= PASSWORD MATCH ================= */
captainSchema.methods.comparePassword=async function(password){
    return await bcrypt.compare(password,this.password)
}



/* ================= HASH PASSWORD ================= */
captainSchema.statics.hashPassword=async function(password){
    return await bcrypt.hash(password,10)
}



/* ================= AUTO OFFLINE ON SAVE ================= */
/* prevents ghost drivers after server restart */
captainSchema.pre("save",function(next){
    if(this.isModified("socketId") && !this.socketId){
        this.status="offline"
        this.isOnline=false
    }
    next()
})


module.exports = mongoose.model('captain',captainSchema)