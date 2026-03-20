const express = require('express');
const router = express.Router();

const requestVendorPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const isEmailValid = /\S+@\S+\.\S+/.test(email);
    if (!isEmailValid) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // TODO: Implement your actual password reset logic here
    // 1. Check if vendor exists in database
    // 2. Generate OTP (6 digits)
    // 3. Store OTP with expiry time in database
    // 4. Send OTP via email service

    // Example implementation:
    // const vendor = await VendorModel.findOne({ email });
    // if (!vendor) {
    //   return res.status(404).json({ error: 'No account found with this email' });
    // }

    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // await VendorModel.updateOne(
    //   { email },
    //   { resetOtp: otp, resetOtpExpiry: otpExpiry }
    // );

    // await sendEmail(email, 'Your Password Reset OTP', `Your OTP is: ${otp}`);

    console.log(`Password reset requested for: ${email}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'OTP sent successfully to your email' 
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const verifyVendorOTPAndResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      return res.status(400).json({ error: 'Invalid OTP format' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // TODO: Implement your actual OTP verification and password reset logic here
    // 1. Find vendor by email
    // 2. Verify OTP matches and not expired
    // 3. Update password
    // 4. Clear reset OTP fields
    // 5. Optionally invalidate existing sessions

    // Example implementation:
    // const vendor = await VendorModel.findOne({ 
    //   email,
    //   resetOtp: otp,
    //   resetOtpExpiry: { $gt: new Date() }
    // });

    // if (!vendor) {
    //   return res.status(400).json({ error: 'Invalid or expired OTP' });
    // }

    // const hashedPassword = await bcrypt.hash(newPassword, 10);
    // await VendorModel.updateOne(
    //   { email },
    //   { 
    //     password: hashedPassword,
    //     resetOtp: null,
    //     resetOtpExpiry: null
    //   }
    // );

    console.log(`Password reset completed for: ${email}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Password reset successfully' 
    });

  } catch (error) {
    console.error('Password reset verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

router.post('/request-reset', requestVendorPasswordReset);
router.post('/verify-reset', verifyVendorOTPAndResetPassword);

module.exports = router;
