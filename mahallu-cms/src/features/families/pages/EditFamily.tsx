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
import { familyService } from '@/services/familyService';
import { Family } from '@/types';
import { STATES, getDistrictsByState } from '@/constants/locations';

const familySchema = z.object({
  mahallId: z.string().optional(),
  varisangyaGrade: z.string().optional(),
  houseName: z.string().min(1, 'House Name is required'),
  familyHead: z.string().optional(),
  contactNo: z.string().optional(),
  wardNumber: z.string().optional(),
  houseNo: z.string().optional(),
  area: z.string().optional(),
  place: z.string().optional(),
  via: z.string().optional(),
  state: z.string().min(1, 'State is required'),
  district: z.string().min(1, 'District is required'),
  pinCode: z.string().optional(),
  postOffice: z.string().optional(),
  lsgName: z.string().min(1, 'LSG Name is required'),
  village: z.string().min(1, 'Village is required'),
  status: z.enum(['approved', 'unapproved', 'pending']).optional(),
});

type FamilyFormData = z.infer<typeof familySchema>;

export default function EditFamily() {
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
  } = useForm<FamilyFormData>({
    resolver: zodResolver(familySchema),
    defaultValues: {
      state: 'Kerala',
    },
  });

  // Watch state changes to update districts
  const selectedState = watch('state');
  
  // Get districts based on selected state
  const districtOptions = selectedState ? getDistrictsByState(selectedState) : [];
  
  // Reset district when state changes
  const handleStateChange = (value: string) => {
    setValue('state', value);
    // Only reset district if it's not in the new state's districts
    const newDistricts = getDistrictsByState(value);
    const currentDistrict = watch('district');
    if (!newDistricts.find(d => d.value === currentDistrict)) {
      setValue('district', '');
    }
  };

  useEffect(() => {
    if (id) {
      fetchFamily();
    }
  }, [id]);

  const fetchFamily = async () => {
    try {
      setLoading(true);
      const family = await familyService.getById(id!);
      setValue('mahallId', family.mahallId || '');
      setValue('varisangyaGrade', family.varisangyaGrade || '');
      setValue('houseName', family.houseName);
      setValue('familyHead', family.familyHead || '');
      setValue('contactNo', family.contactNo || '');
      setValue('wardNumber', family.wardNumber || '');
      setValue('houseNo', family.houseNo || '');
      setValue('area', family.area || '');
      setValue('place', family.place || '');
      setValue('via', family.via || '');
      setValue('state', family.state);
      setValue('district', family.district);
      setValue('pinCode', family.pinCode || '');
      setValue('postOffice', family.postOffice || '');
      setValue('lsgName', family.lsgName);
      setValue('village', family.village);
      setValue('status', family.status || 'pending');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load family');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FamilyFormData) => {
    if (!id) return;
    try {
      setError(null);
      await familyService.update(id, data);
      navigate(ROUTES.FAMILIES.LIST);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update family. Please try again.');
      console.error('Error updating family:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const gradeOptions = [
    { value: '', label: 'Select grade...' },
    { value: 'Grade A', label: 'Grade A' },
    { value: 'Grade B', label: 'Grade B' },
    { value: 'Grade C', label: 'Grade C' },
    { value: 'Grade D', label: 'Grade D' },
  ];

  const areaOptions = [
    { value: '', label: 'Select area...' },
    { value: 'Area A', label: 'Area A' },
    { value: 'Area B', label: 'Area B' },
    { value: 'Area C', label: 'Area C' },
    { value: 'Area D', label: 'Area D' },
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'unapproved', label: 'Unapproved' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Edit Family
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Update family information
          </p>
        </div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Families', path: ROUTES.FAMILIES.LIST },
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
            <Input
              label="Mahall ID"
              {...register('mahallId')}
              placeholder="Mahall ID"
            />
            <Select
              label="Varisangya Grade"
              options={gradeOptions}
              {...register('varisangyaGrade')}
            />
            <Input
              label="House Name"
              {...register('houseName')}
              error={errors.houseName?.message}
              required
              placeholder="House Name"
              className="md:col-span-2"
            />
            <Input
              label="Family Head"
              {...register('familyHead')}
              placeholder="Family Head Name"
              className="md:col-span-2"
            />
            <Input
              label="Contact No."
              type="tel"
              {...register('contactNo')}
              placeholder="Contact No."
            />
            <Input
              label="Ward Number"
              {...register('wardNumber')}
              placeholder="Ward Number"
            />
            <Input
              label="House No."
              {...register('houseNo')}
              placeholder="House No."
            />
            <Select
              label="Area"
              options={areaOptions}
              {...register('area')}
            />
            <Input
              label="Place"
              {...register('place')}
              placeholder="Place"
            />
            <Input
              label="Via"
              {...register('via')}
              placeholder="Via"
            />
            <Select
              label="State"
              options={STATES}
              {...register('state', {
                onChange: (e) => handleStateChange(e.target.value),
              })}
              error={errors.state?.message}
              required
            />
            <Select
              label="District"
              options={[
                { value: '', label: 'Select district...' },
                ...districtOptions,
              ]}
              {...register('district')}
              error={errors.district?.message}
              required
              disabled={!selectedState || districtOptions.length === 0}
            />
            <Input
              label="Pin Code"
              {...register('pinCode')}
              placeholder="Pin Code"
            />
            <Input
              label="Post Office"
              {...register('postOffice')}
              placeholder="Post Office"
            />
            <Select
              label="LSG Name"
              options={[
                { value: 'Koodali', label: 'Koodali' },
              ]}
              {...register('lsgName')}
              error={errors.lsgName?.message}
              required
              className="md:col-span-2"
            />
            <Select
              label="Village"
              options={[
                { value: 'Kottoppadam-I', label: 'Kottoppadam-I' },
              ]}
              {...register('village')}
              error={errors.village?.message}
              required
              className="md:col-span-2"
            />
            <Select
              label="Status"
              options={statusOptions}
              {...register('status')}
              className="md:col-span-2"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.FAMILIES.LIST)}
            >
              <FiX className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              <FiSave className="h-4 w-4 mr-2" />
              Update Family
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

