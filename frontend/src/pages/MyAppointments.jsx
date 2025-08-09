import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const MyAppointments = () => {
  const { backendUrl, token, getDoctorsData } = useContext(AppContext)

  const [appointment, setAppointment] = useState([])
  const [loading, setLoading] = useState(false)
  
  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('_')
    return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
  }

  const getUserAppointemmnt = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })

      if (data.success) {
        setAppointment(data.appointment.reverse())
        console.log(data.appointment)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const cancelAppointment = async (appointmentId) => {
    try {
      setLoading(true)
      const { data } = await axios.post(backendUrl + '/api/user/cancel-appointments', { appointmentId }, { headers: { token } })
      
      if (data.success) {
        console.log("Cancel response:", data);
        console.log("Showing toast with message:", data.message);
        toast.success(data.message)
        
        // Update the appointment list locally for immediate UI update
        setAppointment(prevAppointments => 
          prevAppointments.map(apt => 
            apt._id === appointmentId ? { ...apt, cancelled: true } : apt
          )
        )
        
        // Refresh doctors data to update available slots
        getDoctorsData()
        
        // Also refresh appointments list from server
        setTimeout(() => {
          getUserAppointemmnt()
        }, 500)
        
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  const appointmentRazorpay = async (appointmentId)=>{

    try {
      const {data } = await axios.post(backendUrl + '/api/user/payment-razorpay',{appointmentId},{headers:{token}} )

      if (data.success) {
        console.log(data.order)
        
      }
      
    } catch (error) {
       console.log(error)
      toast.error(error.response?.data?.message || error.message)
    }

  }

  useEffect(() => {
    if (token) {
      getUserAppointemmnt()
    }
  }, [token])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b border-gray-300'>My Appointment</p>
      <div>
        {appointment.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No appointments found</p>
          </div>
        ) : (
          appointment.map((item, index) => (
            <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b border-gray-300' key={index}>
              <div>
                <img className='w-32 bg-indigo-50' src={item.docData.image} alt="" />
              </div>
              <div className='flex-1 text-sm text-zinc-600'>
                <p className='text-neutral-800 font-semibold'>{item.docData.name}</p>
                <p>{item.docData.speciality}</p>
                <p className='text-zinc-700 font-medium mt-1'>Address:</p>
                <p className='text-xs'>{item.docData.address.line1}</p>
                <p className='text-xs'>{item.docData.address.line2}</p>
                <p className='text-xs mt-1'>
                  <span className='text-sm text-neutral-700 font-medium'>Date & Time:</span> {slotDateFormat(item.slotDate)} | {item.slotTime}
                </p>
              </div>
              <div></div>
              <div className='flex flex-col gap-2 justify-end'>
                {!item.cancelled &&  !item.isCompleted && (
                  <button onClick={() => appointmentRazorpay(item._id)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300'>
                    Pay Online
                  </button>
                )}
                {!item.cancelled &&  !item.isCompleted &&  (
                  <button 
                    onClick={() => cancelAppointment(item._id)} 
                    disabled={loading}
                    className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-500 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {loading ? 'Cancelling...' : 'Cancel Appointment'}
                  </button>
                )}
                {item.cancelled &&  !item.isCompleted &&  (
                  <button className='sm:min-w-46 py-2 border border-red-500 rounded text-red-500'>
                    Appointment Cancelled
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default MyAppointments