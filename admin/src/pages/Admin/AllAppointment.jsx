import React from 'react'
import { useContext } from 'react'
import {AdminContext} from '../../context/AdminContext'
import { useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets_admin/assets'


const AllAppointment = () => {

  const {aToken , appointments,getAllAppointments,cancelAppointment} = useContext(AdminContext)
  const{calculateAge,slotDateFormat,currency} = useContext(AppContext)


  useEffect(()=>{

    if (aToken) {
      getAllAppointments()
      
    }

  },[aToken])

  // Sort appointments by newest first (assuming there's a date field like createdAt, _id, or date)
  const sortedAppointments = [...appointments].sort((a, b) => {
    // Option 1: If you have a createdAt field
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    
    // Option 2: If you have a date field
    if (a.date && b.date) {
      return new Date(b.date) - new Date(a.date);
    }
    
    // Option 3: Using MongoDB ObjectId (most reliable for creation time)
    // MongoDB ObjectIds contain timestamp, so newer IDs are "greater"
    if (a._id && b._id) {
      return b._id.localeCompare(a._id);
    }
    
    // Fallback: maintain original order
    return 0;
  });

  return (
    <div className='w-full max-w-6xl m-5'>

      <p className='mb-3 text-lg font-medium'>All Appointments</p>

      <div className='bg-white border border-gray-100 rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll '>

     <div className='hidden sm:grid grid-cols-[0.5fr_2.5fr_1fr_2.5fr_2.5fr_1fr_1fr] py-3 px-6 border-b border-gray-100'>
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Actions</p>
        </div>

       {sortedAppointments.map((item,index)=>(
      <div className='grid grid-cols-[0.5fr_2.5fr_1fr_2.5fr_2.5fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b border-gray-100 hover:bg-gray-50 ' key={item._id || index} >
            <p className='max-sm:hidden'>{index+1}</p>
            <div className='flex items-center gap-2'>
              <img className='w-8 rounded-full' src={item.userData.image} alt="" /><p>{item.userData.name}</p>
            </div>
            <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
            <p>{slotDateFormat(item.slotDate)},{item.slotTime}</p>
            
            <div className='flex items-end gap-2 '>
              <img className='w-8 rounded-full bg-gray-200' src={item.docData.image} alt="" /><p>{item.docData.name}</p>
            </div>
            <p>{currency}{item.amount}</p>
            {item.cancelled 
            ? <p className='text-red-400 text-xs font-medium'>Cancelled</p>
            : <img onClick={()=> cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" />
          }

          </div>
        ))}

      </div>
    </div>
  )
}

export default AllAppointment