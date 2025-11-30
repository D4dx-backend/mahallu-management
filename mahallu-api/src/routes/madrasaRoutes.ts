import express from 'express';
import {
  getAllMadrasas,
  getMadrasaById,
  createMadrasa,
  updateMadrasa,
  deleteMadrasa,
} from '../controllers/madrasaController';
import { authMiddleware } from '../middleware/authMiddleware';
import { tenantMiddleware, tenantFilter } from '../middleware/tenantMiddleware';
import { validationHandler } from '../middleware/validationHandler';
import {
  createMadrasaValidation,
  updateMadrasaValidation,
  getMadrasaValidation,
  deleteMadrasaValidation,
} from '../validations/madrasaValidation';

const router = express.Router();

router.use(authMiddleware);
router.use(tenantMiddleware);
router.use(tenantFilter);

/**
 * @swagger
 * /madrasa:
 *   get:
 *     summary: Get all madrasas
 *     tags: [Madrasa]
 *     description: |
 *       Retrieve all madrasas with pagination and filtering.
 *       **Access:** Super Admin (all tenants), Mahall Admin, Institute User (own tenant)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         example: active
 *         description: Filter by status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         example: darul
 *         description: Search by name, place, or description
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         example: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         example: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of madrasas retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Madrasa'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', getAllMadrasas);

/**
 * @swagger
 * /madrasa/{id}:
 *   get:
 *     summary: Get madrasa by ID
 *     tags: [Madrasa]
 *     description: |
 *       Get a specific madrasa by ID.
 *       **Access:** Super Admin (all tenants), Mahall Admin, Institute User (own tenant)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: '507f1f77bcf86cd799439017'
 *         description: MongoDB ObjectId of the madrasa
 *     responses:
 *       200:
 *         description: Madrasa details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Madrasa'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', getMadrasaValidation, validationHandler, getMadrasaById);

/**
 * @swagger
 * /madrasa:
 *   post:
 *     summary: Create a new madrasa
 *     tags: [Madrasa]
 *     description: |
 *       Create a new madrasa.
 *       **Access:** Super Admin (any tenant), Mahall Admin, Institute User (own tenant)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMadrasaRequest'
 *           examples:
 *             basicMadrasa:
 *               summary: Create basic madrasa
 *               value:
 *                 name: 'Darul Uloom Madrasa'
 *                 place: 'Kozhikode'
 *                 type: 'madrasa'
 *             completeMadrasa:
 *               summary: Create madrasa with all details
 *               value:
 *                 name: 'Darul Uloom Madrasa'
 *                 place: 'Kozhikode'
 *                 type: 'madrasa'
 *                 joinDate: '2024-01-01T00:00:00.000Z'
 *                 description: 'Islamic educational institution'
 *                 contactNo: '9876543210'
 *                 email: 'info@darululoom.in'
 *                 address:
 *                   state: 'Kerala'
 *                   district: 'Kozhikode'
 *                   pinCode: '673001'
 *                   postOffice: 'Kozhikode HO'
 *                 status: 'active'
 *     responses:
 *       201:
 *         description: Madrasa created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Madrasa'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post('/', createMadrasaValidation, validationHandler, createMadrasa);

/**
 * @swagger
 * /madrasa/{id}:
 *   put:
 *     summary: Update madrasa
 *     tags: [Madrasa]
 *     description: |
 *       Update madrasa details.
 *       **Access:** Super Admin (all tenants), Mahall Admin, Institute User (own tenant)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: '507f1f77bcf86cd799439017'
 *         description: MongoDB ObjectId of the madrasa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMadrasaRequest'
 *     responses:
 *       200:
 *         description: Madrasa updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Madrasa'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put('/:id', updateMadrasaValidation, validationHandler, updateMadrasa);

/**
 * @swagger
 * /madrasa/{id}:
 *   delete:
 *     summary: Delete madrasa
 *     tags: [Madrasa]
 *     description: |
 *       Delete a madrasa.
 *       **Access:** Super Admin (all tenants), Mahall Admin, Institute User (own tenant)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: '507f1f77bcf86cd799439017'
 *         description: MongoDB ObjectId of the madrasa
 *     responses:
 *       200:
 *         description: Madrasa deleted successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', deleteMadrasaValidation, validationHandler, deleteMadrasa);

export default router;

