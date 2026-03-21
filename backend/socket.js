const socketIo = require("socket.io");
require("./models");

const userModel = require("./models/user.model");
const captainModel = require("./models/captain.model");
const Ride = require("./models/ride.model");

let io;

/* ================= ACTIVE DRIVER CACHE ================= */

const activeDrivers = new Map();

/* ================= TIMER STORE ================= */

const rideTimers = new Map();

/* ================= DEMAND HEATMAP STORE ================= */

let demandZones = [];


/* ================= DEMAND CALCULATION ================= */

const calculateDemandZones = async () => {

  try {

    const pendingRides = await Ride.find({ status: "pending" });
    const onlineDrivers = await captainModel.find({ status: "online" });

    const zones = {};

    pendingRides.forEach((ride) => {

      if (!ride.pickupLat || !ride.pickupLng) return;

      const key =
        `${Math.round(ride.pickupLat * 100) / 100}_${Math.round(ride.pickupLng * 100) / 100}`;

      if (!zones[key]) {
        zones[key] = {
          lat: ride.pickupLat,
          lng: ride.pickupLng,
          demand: 0,
          drivers: 0
        };
      }

      zones[key].demand++;

    });

    onlineDrivers.forEach((driver) => {

      if (!driver.location) return;

      const key =
        `${Math.round(driver.location.lat * 100) / 100}_${Math.round(driver.location.lng * 100) / 100}`;

      if (!zones[key]) {
        zones[key] = {
          lat: driver.location.lat,
          lng: driver.location.lng,
          demand: 0,
          drivers: 0
        };
      }

      zones[key].drivers++;

    });

    demandZones = Object.values(zones).map((z) => {

      const ratio =
        z.drivers === 0
          ? z.demand
          : z.demand / z.drivers;

      let level = "low";

      if (ratio > 2) level = "high";
      else if (ratio > 1) level = "medium";

      return {
        lat: z.lat,
        lng: z.lng,
        level
      };

    });

    if (io) {
      io.emit("demand-zones", demandZones);
    }

  } catch (err) {

    console.log("DEMAND ZONE ERROR:", err.message);

  }

};



/* ================= TIMER START ================= */

const startRideAcceptanceTimer = (rideId) => {

  if (!rideId) return;

  if (rideTimers.has(rideId)) {
    clearTimeout(rideTimers.get(rideId));
  }

  const timer = setTimeout(async () => {

    try {

      const ride = await Ride
        .findById(rideId)
        .populate("user");

      if (!ride || ride.status !== "pending") return;

      ride.status = "cancelled";
      await ride.save();

      const room = `ride-${rideId}`;

      io.to(room).emit("ride-timeout", {
        rideId: rideId.toString()
      });

      rideTimers.delete(rideId);

      console.log("Ride timeout:", rideId);

    } catch (err) {

      console.log("Timer error:", err.message);

    }

  }, 15000);

  rideTimers.set(rideId, timer);

};



/* ================= SOCKET INIT ================= */

