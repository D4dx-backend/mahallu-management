import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiSave, FiX } from 'react-icons/fi';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { ROUTES } from '@/constants/routes';
import { registrationService } from '@/services/registrationService';

const nocSchema = z.object({
  applicantName: z.string().min(1, 'Applicant name is required'),
  applicantPhone: z.string().optional(),
  purpose: z.string().min(1, 'Purpose is required'),
  type: z.enum(['common', 'nikah']),
});

type NOCFormData = z.infer<typeof nocSchema>;

export default function CreateNOC() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nocType = searchParams.get('type') || 'common';
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NOCFormData>({
    resolver: zodResolver(nocSchema),
    defaultValues: {
      type: nocType as 'common' | 'nikah',
    },
  });

  const onSubmit = async (data: NOCFormData) => {
    try {
      setError(null);
      await registrationService.createNOC({
        applicantName: data.applicantName,
        applicantPhone: data.applicantPhone,
        purpose: data.purpose,
        type: data.type,
      });
      navigate(ROUTES.REGISTRATIONS.NOC.COMMON);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create NOC. Please try again.');
      console.error('Error creating NOC:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create NOC</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create a new No Objection Certificate</p>
        </div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'NOC', path: ROUTES.REGISTRATIONS.NOC.COMMON },
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
              label="Applicant Name"
              {...register('applicantName')}
              error={errors.applicantName?.message}
              required
              placeholder="Applicant Name"
            />
            <Input
              label="Applicant Phone"
              type="tel"
              {...register('applicantPhone')}
              placeholder="Phone Number"
            />
            <Select
              label="NOC Type"
              options={[
                { value: 'common', label: 'Common' },
                { value: 'nikah', label: 'Nikah' },
              ]}
              {...register('type')}
              error={errors.type?.message}
              required
            />
            <Input
              label="Purpose"
              {...register('purpose')}
              error={errors.purpose?.message}
              required
              placeholder="Purpose of NOC"
              className="md:col-span-2"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.REGISTRATIONS.NOC.COMMON)}>
              <FiX className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              <FiSave className="h-4 w-4 mr-2" />
              Create NOC
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

