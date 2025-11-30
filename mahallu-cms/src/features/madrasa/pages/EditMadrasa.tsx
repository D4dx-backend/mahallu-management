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
import { madrasaService } from '@/services/madrasaService';

const madrasaSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  place: z.string().min(1, 'Place is required'),
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

type MadrasaFormData = z.infer<typeof madrasaSchema>;

export default function EditMadrasa() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MadrasaFormData>({
    resolver: zodResolver(madrasaSchema),
  });

  useEffect(() => {
    if (id) {
      fetchMadrasa();
    }
  }, [id]);

  const fetchMadrasa = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const madrasa = await madrasaService.getById(id);
      setValue('name', madrasa.name);
      setValue('place', madrasa.place);
      setValue('joinDate', madrasa.joinDate ? new Date(madrasa.joinDate).toISOString().split('T')[0] : '');
      setValue('description', madrasa.description || '');
      setValue('contactNo', madrasa.contactNo || '');
      setValue('email', madrasa.email || '');
      setValue('status', madrasa.status || 'active');
      if (madrasa.address) {
        setValue('address.state', madrasa.address.state || '');
        setValue('address.district', madrasa.address.district || '');
        setValue('address.pinCode', madrasa.address.pinCode || '');
        setValue('address.postOffice', madrasa.address.postOffice || '');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load madrasa');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: MadrasaFormData) => {
    if (!id) return;
    try {
      setError(null);
      const madrasaData: any = {
        name: data.name,
        place: data.place,
        joinDate: data.joinDate,
        description: data.description,
        contactNo: data.contactNo,
        email: data.email || undefined,
        status: data.status || 'active',
      };

      if (data['address.state'] || data['address.district']) {
        madrasaData.address = {
          state: data['address.state'],
          district: data['address.district'],
          pinCode: data['address.pinCode'],
          postOffice: data['address.postOffice'],
        };
      }

      await madrasaService.update(id, madrasaData);
      navigate(ROUTES.MADRASA.LIST);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update madrasa. Please try again.');
      console.error('Error updating madrasa:', err);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Madrasa</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Update madrasa information</p>
        </div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Madrasa', path: ROUTES.MADRASA.LIST },
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
            <Input label="State" {...register('address.state')} error={errors['address.state']?.message} />
            <Input label="District" {...register('address.district')} error={errors['address.district']?.message} />
            <Input label="PIN Code" {...register('address.pinCode')} error={errors['address.pinCode']?.message} />
            <Input label="Post Office" {...register('address.postOffice')} error={errors['address.postOffice']?.message} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.MADRASA.LIST)}>
              <FiX className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <FiSave className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Updating...' : 'Update Madrasa'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

