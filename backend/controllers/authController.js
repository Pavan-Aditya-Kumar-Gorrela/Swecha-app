import User from '../models/User.js';
import { sendEmail } from '../utils/email.js';
import { generateCode, generateToken } from '../utils/helpers.js';



// Signup
export const signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({ email, password });
    await user.save();

    const code = generateCode();
    user.verificationCode = code;
    user.verificationCodeExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendEmail(email, 'Verify Your Email', `Your verification code is: ${code}`);
    res.status(201).json({ message: 'User created. Verification code sent.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isVerified) return res.status(400).json({ message: 'Email not verified' });

    const token = generateToken(user._id);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send Verification Code
export const sendVerificationCode = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

    const code = generateCode();
    user.verificationCode = code;
    user.verificationCodeExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendEmail(email, 'Verify Your Email', `Your verification code is: ${code}`);
    res.json({ message: 'Verification code sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify Verification Code
export const verifyVerificationCode = async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

    if (user.verificationCode !== code || user.verificationCodeExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({ message: 'Email verified', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = generateCode();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendEmail(email, 'Reset Your Password', `Your reset code is: ${resetToken}`);
    res.json({ message: 'Reset code sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  const { email, resetToken, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.resetPasswordToken !== resetToken || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

