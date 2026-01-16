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
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ROUTES } from '@/constants/routes';
import { familyService } from '@/services/familyService';
import { tenantService } from '@/services/tenantService';
import { useAuthStore } from '@/store/authStore';

const familySchema = z.object({
  varisangyaGrade: z.string().optional(),
  houseName: z.string().min(1, 'House Name is required'),
  familyHead: z.string().optional(),
  contactNo: z.string().optional().refine(
    (val) => !val || /^\d{10}$/.test(val),
    { message: 'Contact number must be exactly 10 digits' }
  ),
  wardNumber: z.string().optional().refine(
    (val) => !val || /^\d+$/.test(val),
    { message: 'Ward number must contain only digits' }
  ),
  houseNo: z.string().optional(),
  area: z.string().optional(),
  place: z.string().optional(),
});

type FamilyFormData = z.infer<typeof familySchema>;

export default function CreateFamily() {
  const navigate = useNavigate();
  const { currentTenantId, user } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [grades, setGrades] = useState<Array<{ name: string; amount: number }>>([]);
  const [areaOptions, setAreaOptions] = useState<string[]>([]);

  const tenantId = currentTenantId || user?.tenantId;

  useEffect(() => {
    const fetchTenantSettings = async () => {
      if (tenantId) {
        try {
          const tenant = await tenantService.getById(tenantId);
          setGrades(tenant.settings?.varisangyaGrades || []);
          setAreaOptions(tenant.settings?.areaOptions || ['Area A', 'Area B', 'Area C', 'Area D']);
        } catch (err) {
          console.error('Error fetching tenant settings:', err);
        }
      }
    };
    fetchTenantSettings();
  }, [tenantId]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FamilyFormData>({
    resolver: zodResolver(familySchema),
  });

  const onSubmit = async (data: FamilyFormData) => {
    try {
      setError(null);
      await familyService.create(data);
      navigate(ROUTES.FAMILIES.LIST);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create family. Please try again.');
      console.error('Error creating family:', err);
    }
  };

  const gradeOptions = [
    { value: '', label: 'Select grade...' },
    ...grades.map(grade => ({
      value: grade.name,
      label: `${grade.name} - ₹${grade.amount}`
    }))
  ];

  const areaSelectOptions = [
    { value: '', label: 'Select an area...' },
    ...areaOptions.map(area => ({ value: area, label: area }))
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Create Family
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add a new family with complete information
          </p>
        </div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Families', path: ROUTES.FAMILIES.LIST },
            { label: 'Create' },
          ]}
        />
      </div>

      <Card padding="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm dark:bg-red-900 dark:border-red-700 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              error={errors.contactNo?.message}
              placeholder="Contact No. (10 digits)"
              maxLength={10}
            />
            <Input
              label="Ward Number"
              {...register('wardNumber')}
              error={errors.wardNumber?.message}
              placeholder="Ward Number"
              type="number"
            />
            <Input
              label="House No."
              {...register('houseNo')}
              placeholder="House No."
            />
            <Select
              label="Area"
              options={areaSelectOptions}
              {...register('area')}
            />
            <Input
              label="Place"
              {...register('place')}
              placeholder="Place"
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
            <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
              <FiSave className="h-4 w-4 mr-2" />
              Create Family
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

