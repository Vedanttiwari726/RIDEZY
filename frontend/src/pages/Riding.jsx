
import React, { useContext, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { SocketContext } from '../context/SocketContext'
import LiveTracking from '../components/LiveTracking'

const Riding = () => {

    const location = useLocation()
    const navigate = useNavigate()
    const { socket } = useContext(SocketContext)

    const { ride } = location.state || {}

    // Ride end socket listener
    useEffect(() => {

        if (!socket) return

        const handleRideEnd = () => {
            navigate('/home')
        }

        socket.on("ride-ended", handleRideEnd)

        return () => {
            socket.off("ride-ended", handleRideEnd)
        }

    }, [socket, navigate])


    return (
        <div className="h-screen w-full relative">

            {/* Home Button */}
            <Link
                to="/home"
                className="fixed right-4 top-4 z-20 h-10 w-10 bg-white flex items-center justify-center rounded-full shadow-md"
            >
                <i className="text-lg ri-home-5-line"></i>
            </Link>

            {/* MAP SECTION */}
            <div className="h-full w-full">

                <LiveTracking
                    pickup={ride?.pickup}
                    destination={ride?.destination}
                />

            </div>


            {/* FLOATING RIDE INFO CARD */}
            <div className="absolute bottom-0 left-0 w-full bg-white p-5 rounded-t-3xl shadow-lg">

                {/* Captain Info */}
                <div className="flex items-center justify-between">

                    <img
                        className="h-12"
                        src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg"
                        alt="vehicle"
                    />

                    <div className="text-right">
                        <h2 className="text-lg font-medium capitalize">
                            {ride?.captain?.fullname?.firstname}
                        </h2>

                        <h4 className="text-xl font-semibold">
                            {ride?.captain?.vehicle?.plate}
                        </h4>

                        <p className="text-sm text-gray-500">
                            {ride?.captain?.vehicle?.vehicleType}
                        </p>
                    </div>

                </div>


                {/* Ride Details */}
                <div className="mt-5 space-y-3">

                    <div className="flex items-center gap-4">
                        <i className="ri-map-pin-user-fill text-lg"></i>
                        <p className="text-sm text-gray-700">
                            {ride?.pickup}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <i className="ri-map-pin-2-fill text-lg"></i>
                        <p className="text-sm text-gray-700">
                            {ride?.destination}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <i className="ri-currency-line text-lg"></i>
                        <p className="text-lg font-semibold">
                            ₹{ride?.fare}
                        </p>
                    </div>

                </div>


                {/* Payment Button */}
                <button className="w-full mt-5 bg-green-600 text-white font-semibold p-3 rounded-lg">
                    Make a Payment
                </button>

            </div>

        </div>
    )
}

export default Riding

