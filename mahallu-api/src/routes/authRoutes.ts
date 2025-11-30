import express from 'express';
import { login, getCurrentUser, changePassword, sendOTP, verifyOTP } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validationHandler } from '../middleware/validationHandler';
import {
  loginValidation,
  sendOTPValidation,
  verifyOTPValidation,
  changePasswordValidation,
} from '../validations/authValidation';

const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with phone and password
 *     tags: [Authentication]
 *     description: Authenticate user with phone number and password. Returns JWT token.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - password
 *             properties:
 *               phone:
 *                 type: string
 *                 pattern: '^[0-9]{10}$'
 *                 example: '9999999999'
 *                 description: 10-digit phone number
 *               password:
 *                 type: string
 *                 example: 'admin123'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account is inactive
 */
router.post('/login', loginValidation, validationHandler, login);

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Send OTP to phone number
 *     tags: [Authentication]
 *     description: Send a 6-digit OTP to the user's phone number for login
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 pattern: '^[0-9]{10}$'
 *                 example: '9999999999'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 otp:
 *                   type: string
 *                   description: OTP code (only in development)
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         description: User not found
 *       429:
 *         description: Too many OTP requests
 */
router.post('/send-otp', sendOTPValidation, validationHandler, sendOTP);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP and login
 *     tags: [Authentication]
 *     description: Verify OTP code and authenticate user. Returns JWT token.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - otp
 *             properties:
 *               phone:
 *                 type: string
 *                 pattern: '^[0-9]{10}$'
 *                 example: '9999999999'
 *               otp:
 *                 type: string
 *                 pattern: '^[0-9]{6}$'
 *                 example: '123456'
 *     responses:
 *       200:
 *         description: OTP verified and login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid or expired OTP
 *       403:
 *         description: Account is inactive
 *       429:
 *         description: Too many failed attempts
 */
router.post('/verify-otp', verifyOTPValidation, validationHandler, verifyOTP);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Authentication]
 *     description: Get details of the currently authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authMiddleware, getCurrentUser);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Authentication]
 *     description: Change password for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: 'oldpassword123'
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: 'newpassword123'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Current password is incorrect
 */
router.post('/change-password', authMiddleware, changePasswordValidation, validationHandler, changePassword);

export default router;

