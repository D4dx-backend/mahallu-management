import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createSuperAdmin } from '../utils/createSuperAdmin';
import { connectDatabase } from '../config/database';

dotenv.config();

async function main() {
  try {
    await connectDatabase();
    await createSuperAdmin();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();

