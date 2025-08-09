import validator from "validator";
import bcrypt from "bcryptjs";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModels.js";
import appointmentModel from "../models/appointmentModel.js";
import razorpay from "razorpay";

//api for register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !password || !email) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // Validating email format
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    // Validating strong password
    if (password.length < 8) {
      return res.json({ success: false, message: "Enter a strong password" });
    }

    // Check if user already exists
    const isExisting = await userModel.findOne({ email });
    if (isExisting) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    return res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

//api for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      return res.json({ success: true, token });
    } else {
      return res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

//Api to get user profile data
const getProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const userData = await userModel.findById(userId).select("-password");
    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

//API to update the user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Data Missing" });
    }

    let parsedAddress = address;
    if (typeof address === "string") {
      try {
        parsedAddress = JSON.parse(address);
      } catch (e) {
        // If parsing fails, keep as string or handle as needed
      }
    }

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: parsedAddress,
      dob,
      gender,
    });

    if (imageFile) {
      //upload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageURL = imageUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, { image: imageURL });
    }

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

//API to book appointment
const bookAppointment = async (req, res) => {
  try {
    const { docId, slotDate, slotTime } = req.body;
    const userId = req.userId;

    // Validate required fields
    if (!docId || !slotDate || !slotTime) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    // Always use string for slotDate and slotTime
    const slotDateKey = String(slotDate);
    const slotTimeStr = String(slotTime);

    console.log("Booking request:", { docId, slotDateKey, slotTimeStr }); // Debug log

    // Check if an appointment already exists for this doctor, date, and time
    const existingAppointment = await appointmentModel.findOne({
      docId,
      slotDate: slotDateKey,
      slotTime: slotTimeStr,
      cancelled: { $ne: true }, // Don't count cancelled appointments
    });

    if (existingAppointment) {
      return res.json({ success: false, message: "Slot not available" });
    }

    // Check if the slot is already booked in the doctor's slots_booked
    const doctorData = await doctorModel.findById(docId);
    if (!doctorData) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    const bookedSlotsForDate = doctorData.slots_booked?.[slotDateKey] || [];

    // Normalize time format for comparison
    const normalizeTime = (timeStr) => {
      return timeStr.toLowerCase().replace(/\s+/g, "").replace(/^0/, "");
    };

    const normalizedRequestTime = normalizeTime(slotTimeStr);
    const normalizedBookedTimes = bookedSlotsForDate.map((time) =>
      normalizeTime(time)
    );

    console.log("Normalized request time:", normalizedRequestTime);
    console.log("Normalized booked times:", normalizedBookedTimes);

    if (normalizedBookedTimes.includes(normalizedRequestTime)) {
      return res.json({ success: false, message: "Slot already booked" });
    }

    // Atomically add slot to doctor's slots_booked
    const updateResult = await doctorModel.updateOne(
      { _id: docId },
      { $addToSet: { [`slots_booked.${slotDateKey}`]: slotTimeStr } }
    );

    console.log("Doctor update result:", updateResult);

    // Fetch updated doctor and user data for appointment
    const docData = await doctorModel.findById(docId).select("-password");
    const userData = await userModel.findById(userId).select("-password");

    // Don't include slots_booked in appointment data to keep it clean
    const cleanDocData = { ...docData.toObject() };
    delete cleanDocData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData: cleanDocData,
      slotDate: slotDateKey,
      slotTime: slotTimeStr,
      amount: docData.fees,
      date: Date.now(),
      cancelled: false,
    };

    const newAppointment = new appointmentModel(appointmentData);
    const savedAppointment = await newAppointment.save();

    console.log("Appointment saved:", savedAppointment._id);

    return res.json({ success: true, message: "Appointment Booked" });
  } catch (error) {
    console.error("Booking error:", error);
    return res.json({ success: false, message: error.message });
  }
};

//APi to get all list of user appointment  for frontend  my-appointment page
const listAppointemnt = async (req, res) => {
  try {
    // const {userId} = req.body
    const userId = req.userId;

    const appointment = await appointmentModel.find({ userId });

    res.json({ success: true, appointment });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

//Api to cancel the appointment
const cancelAppointment = async (req, res) => {
  try {
    // Get userId from middleware (req.userId) and appointmentId from request body
    const userId = req.userId;
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.json({
        success: false,
        message: "Appointment ID is required",
      });
    }

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    // Verify appointment user
    if (appointmentData.userId.toString() !== userId) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    // Update appointment to cancelled
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // Release doctor slot
    const { docId, slotDate, slotTime } = appointmentData;

    const docData = await doctorModel.findById(docId);

    if (docData && docData.slots_booked && docData.slots_booked[slotDate]) {
      let slots_booked = { ...docData.slots_booked };
      slots_booked[slotDate] = slots_booked[slotDate].filter(
        (e) => e !== slotTime
      );

      await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    }

    return res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const razorpayInstance = new razorpay({
  key_id: process.env.RAZOR_PAY_KEY_ID,
  key_secret: process.env.RAZOR_PAY_SECRET_KEY,
});

//Api to make payment using razor pay
const paymentRazorpay = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    //creating options for razor payment
    const options = {
      amount: appointmentData.amount * 100,
      currency: process.env.CURRENCY,
      receipt: appointmentId,
    };

    //creation of an order
    const order = await razorpayInstance.orders.create(options);
    return res.json({ success: true, order });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointemnt,
  cancelAppointment,
  paymentRazorpay,
};
