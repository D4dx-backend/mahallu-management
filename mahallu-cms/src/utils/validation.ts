import { z } from 'zod';

export const phoneSchema = z.string().regex(/^[0-9]{10}$/, 'Phone number must be 10 digits');

export const emailSchema = z.string().email('Invalid email address').optional().or(z.literal(''));

export const requiredString = z.string().min(1, 'This field is required');

export const optionalString = z.string().optional();

