import React, { useRef, useState, useContext, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FinishRide from '../components/FinishRide'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import LiveTracking from '../components/LiveTracking'
import { SocketContext } from '../context/SocketContext'

const CaptainRiding = () => {

    const { socket } = useContext(SocketContext)

    const [finishRidePanel, setFinishRidePanel] = useState(false)
    const finishRidePanelRef = useRef(null)

    const location = useLocation()
    const rideData = location.state?.ride


    /* ================= JOIN RIDE ROOM ================= */

    useEffect(()=>{

        if(!socket || !rideData?._id) return

        console.log("Driver joining ride room:", rideData._id)

        socket.emit("join-ride-room",{
            rideId: rideData._id
        })

    },[socket,rideData])


    /* ================= START RIDE ================= */

    const startRide = () => {

        if (!socket || !rideData) return

        console.log("Start Ride Clicked:", rideData._id)

        socket.emit("ride-started",{
            rideId: rideData._id
        })

    }


    /* ================= DRIVER LIVE LOCATION ================= */

    useEffect(()=>{

        if(!socket || !rideData) return

        if(!navigator.geolocation){
            console.log("Geolocation not supported")
            return
        }

        const watchId = navigator.geolocation.watchPosition((pos)=>{

            const location = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
            }

            socket.emit("update-location-captain",{

                captainId: rideData.captain?._id || rideData.captain,
                rideId: rideData._id,
                location

            })

            console.log("Driver location sent:",location)

        },
        (err)=>{
            console.log("GPS error:",err)
        },
        {
            enableHighAccuracy:true,
            maximumAge:10000,
            timeout:5000
        })

        return ()=>{
            navigator.geolocation.clearWatch(watchId)
        }

    },[socket,rideData])


    /* ================= GSAP PANEL ================= */

    useGSAP(() => {

        if (finishRidePanel) {

            gsap.to(finishRidePanelRef.current,{
                transform:'translateY(0)'
            })

        } else {

            gsap.to(finishRidePanelRef.current,{
                transform:'translateY(100%)'
            })

        }

    },[finishRidePanel])


    return (

        <div className='h-screen relative flex flex-col justify-end'>

            {/* TOP BAR */}

            <div className='fixed p-6 top-0 flex items-center justify-between w-screen'>

                <img
                    className='w-16'
                    src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
                    alt=""
                />

                <Link
                    to='/captain-home'
                    className='h-10 w-10 bg-white flex items-center justify-center rounded-full'
                >
                    <i className="text-lg font-medium ri-logout-box-r-line"></i>
                </Link>

            </div>


            {/* START RIDE PANEL */}

            <div className='h-1/5 p-6 flex items-center justify-between relative bg-yellow-400 pt-10'>

                <h4 className='text-xl font-semibold'>
                    Ride in progress
                </h4>

                <div className='flex gap-3'>

                    <button
                        onClick={startRide}
                        className='bg-green-600 text-white font-semibold p-3 px-8 rounded-lg'
                    >
                        Start Ride
                    </button>

                    {/* OPEN FINISH PANEL */}

                    <button
                        onClick={()=>setFinishRidePanel(true)}
                        className='bg-black text-white font-semibold p-3 px-8 rounded-lg'
                    >
                        End Ride
                    </button>

                </div>

            </div>


            {/* FINISH RIDE PANEL */}

            <div
                ref={finishRidePanelRef}
                className='fixed w-full z-[500] bottom-0 translate-y-full bg-white px-3 py-10 pt-12'
            >

                <FinishRide
                    ride={rideData}
                    setFinishRidePanel={setFinishRidePanel}
                />

            </div>


            {/* MAP */}

            <div className='h-screen fixed w-screen top-0 z-[-1]'>

                <LiveTracking
                    pickup={rideData?.pickup}
                    destination={rideData?.destination}
                />

            </div>

        </div>

    )
}

export default CaptainRiding