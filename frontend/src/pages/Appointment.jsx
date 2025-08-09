import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import verified_icon from '../assets/assets_frontend/verified_icon.svg';
import info_icon from '../assets/assets_frontend/info_icon.svg';
import RelatedDoctors from '../components/RelatedDoctors';
import { toast } from 'react-toastify';
import axios from 'axios';

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } = useContext(AppContext);
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null);
  const [docSlot, setDocSlot] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');

  const fetchDocInfo = async () => {
    // First try to get from context
    const docInfo = doctors.find(doc => doc._id === docId);
    if (docInfo) {
      setDocInfo(docInfo);
    }
    
    // Also fetch fresh data from API to ensure we have latest slots_booked
    try {
      const { data } = await axios.get(backendUrl + `/api/user/doctor/${docId}`);
      if (data.success) {
        setDocInfo(data.doctor);
      }
    } catch (error) {
      console.log('Error fetching fresh doctor data:', error);
      // Fallback to context data if API fails
      if (docInfo) {
        setDocInfo(docInfo);
      }
    }
  };

  // Normalize time format for consistent comparison
  const normalizeTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.toLowerCase().replace(/\s+/g, '').replace(/^0/, '');
  };

  const getAvailableSlot = async () => {
    if (!docInfo) return;

    console.log('Doctor slots_booked:', docInfo.slots_booked); // Debug log

    const slotsBooked = docInfo.slots_booked || {};
    let allSlots = [];
    let today = new Date();

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      let endTime = new Date();
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0);

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10);
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      let timeSlots = [];

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });

        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();
        const slotDate = day + "_" + month + "_" + year;

        // Get booked times for this date
        const bookedTimesForDate = slotsBooked[slotDate] || [];
        
        console.log(`Checking slot ${slotDate} at ${formattedTime}`); // Debug log
        console.log('Booked times for this date:', bookedTimesForDate); // Debug log

        // Normalize both the current time and booked times for comparison
        const normalizedCurrentTime = normalizeTime(formattedTime);
        const normalizedBookedTimes = bookedTimesForDate.map(time => normalizeTime(time));

        console.log('Normalized current time:', normalizedCurrentTime); // Debug log
        console.log('Normalized booked times:', normalizedBookedTimes); // Debug log

        const isSlotAvailable = !normalizedBookedTimes.includes(normalizedCurrentTime);

        console.log('Is slot available:', isSlotAvailable); // Debug log

        if (isSlotAvailable) {
          timeSlots.push({
            dateTime: new Date(currentDate),
            time: formattedTime,
          });
        }

        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      // Only add days that have available slots
      if (timeSlots.length > 0) {
        allSlots.push(timeSlots);
      }
    }

    console.log('Final available slots:', allSlots); // Debug log
    setDocSlot(allSlots);
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.warn("Login to book appointment");
      return navigate('/login');
    }

    if (!slotTime) {
      toast.warn("Please select a time slot");
      return;
    }

    try {
      const date = docSlot[slotIndex][0].dateTime;
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      const slotDate = day + "_" + month + "_" + year;

      console.log('Booking appointment:', { docId, slotDate, slotTime }); // Debug log

      const { data } = await axios.post(
        backendUrl + '/api/user/book-appointment',
        { docId, slotDate, slotTime },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        
        // Immediately update the local doctor info with the booked slot
        const updatedDocInfo = { ...docInfo };
        if (!updatedDocInfo.slots_booked) {
          updatedDocInfo.slots_booked = {};
        }
        if (!updatedDocInfo.slots_booked[slotDate]) {
          updatedDocInfo.slots_booked[slotDate] = [];
        }
        updatedDocInfo.slots_booked[slotDate].push(slotTime);
        setDocInfo(updatedDocInfo);
        
        // Reset selections
        setSlotTime("");
        setSlotIndex(0);
        
        // Refresh doctors data in background
        getDoctorsData();
        
        // Navigate to appointments page
        navigate('/my-appointment');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    if (docInfo) {
      // Reset slot selection when doctor info changes
      setSlotTime("");
      setSlotIndex(0);
      getAvailableSlot();
    }
  }, [docInfo]);

  return docInfo && (
    <div>
      {/*----DoctorsDetails----  */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div>
          <img className='bg-primary w-full sm:mx-w-72 rounded-lg' src={docInfo.image} alt="" />
        </div>

        <div className='flex-1 border border-gray-400 rounded-lg p-8 bg-white mx-2 sm-0 mt-[-80px] sm:mt-0 '>
          <p className='flex items-center gap-2 text-2xl font-medium text-gray-900 '>
            {docInfo.name} <img className='w-5' src={verified_icon} alt="" />
          </p>
          <div className='flex items-center gap-2 text-sm mt-1 text-gray-600'>
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className='py-0.5 px-2 border text-sx rounded-full '>{docInfo.experience}</button>
          </div>
          <div>
            <p className='flex items-center gap-1 text-sm font-medium text-gray-900 mt-3 '>
              About <img src={info_icon} alt="" />
            </p>
            <p className='text-sm text-gray-500 max-w-[700px] mt-1'>{docInfo.about}</p>
          </div>
          <p className='text-gray-500 font-medium mt-4'>
            Appointment fee: <span className='text-gray-600'>{currencySymbol}{docInfo.fees}</span>
          </p>
        </div>
      </div>

      {/* ---Booking slots ----  */}
      <div className='sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700'>
        <p>Booking Slots</p>

        <div className='flex gap-3 items-center w-full overflow-x-scroll mt-4'>
          {
            docSlot.length > 0 ? docSlot.map((item, index) => (
              <div 
                onClick={() => {
                  setSlotIndex(index);
                  setSlotTime(''); // Reset time selection when date changes
                }} 
                className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ? 'bg-primary text-white ' : 'border border-gray-200'}`} 
                key={index}
              >
                <p>{item[0] && daysOfWeek[item[0].dateTime.getDay()]}</p>
                <p>{item[0] && item[0].dateTime.getDate()}</p>
              </div>
            )) : (
              <div className='text-center py-6 px-4'>
                <p className='text-gray-400'>No available slots for the next 7 days</p>
              </div>
            )
          }
        </div>

        <div className='flex items-center gap-3 w-full overflow-x-scroll mt-4 '>
          {docSlot.length > 0 && docSlot[slotIndex] && docSlot[slotIndex].map((item, index) => (
            <p 
              onClick={() => setSlotTime(item.time)} 
              className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-primary text-white' : 'text-gray-400 border border-gray-300'}`} 
              key={index}
            >
              {item.time.toLowerCase()}
            </p>
          ))}
          {docSlot.length > 0 && docSlot[slotIndex] && docSlot[slotIndex].length === 0 && (
            <p className='text-gray-400'>No available time slots for this day</p>
          )}
        </div>

        <button 
          onClick={bookAppointment} 
          disabled={!slotTime}
          className={`text-sm font-light px-14 py-3 rounded-full my-6 ${slotTime ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
        >
          Book an Appointment
        </button>

        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
      </div>
    </div>
  );
};

export default Appointment;