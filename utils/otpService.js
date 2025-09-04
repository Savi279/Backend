const otpStore = {};

export function setOtp(email, otp) {
  otpStore[email] = { otp, expires: Date.now() + 5 * 60000 }; // 5min expiry
}

export function verifyOtp(email, otp) {
  const entry = otpStore[email];
  if (!entry) return false;
  const { otp: storedOtp, expires } = entry;
  if (Date.now() > expires) {
    delete otpStore[email];
    return false;
  }
  if (storedOtp === otp) {
    delete otpStore[email];
    return true;
  }
  return false;
}
