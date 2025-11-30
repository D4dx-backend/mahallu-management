import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiX } from 'react-icons/fi';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { ROUTES } from '@/constants/routes';
import { instituteService } from '@/services/instituteService';
import { STATES, getDistrictsByState } from '@/constants/locations';

const instituteSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  place: z.string().min(1, 'Place is required'),
  type: z.enum(['institute', 'program', 'madrasa']),
  joinDate: z.string().min(1, 'Join Date is required'),
  description: z.string().optional(),
  contactNo: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  'address.state': z.string().optional(),
  'address.district': z.string().optional(),
  'address.pinCode': z.string().optional(),
  'address.postOffice': z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});

type InstituteFormData = z.infer<typeof instituteSchema>;

export default function CreateInstitute() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InstituteFormData>({
    resolver: zodResolver(instituteSchema),
    defaultValues: {
      type: 'institute',
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      'address.state': 'Kerala',
      'address.district': '',
    },
  });

  // Watch state changes to update districts
  const selectedState = watch('address.state');
  
  // Get districts based on selected state
  const districtOptions = selectedState ? getDistrictsByState(selectedState) : [];
  
  // Reset district when state changes
  const handleStateChange = (value: string) => {
    setValue('address.state', value);
    setValue('address.district', ''); // Reset district when state changes
  };

  const onSubmit = async (data: InstituteFormData) => {
    try {
      setError(null);
      const instituteData: any = {
        name: data.name,
        place: data.place,
        type: data.type,
        joinDate: data.joinDate,
        description: data.description,
        contactNo: data.contactNo,
        email: data.email || undefined,
        status: data.status || 'active',
      };

      if (data['address.state'] || data['address.district']) {
        instituteData.address = {
          state: data['address.state'],
          district: data['address.district'],
          pinCode: data['address.pinCode'],
          postOffice: data['address.postOffice'],
        };
      }

      await instituteService.create(instituteData);
      navigate(ROUTES.INSTITUTES.LIST);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create institute. Please try again.');
      console.error('Error creating institute:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Create Institute
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add a new institute, program, or madrasa
          </p>
        </div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Institutes', path: ROUTES.INSTITUTES.LIST },
            { label: 'Create' },
          ]}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm dark:bg-red-900 dark:border-red-700 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Name"
              {...register('name')}
              error={errors.name?.message}
              required
              placeholder="Institute Name"
              className="md:col-span-2"
            />
            <Select
              label="Type"
              options={[
                { value: 'institute', label: 'Institute' },
                { value: 'program', label: 'Program' },
                { value: 'madrasa', label: 'Madrasa' },
              ]}
              {...register('type')}
              error={errors.type?.message}
              required
            />
            <Input
              label="Place"
              {...register('place')}
              error={errors.place?.message}
              required
              placeholder="Place"
            />
            <Input
              label="Join Date"
              type="date"
              {...register('joinDate')}
              error={errors.joinDate?.message}
              required
            />
            <Input
              label="Contact No."
              type="tel"
              {...register('contactNo')}
              placeholder="Contact Number"
            />
            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="Email (Optional)"
            />
            <Input
              label="Description"
              {...register('description')}
              placeholder="Description"
              className="md:col-span-2"
            />
            <Select
              label="State"
              options={STATES}
              {...register('address.state', {
                onChange: (e) => handleStateChange(e.target.value),
              })}
            />
            <Select
              label="District"
              options={[
                { value: '', label: 'Select district...' },
                ...districtOptions,
              ]}
              {...register('address.district')}
              disabled={!selectedState || districtOptions.length === 0}
            />
            <Input
              label="Pin Code"
              {...register('address.pinCode')}
              placeholder="Pin Code"
            />
            <Input
              label="Post Office"
              {...register('address.postOffice')}
              placeholder="Post Office"
            />
            <Select
              label="Status"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              {...register('status')}
              className="md:col-span-2"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.INSTITUTES.LIST)}
            >
              <FiX className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              <FiSave className="h-4 w-4 mr-2" />
              Create Institute
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

