import React, { useState } from "react";
import profile_pic from "../assets/assets_frontend/profile_pic.png";

const MyProfile = () => {
  const [userData, setUserData] = useState({
    name: "Tania Ashraf",
    image: profile_pic,
    email: "rajpoottania299@gmail.com",
    phone: "+1 123 456 7890",
    address: {
      line1: "57th Cross, Richmond",
      line2: "Circle, Church Road, London",
    },
    gender: "Male",
    dob: "2001-01-20",
  });

  const [isEdit, setIsEdit] = useState(false);

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white rounded-2xl shadow-md px-10 py-8 space-y-8 text-sm text-gray-700">
      {/* Top Section: Profile Picture and Name (Name under Image) */}
      <div className="flex gap-6">
        <div className="flex flex-col items-start">
          <img
            className="w-32 h-32 rounded-full object-cover"
            src={userData.image}
            alt="Profile"
          />
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
            onClick={() => setIsEdit(false)}
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
