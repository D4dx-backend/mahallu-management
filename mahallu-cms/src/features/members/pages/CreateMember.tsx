import { useState, useEffect } from 'react';
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
import { memberService } from '@/services/memberService';
import { familyService } from '@/services/familyService';
import { Family } from '@/types';

const memberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  familyId: z.string().min(1, 'Family is required'),
  familyName: z.string().min(1, 'Family Name is required'),
  mahallId: z.string().optional(),
  age: z.number().min(0).max(150).optional().or(z.literal('')),
  gender: z.enum(['male', 'female']).optional().or(z.literal('')),
  bloodGroup: z
    .enum(['A +ve', 'A -ve', 'B +ve', 'B -ve', 'AB +ve', 'AB -ve', 'O +ve', 'O -ve'])
    .optional()
    .or(z.literal('')),
  healthStatus: z.string().optional(),
  phone: z.string().optional(),
  education: z.string().optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;

export default function CreateMember() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loadingFamilies, setLoadingFamilies] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
  });

  const selectedFamilyId = watch('familyId');

  useEffect(() => {
    fetchFamilies();
  }, []);

  useEffect(() => {
    if (selectedFamilyId) {
      const selectedFamily = families.find((f) => f.id === selectedFamilyId);
      if (selectedFamily) {
        setValue('familyName', selectedFamily.houseName);
      }
    }
  }, [selectedFamilyId, families, setValue]);

  const fetchFamilies = async () => {
    try {
      setLoadingFamilies(true);
      const result = await familyService.getAll();
      setFamilies(result.data || []);
    } catch (err) {
      console.error('Error fetching families:', err);
      setFamilies([]);
    } finally {
      setLoadingFamilies(false);
    }
  };

  const onSubmit = async (data: MemberFormData) => {
    try {
      setError(null);
      const memberData = {
        ...data,
        age: data.age === '' ? undefined : Number(data.age),
        gender: data.gender === '' ? undefined : data.gender,
        bloodGroup: data.bloodGroup === '' ? undefined : data.bloodGroup,
      };
      await memberService.create(memberData);
      navigate(ROUTES.MEMBERS.LIST);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create member. Please try again.');
      console.error('Error creating member:', err);
    }
  };

  const genderOptions = [
    { value: '', label: 'Select gender...' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];

  const bloodGroupOptions = [
    { value: '', label: 'Select blood group...' },
    { value: 'A +ve', label: 'A +ve' },
    { value: 'A -ve', label: 'A -ve' },
    { value: 'B +ve', label: 'B +ve' },
    { value: 'B -ve', label: 'B -ve' },
    { value: 'AB +ve', label: 'AB +ve' },
    { value: 'AB -ve', label: 'AB -ve' },
    { value: 'O +ve', label: 'O +ve' },
    { value: 'O -ve', label: 'O -ve' },
  ];

  const familyOptions = [
    { value: '', label: 'Select family...' },
    ...families.map((family) => ({
      value: family.id,
      label: `${family.houseName}${family.mahallId ? ` (${family.mahallId})` : ''}`,
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Create Member
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add a new family member with complete information
          </p>
        </div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Members', path: ROUTES.MEMBERS.LIST },
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

          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Family"
                options={familyOptions}
                {...register('familyId')}
                error={errors.familyId?.message}
                required
                disabled={loadingFamilies}
                className="md:col-span-2"
              />
              <Input
                label="Family Name"
                {...register('familyName')}
                error={errors.familyName?.message}
                required
                disabled
                className="md:col-span-2"
              />
              <Input
                label="Member Name"
                {...register('name')}
                error={errors.name?.message}
                required
                placeholder="Full Name"
                className="md:col-span-2"
              />
              <Input
                label="Mahall ID"
                {...register('mahallId')}
                placeholder="Mahall ID"
              />
              <Input
                label="Age"
                type="number"
                {...register('age', { valueAsNumber: true })}
                error={errors.age?.message}
                placeholder="Age"
                min={0}
                max={150}
              />
              <Select
                label="Gender"
                options={genderOptions}
                {...register('gender')}
                error={errors.gender?.message}
              />
              <Select
                label="Blood Group"
                options={bloodGroupOptions}
                {...register('bloodGroup')}
                error={errors.bloodGroup?.message}
              />
              <Input
                label="Phone"
                type="tel"
                {...register('phone')}
                placeholder="Phone Number"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Additional Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Health Status"
                {...register('healthStatus')}
                placeholder="Health Status"
                className="md:col-span-2"
              />
              <Input
                label="Education"
                {...register('education')}
                placeholder="Education"
                className="md:col-span-2"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.MEMBERS.LIST)}
            >
              <FiX className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              <FiSave className="h-4 w-4 mr-2" />
              Create Member
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

