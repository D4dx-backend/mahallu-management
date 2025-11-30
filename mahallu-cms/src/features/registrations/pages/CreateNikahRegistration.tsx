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
import { ROUTES } from '@/constants/routes';
import { registrationService } from '@/services/registrationService';

const nikahSchema = z.object({
  groomName: z.string().min(1, 'Groom name is required'),
  groomAge: z.number().min(0).max(150).optional().or(z.literal('')),
  brideName: z.string().min(1, 'Bride name is required'),
  brideAge: z.number().min(0).max(150).optional().or(z.literal('')),
  nikahDate: z.string().min(1, 'Nikah date is required'),
  mahallId: z.string().optional(),
  waliName: z.string().optional(),
  witness1: z.string().optional(),
  witness2: z.string().optional(),
  mahrAmount: z.number().min(0).optional().or(z.literal('')),
  mahrDescription: z.string().optional(),
  remarks: z.string().optional(),
});

type NikahFormData = z.infer<typeof nikahSchema>;

export default function CreateNikahRegistration() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NikahFormData>({
    resolver: zodResolver(nikahSchema),
    defaultValues: {
      nikahDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: NikahFormData) => {
    try {
      setError(null);
      await registrationService.createNikah({
        groomName: data.groomName,
        groomAge: data.groomAge || undefined,
        brideName: data.brideName,
        brideAge: data.brideAge || undefined,
        nikahDate: data.nikahDate,
        mahallId: data.mahallId,
        waliName: data.waliName,
        witness1: data.witness1,
        witness2: data.witness2,
        mahrAmount: data.mahrAmount || undefined,
        mahrDescription: data.mahrDescription,
        remarks: data.remarks,
      });
      navigate(ROUTES.REGISTRATIONS.NIKAH);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create nikah registration. Please try again.');
      console.error('Error creating registration:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Nikah Registration</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Register a new nikah</p>
        </div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Nikah Registrations', path: ROUTES.REGISTRATIONS.NIKAH },
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
            <h3 className="md:col-span-2 text-lg font-semibold text-gray-900 dark:text-gray-100">Groom Information</h3>
            <Input
              label="Groom Name"
              {...register('groomName')}
              error={errors.groomName?.message}
              required
              placeholder="Groom Name"
            />
            <Input
              label="Groom Age"
              type="number"
              {...register('groomAge', { valueAsNumber: true })}
              error={errors.groomAge?.message}
              placeholder="Age"
            />
            <h3 className="md:col-span-2 text-lg font-semibold text-gray-900 dark:text-gray-100 mt-4">Bride Information</h3>
            <Input
              label="Bride Name"
              {...register('brideName')}
              error={errors.brideName?.message}
              required
              placeholder="Bride Name"
            />
            <Input
              label="Bride Age"
              type="number"
              {...register('brideAge', { valueAsNumber: true })}
              error={errors.brideAge?.message}
              placeholder="Age"
            />
            <h3 className="md:col-span-2 text-lg font-semibold text-gray-900 dark:text-gray-100 mt-4">Nikah Details</h3>
            <Input
              label="Nikah Date"
              type="date"
              {...register('nikahDate')}
              error={errors.nikahDate?.message}
              required
            />
            <Input label="Mahall ID" {...register('mahallId')} placeholder="Mahall ID" />
            <Input label="Wali Name" {...register('waliName')} placeholder="Wali Name" />
            <Input label="Witness 1" {...register('witness1')} placeholder="Witness 1" />
            <Input label="Witness 2" {...register('witness2')} placeholder="Witness 2" />
            <Input
              label="Mahr Amount"
              type="number"
              {...register('mahrAmount', { valueAsNumber: true })}
              error={errors.mahrAmount?.message}
              placeholder="Amount"
            />
            <Input
              label="Mahr Description"
              {...register('mahrDescription')}
              placeholder="Mahr Description"
              className="md:col-span-2"
            />
            <Input
              label="Remarks"
              {...register('remarks')}
              placeholder="Remarks"
              className="md:col-span-2"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.REGISTRATIONS.NIKAH)}>
              <FiX className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              <FiSave className="h-4 w-4 mr-2" />
              Create Registration
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

