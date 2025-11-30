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

const deathSchema = z.object({
  deceasedName: z.string().min(1, 'Deceased name is required'),
  deathDate: z.string().min(1, 'Death date is required'),
  placeOfDeath: z.string().optional(),
  causeOfDeath: z.string().optional(),
  mahallId: z.string().optional(),
  informantName: z.string().optional(),
  informantRelation: z.string().optional(),
  informantPhone: z.string().optional(),
  remarks: z.string().optional(),
});

type DeathFormData = z.infer<typeof deathSchema>;

export default function CreateDeathRegistration() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DeathFormData>({
    resolver: zodResolver(deathSchema),
    defaultValues: {
      deathDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: DeathFormData) => {
    try {
      setError(null);
      await registrationService.createDeath({
        deceasedName: data.deceasedName,
        deathDate: data.deathDate,
        placeOfDeath: data.placeOfDeath,
        causeOfDeath: data.causeOfDeath,
        mahallId: data.mahallId,
        informantName: data.informantName,
        informantRelation: data.informantRelation,
        informantPhone: data.informantPhone,
        remarks: data.remarks,
      });
      navigate(ROUTES.REGISTRATIONS.DEATH);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create death registration. Please try again.');
      console.error('Error creating registration:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Death Registration</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Register a death</p>
        </div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Death Registrations', path: ROUTES.REGISTRATIONS.DEATH },
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
              label="Deceased Name"
              {...register('deceasedName')}
              error={errors.deceasedName?.message}
              required
              placeholder="Deceased Name"
              className="md:col-span-2"
            />
            <Input
              label="Death Date"
              type="date"
              {...register('deathDate')}
              error={errors.deathDate?.message}
              required
            />
            <Input label="Place of Death" {...register('placeOfDeath')} placeholder="Place of Death" />
            <Input label="Cause of Death" {...register('causeOfDeath')} placeholder="Cause of Death" />
            <Input label="Mahall ID" {...register('mahallId')} placeholder="Mahall ID" />
            <h3 className="md:col-span-2 text-lg font-semibold text-gray-900 dark:text-gray-100 mt-4">Informant Information</h3>
            <Input label="Informant Name" {...register('informantName')} placeholder="Informant Name" />
            <Input label="Relation" {...register('informantRelation')} placeholder="Relation to Deceased" />
            <Input label="Informant Phone" type="tel" {...register('informantPhone')} placeholder="Phone Number" />
            <Input
              label="Remarks"
              {...register('remarks')}
              placeholder="Remarks"
              className="md:col-span-2"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.REGISTRATIONS.DEATH)}>
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