function initializeSocket(server) {

  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  setInterval(() => {
    calculateDemandZones();
  }, 10000);


  io.on("connection", (socket) => {

    console.log("Socket Connected:", socket.id);



    /* ================= JOIN USER / DRIVER ================= */

    socket.on("join", async ({ userId, userType }) => {

      if (!userId || !userType) return;

      try {

        if (userType === "user") {

          await userModel.findByIdAndUpdate(
            userId,
            { socketId: socket.id }
          );

          console.log("User connected:", userId, "socket:", socket.id);

        }

        if (userType === "captain") {

          activeDrivers.set(userId.toString(), socket.id);

          await captainModel.findByIdAndUpdate(
            userId,
            {
              socketId: socket.id,
              status: "online",
              isOnline: true
            }
          );

          console.log("Driver online:", userId, "socket:", socket.id);

        }

      } catch (err) {

        console.log("JOIN ERROR:", err.message);

      }

    });



    /* ================= JOIN RIDE ROOM ================= */

    socket.on("join-ride-room", ({ rideId }) => {

      if (!rideId) return;

      const room = `ride-${rideId}`;

      socket.join(room);

      console.log("Socket joined ride room:", room);

    });



    /* ================= DRIVER LOCATION ================= */

    socket.on(
      "update-location-captain",
      async ({ captainId, rideId, location }) => {

        if (!captainId || !location) return;

        try {

          await captainModel.findByIdAndUpdate(
            captainId,
            {
              location: {
                lat: location.lat,
                lng: location.lng
              }
            }
          );

          const room = `ride-${rideId}`;

          io.to(room).emit("driver-location-update", {
            rideId,
            location
          });

        } catch (err) {

          console.log("LOCATION ERROR:", err.message);

        }

      });



    /* ================= RIDE ACCEPT ================= */

    socket.on("ride-accepted", async ({ rideId, captainId }) => {

      try {

        if (!rideId) return;

        if (rideTimers.has(rideId)) {
          clearTimeout(rideTimers.get(rideId));
          rideTimers.delete(rideId);
        }

        const ride = await Ride
          .findById(rideId)
          .populate("user");

        if (!ride) return;

        ride.status = "accepted";
        ride.captain = captainId;

        await ride.save();

        const populatedRide = await Ride
          .findById(rideId)
          .populate("user")
          .populate("captain");

        const room = `ride-${rideId}`;

        io.to(room).emit("ride-accepted", {

          rideId: populatedRide._id.toString(),
          otp: populatedRide.otp,

          captain: {
            fullname: populatedRide.captain?.fullname,
            vehicle: populatedRide.captain?.vehicle,
            location: populatedRide.captain?.location
          }

        });

        console.log("Ride accepted broadcast to room:", room);

      } catch (err) {

        console.log("ACCEPT ERROR:", err.message);

      }

    });



    /* ================= DRIVER ARRIVED ================= */

    socket.on("driver-arrived", ({ rideId }) => {

      const room = `ride-${rideId}`;

      io.to(room).emit("driver-arrived", {
        rideId: rideId.toString()
      });

      console.log("Driver arrived event sent to room:", room);

    });



    /* ================= RIDE START ================= */

    socket.on("ride-started", async ({ rideId }) => {

      try {

        if (!rideId) return;

        console.log("Driver started ride:", rideId);

        const ride = await Ride
          .findById(rideId)
          .populate("captain");

        if (!ride) return;

        ride.status = "ongoing";
        await ride.save();

        const room = `ride-${rideId}`;

        io.to(room).emit("ride-started", {

          rideId: ride._id.toString(),

          captain: {
            fullname: ride.captain?.fullname,
            vehicle: ride.captain?.vehicle,
            location: ride.captain?.location
          }

        });

      } catch (err) {

        console.log("START RIDE ERROR:", err.message);

      }

    });



    /* ================= RIDE END ================= */

    socket.on("ride-ended", async ({ rideId }) => {

      try {

        if (!rideId) return;

        console.log("Ride ending:", rideId);

        const ride = await Ride.findById(rideId);

        if (!ride) return;

        ride.status = "completed";
        await ride.save();

        const room = `ride-${rideId}`;

        io.to(room).emit("ride-ended", {
          rideId: rideId
        });

      } catch (err) {

        console.log("END RIDE ERROR:", err.message);

      }

    });



    /* ================= DISCONNECT ================= */

    socket.on("disconnect", async () => {

      try {

        const captain =
          await captainModel.findOne({ socketId: socket.id });

        if (captain) {

          activeDrivers.delete(captain._id.toString());

          await captainModel.findByIdAndUpdate(
            captain._id,
            {
              status: "offline",
              isOnline: false,
              socketId: null
            }
          );

          console.log("Driver offline:", captain._id);

        }

        console.log("Socket Disconnected:", socket.id);

      } catch (err) {

        console.log("DISCONNECT ERROR:", err.message);

      }

    });

  });

}



/* ================= SAFE SEND ================= */

const sendMessageToSocketId = (socketId, message) => {

  if (!io || !socketId) return;

  const socketExists =
    io.sockets.sockets.get(socketId);

  if (!socketExists) return;

  socketExists.emit(message.event, message.data);

};



module.exports = {
  initializeSocket,
  sendMessageToSocketId,
  startRideAcceptanceTimer,
  activeDrivers   // 🔥 ADD THIS
};