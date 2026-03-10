const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');

const connectToDb = require('./db/db');

const userRoutes = require('./routes/user.routes');
const captainRoutes = require('./routes/captain.routes');
const mapsRoutes = require('./routes/maps.routes');
const rideRoutes = require('./routes/ride.routes');
const couponRoutes = require("./routes/coupon.routes");



/* 🔥 NEW PROFILE ROUTES */
const profileRoutes = require('./routes/profileRoutes');
const safetyRoutes = require("./routes/safety.routes");


connectToDb();

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Hello World');
});

/* EXISTING ROUTES */
app.use('/users', userRoutes);
app.use('/captains', captainRoutes);
app.use('/maps', mapsRoutes);
app.use('/rides', rideRoutes);

/* 🔥 NEW PROFILE ROUTE */
app.use('/profile', profileRoutes);
app.use("/safety", safetyRoutes);
app.use("/coupon",couponRoutes);

module.exports = app;