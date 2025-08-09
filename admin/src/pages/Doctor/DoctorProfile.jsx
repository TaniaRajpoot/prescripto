import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData, backendUrl } =
    useContext(DoctorContext);
  const { currency } = useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (dToken) {
      getProfileData();
    }
  }, [dToken]);

  const updateProfile = async () => {
    try {
      const updateData = {
        address: profileData.address,
        fees: profileData.fees,
        available: profileData.available,
      };

      const { data } = await axios.post(
        backendUrl + "/api/doctor/update-profile",
        updateData,
        {
          headers: {
            Authorization: `Bearer ${dToken}`,
          },
        }
      );
      if (data.success) {
        toast.success(data.message);
        setIsEdit(false);
        getProfileData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }

    setIsEdit(false);
  };

  return (
    profileData && (
      <div className="flex flex-col gap-4 m-5">
        <div>
          <div>
            <img
              className="bg-primary/80 w-full sm:max-w-64 rounded-lg object-cover h-64"
              src={profileData.image}
              alt="Doctor profile"
            />
          </div>

          <div className="flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white mt-5">
            {/* Doctor info: name, degree, and experience */}
            <p className="flex items-center gap-2 text-3xl text-gray-700 font-medium">
              {profileData.name}
            </p>

            <div className="flex items-center gap-2 mt-1 text-gray-600">
              <p>
                {profileData.degree} - {profileData.speciality}
              </p>
              <button className="py-0.5 px-2 border border-gray-100 text-xs rounded-full bg-gray-50">
                {profileData.experience}
              </button>
            </div>

            {/* Doctor About */}
            <div className="mt-4">
              <p className="flex items-center gap-1 text-sm font-medium text-neutral-800 mt-3">
                About
              </p>
              <p className="text-sm text-gray-600 max-w-[700px] mt-1">
                {profileData.about}
              </p>
            </div>

            <p className="text-gray-600 font-medium mt-4">
              Appointment Fee:{" "}
              <span className="text-gray-800">
                {currency}{" "}
                {isEdit ? (
                  <input
                    type="number"
                    className="border border-gray-300 rounded px-2 py-1 w-20 ml-1"
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        fees: e.target.value,
                      }))
                    }
                    value={profileData.fees}
                  />
                ) : (
                  profileData.fees
                )}
              </span>
            </p>

            <div className="flex gap-2 py-2 mt-4">
              <p className="font-medium text-gray-600">Address:</p>
              <div className="text-sm">
                {isEdit ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      className="border border-gray-300 rounded px-2 py-1 w-full"
                      placeholder="Address Line 1"
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          address: { ...prev.address, line1: e.target.value },
                        }))
                      }
                      value={profileData.address?.line1 || ""}
                    />
                    <input
                      type="text"
                      className="border border-gray-300 rounded px-2 py-1 w-full"
                      placeholder="Address Line 2"
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          address: { ...prev.address, line2: e.target.value },
                        }))
                      }
                      value={profileData.address?.line2 || ""}
                    />
                  </div>
                ) : (
                  <div>
                    {profileData.address?.line1}
                    <br />
                    {profileData.address?.line2}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2 items-center">
              <input
                className="accent-blue-500"
                checked={profileData.available}
                disabled={!isEdit}
                onChange={(e) =>
                  isEdit &&
                  setProfileData((prev) => ({
                    ...prev,
                    available: e.target.checked,
                  }))
                }
                type="checkbox"
                id="available"
              />
              <label
                htmlFor="available"
                className="text-sm font-medium text-gray-600"
              >
                Available
              </label>
            </div>

            <div className="flex gap-3 mt-5">
              {isEdit ? (
                <>
                  <button
                    onClick={updateProfile}
                    className="px-6 py-2 bg-primary text-white text-sm rounded-full hover:bg-primary/90 transition-all"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEdit(false)}
                    className="px-6 py-2 border border-gray-300 text-sm rounded-full hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEdit(true)}
                  className="px-6 py-2 border border-primary text-primary text-sm rounded-full hover:bg-primary hover:text-white transition-all"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default DoctorProfile;
