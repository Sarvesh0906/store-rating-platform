const { z } = require('zod');

const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

const signupSchema = z.object({
  name: z.string().trim().min(20).max(60),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(16).regex(passwordRegex, {
    message:
      'Password must be 8 to 16 characters and include one uppercase letter and one special character',
  }),
  address: z.string().trim().min(1).max(400),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(16).regex(passwordRegex, {
    message:
      'Password must be 8 to 16 characters and include one uppercase letter and one special character',
  }),
});

module.exports = {
  signupSchema,
  loginSchema,
  changePasswordSchema,
};
