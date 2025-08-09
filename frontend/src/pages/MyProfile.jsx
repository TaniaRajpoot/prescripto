import React, { useState } from "react";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import {assets} from '../assets/assets_frontend/assets'
import axios from "axios";
import { toast } from "react-toastify";

const MyProfile = () => {

  const {userData,setUserData,token ,backendUrl,loadUserProfileData} = useContext(AppContext)

  const [isEdit, setIsEdit] = useState(false);
  const [image,setImage] = useState(false);


  const updateUserProfileData = async ()=>{

    try {
      
     const formData = new FormData()

    formData.append('name', userData.name)
    formData.append('phone', userData.phone)
    formData.append('gender', userData.gender)
    formData.append('dob', userData.dob)
    formData.append('address', JSON.stringify(userData.address))

    image && formData.append('image', image)

    const {data} = await axios.post(backendUrl + '/api/user/update-profile',formData,{headers:{token}})
   
    if(data.success){
      toast.success(data.message)
      await loadUserProfileData()
      setIsEdit(false)
      setImage(false)
    }else{
      toast.error(data.message)
    }
  } catch (error) {
      console.log(error)
      toast.error(error.message)
    }

  }

  return userData &&  (
    <div className="max-w-4xl mx-auto mt-10 bg-white rounded-2xl shadow-md px-10 py-8 space-y-8 text-sm text-gray-700">
      

      {/* Profile Image and Name Section */}
      <div className="flex gap-6">
        <div className="flex flex-col items-start">
          {isEdit ? (
            <label htmlFor="image" style={{ cursor: "pointer" }}>
              <div className="inline-block relative cursor-pointer " style={{ position: "relative" }}>
                <img
                  className="w-36 h-32 rounded opacity-75"
                  src={image ? URL.createObjectURL(image) : userData.image}
                  alt="Profile"
                />
                <img
                  src={assets.upload_icon}
                  alt="Upload"
                  className="absolute bottom-12 right-12 w-10 "
                />
              </div>
              <input
                onChange={(e) => setImage(e.target.files[0])}
                type="file"
                id="image"
                hidden
              />
            </label>
          ) : (
            <img
              className="w-32 h-32 object-cover"
              src={userData.image}
              alt="Profile"
            />
          )}
          {isEdit ? (
            <input
              className="bg-gray-100 text-lg font-semibold px-3 py-2 rounded mt-2"
              type="text"
              value={userData.name}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
          ) : (
            <p className="text-3xl font-semibold text-neutral-800 mt-2 border-b-2 border-primary inline-block pb-0 leading-none">
              {userData.name}
            </p>
          )}
        </div>
      </div>

      <hr className="border-zinc-300" />

      {/* Contact Information */}
      <div>
        <h3 className="text-primary font-semibold text-base mb-4 underline underline-offset-4">
          CONTACT INFORMATION
        </h3>
        <div className="grid grid-cols-[120px_1fr] gap-y-4 items-start">
          <span className="font-medium">Email:</span>
          <span className="text-blue-500">{userData.email}</span>

          <span className="font-medium">Phone:</span>
          {isEdit ? (
            <input
              className="bg-gray-100 px-2 py-1 rounded w-full max-w-xs"
              type="text"
              value={userData.phone}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          ) : (
            <span className="text-blue-400">{userData.phone}</span>
          )}

          <span className="font-medium">Address:</span>
          {isEdit ? (
            <div className="space-y-2">
              <input
                className="bg-gray-100 px-2 py-1 rounded w-full"
                onChange={(e) =>
                  setUserData((prev) => ({
                    ...prev,
                    address: { ...prev.address, line1: e.target.value },
                  }))
                }
                value={userData.address.line1}
                type="text"
              />
              <input
                className="bg-gray-100 px-2 py-1 rounded w-full"
                onChange={(e) =>
                  setUserData((prev) => ({
                    ...prev,
                    address: { ...prev.address, line2: e.target.value },
                  }))
                }
                value={userData.address.line2}
                type="text"
              />
            </div>
          ) : (
            <p className="text-gray-500">
              {userData.address.line1}
              <br />
              {userData.address.line2}
            </p>
          )}
        </div>
      </div>

      {/* Basic Info */}
      <div>
        <h3 className="text-primary font-semibold text-base mb-4 underline underline-offset-4">
          BASIC INFORMATION
        </h3>
        <div className="grid grid-cols-[120px_1fr] gap-y-4 items-center">
          <span className="font-medium">Gender:</span>
          {isEdit ? (
            <select
              className="bg-gray-100 px-2 py-1 rounded w-32"
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, gender: e.target.value }))
              }
              value={userData.gender}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          ) : (
            <span className="text-gray-600">{userData.gender}</span>
          )}

          <span className="font-medium">Birthday:</span>
          {isEdit ? (
            <input
              className="bg-gray-100 px-2 py-1 rounded w-40"
              type="date"
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, dob: e.target.value }))
              }
              value={userData.dob}
            />
          ) : (
            <span className="text-gray-600">{userData.dob}</span>
          )}
        </div>
      </div>

      {/* Button at the bottom */}
      <div className="pt-6">
        {isEdit ? (
          <button
            className="bg-primary text-white font-medium px-6 py-2 rounded-full hover:bg-primary/90 transition"
            onClick={updateUserProfileData}
          >
            Save Information
          </button>
        ) : (
          <button
            className="border border-primary text-primary font-medium px-6 py-2 rounded-full hover:bg-primary hover:text-white transition"
            onClick={() => setIsEdit(true)}
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
