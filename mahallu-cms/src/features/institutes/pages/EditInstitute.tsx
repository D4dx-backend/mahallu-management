import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX } from 'react-icons/fi';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
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

export default function EditInstitute() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InstituteFormData>({
    resolver: zodResolver(instituteSchema),
    defaultValues: {
      'address.state': 'Kerala',
    },
  });

  // Watch state changes to update districts
  const selectedState = watch('address.state');
  
  // Get districts based on selected state
  const districtOptions = selectedState ? getDistrictsByState(selectedState) : [];
  
  // Reset district when state changes
  const handleStateChange = (value: string) => {
    setValue('address.state', value);
    // Only reset district if it's not in the new state's districts
    const newDistricts = getDistrictsByState(value);
    const currentDistrict = watch('address.district');
    if (!newDistricts.find(d => d.value === currentDistrict)) {
      setValue('address.district', '');
    }
  };

  useEffect(() => {
    if (id) {
      fetchInstitute();
    }
  }, [id]);

  const fetchInstitute = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const institute = await instituteService.getById(id);
      setValue('name', institute.name);
      setValue('place', institute.place);
      setValue('type', institute.type as 'institute' | 'program' | 'madrasa');
      setValue('joinDate', institute.joinDate ? new Date(institute.joinDate).toISOString().split('T')[0] : '');
      setValue('description', institute.description || '');
      setValue('contactNo', institute.contactNo || '');
      setValue('email', institute.email || '');
      setValue('status', institute.status || 'active');
      if (institute.address) {
        setValue('address.state', institute.address.state || '');
        setValue('address.district', institute.address.district || '');
        setValue('address.pinCode', institute.address.pinCode || '');
        setValue('address.postOffice', institute.address.postOffice || '');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load institute');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: InstituteFormData) => {
    if (!id) return;
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

      await instituteService.update(id, instituteData);
      navigate(ROUTES.INSTITUTES.LIST);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update institute. Please try again.');
      console.error('Error updating institute:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Institute</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Update institute information</p>
        </div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Institutes', path: ROUTES.INSTITUTES.LIST },
            { label: 'Edit' },
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
            <Input label="Name" {...register('name')} error={errors.name?.message} required />
            <Input label="Place" {...register('place')} error={errors.place?.message} required />
            <Select
              label="Type"
              {...register('type')}
              error={errors.type?.message}
              options={[
                { value: 'institute', label: 'Institute' },
                { value: 'program', label: 'Program' },
                { value: 'madrasa', label: 'Madrasa' },
              ]}
            />
            <Input label="Join Date" type="date" {...register('joinDate')} error={errors.joinDate?.message} />
            <Input label="Contact No" {...register('contactNo')} error={errors.contactNo?.message} />
            <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
            <Select
              label="Status"
              {...register('status')}
              error={errors.status?.message}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
            />
            <div className="md:col-span-2">
              <Input label="Description" {...register('description')} error={errors.description?.message} />
            </div>
            <Select
              label="State"
              options={STATES}
              {...register('address.state', {
                onChange: (e) => handleStateChange(e.target.value),
              })}
              error={errors['address.state']?.message}
            />
            <Select
              label="District"
              options={[
                { value: '', label: 'Select district...' },
                ...districtOptions,
              ]}
              {...register('address.district')}
              error={errors['address.district']?.message}
              disabled={!selectedState || districtOptions.length === 0}
            />
            <Input label="PIN Code" {...register('address.pinCode')} error={errors['address.pinCode']?.message} />
            <Input label="Post Office" {...register('address.postOffice')} error={errors['address.postOffice']?.message} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.INSTITUTES.LIST)}>
              <FiX className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <FiSave className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Updating...' : 'Update Institute'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

