import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        required: true,
        type: Number
    }
})

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;