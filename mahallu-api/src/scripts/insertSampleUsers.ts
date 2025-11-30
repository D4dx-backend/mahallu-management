import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Tenant from '../models/Tenant';
import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/database';

dotenv.config();

interface SampleUser {
  name: string;
  phone: string;
  email?: string;
  role: 'super_admin' | 'mahall' | 'survey' | 'institute';
  password: string;
  tenantId?: mongoose.Types.ObjectId | null;
  permissions?: {
    view: boolean;
    add: boolean;
    edit: boolean;
    delete: boolean;
  };
}

const defaultPassword = '123456'; // Default password for all sample users

const sampleUsers: Omit<SampleUser, 'tenantId' | 'password'>[] = [
  // Super Admin
  {
    name: 'Super Admin',
    phone: '9999999999',
    email: 'superadmin@mahallu.com',
    role: 'super_admin',
    permissions: {
      view: true,
      add: true,
      edit: true,
      delete: true,
    },
  },
  // Mahall Users
  {
    name: 'Ahmed Ali',
    phone: '9876543210',
    email: 'ahmed.ali@mahallu.com',
    role: 'mahall',
    permissions: {
      view: true,
      add: true,
      edit: true,
      delete: false,
    },
  },
  {
    name: 'Fatima Khan',
    phone: '9876543211',
    email: 'fatima.khan@mahallu.com',
    role: 'mahall',
    permissions: {
      view: true,
      add: true,
      edit: true,
      delete: false,
    },
  },
  {
    name: 'Mohammed Ibrahim',
    phone: '9876543212',
    email: 'mohammed.ibrahim@mahallu.com',
    role: 'mahall',
    permissions: {
      view: true,
      add: false,
      edit: false,
      delete: false,
    },
  },
  // Survey Users
  {
    name: 'Aisha Rahman',
    phone: '9876543213',
    email: 'aisha.rahman@mahallu.com',
    role: 'survey',
    permissions: {
      view: true,
      add: true,
      edit: false,
      delete: false,
    },
  },
  {
    name: 'Hassan Malik',
    phone: '9876543214',
    email: 'hassan.malik@mahallu.com',
    role: 'survey',
    permissions: {
      view: true,
      add: true,
      edit: true,
      delete: false,
    },
  },
  // Institute Users
  {
    name: 'Zainab Sheikh',
    phone: '9876543215',
    email: 'zainab.sheikh@mahallu.com',
    role: 'institute',
    permissions: {
      view: true,
      add: true,
      edit: true,
      delete: false,
    },
  },
  {
    name: 'Omar Farooq',
    phone: '9876543216',
    email: 'omar.farooq@mahallu.com',
    role: 'institute',
    permissions: {
      view: true,
      add: false,
      edit: false,
      delete: false,
    },
  },
];

async function getOrCreateSampleTenant(): Promise<mongoose.Types.ObjectId | null> {
  try {
    // Try to get the first active tenant
    const existingTenant = await Tenant.findOne({ status: 'active' });
    if (existingTenant) {
      console.log(`✅ Using existing tenant: ${existingTenant.name} (${existingTenant.code})`);
      return existingTenant._id;
    }

    // Create a sample tenant if none exists
    const sampleTenant = new Tenant({
      name: 'Sample Mahallu',
      code: 'SAMPLE001',
      type: 'standard',
      location: 'Kerala',
      address: {
        state: 'Kerala',
        district: 'Kozhikode',
        pinCode: '673001',
        postOffice: 'Kozhikode',
        lsgName: 'Kozhikode Corporation',
        village: 'Kozhikode',
      },
      status: 'active',
      subscription: {
        plan: 'basic',
        startDate: new Date(),
        isActive: true,
      },
      settings: {
        varisangyaAmount: 100,
        features: {},
      },
    });

    await sampleTenant.save();
    console.log(`✅ Created sample tenant: ${sampleTenant.name} (${sampleTenant.code})`);
    return sampleTenant._id;
  } catch (error: any) {
    console.error('Error getting/creating tenant:', error.message);
    return null;
  }
}

async function insertSampleUsers() {
  try {
    await connectDatabase();
    console.log('\n🚀 Starting to insert sample users...\n');

    // Get or create a tenant for non-super-admin users
    const tenantId = await getOrCreateSampleTenant();

    let createdCount = 0;
    let skippedCount = 0;

    for (const userData of sampleUsers) {
      try {
        // Determine tenant ID
        let finalTenantId: mongoose.Types.ObjectId | null = null;
        if (userData.role === 'super_admin') {
          finalTenantId = null;
        } else {
          finalTenantId = tenantId;
        }

        // Check if user already exists
        const existingUser = await User.findOne({
          phone: userData.phone,
          tenantId: finalTenantId,
        });

        if (existingUser) {
          console.log(`⏭️  Skipped: ${userData.name} (${userData.phone}) - already exists`);
          skippedCount++;
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Create user
        const user = new User({
          ...userData,
          password: hashedPassword,
          tenantId: finalTenantId,
          isSuperAdmin: userData.role === 'super_admin',
          status: 'active',
          permissions: userData.permissions || {
            view: false,
            add: false,
            edit: false,
            delete: false,
          },
        });

        await user.save();
        console.log(`✅ Created: ${userData.name} (${userData.phone}) - Role: ${userData.role}`);
        createdCount++;
      } catch (error: any) {
        console.error(`❌ Error creating ${userData.name}:`, error.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Created: ${createdCount} users`);
    console.log(`   Skipped: ${skippedCount} users (already exist)`);
    console.log(`\n🔑 Default password for all users: ${defaultPassword}`);
    console.log('\n✅ Sample users insertion completed!\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

insertSampleUsers();

