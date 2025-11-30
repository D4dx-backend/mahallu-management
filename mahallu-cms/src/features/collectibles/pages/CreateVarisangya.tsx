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
import { collectibleService } from '@/services/collectibleService';
import { familyService } from '@/services/familyService';
import { memberService } from '@/services/memberService';
import { Family, Member } from '@/types';

const varisangyaSchema = z.object({
  familyId: z.string().optional(),
  memberId: z.string().optional(),
  amount: z.number().min(0.01, 'Amount is required'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  paymentMethod: z.string().optional(),
  receiptNo: z.string().optional(),
  remarks: z.string().optional(),
});

type VarisangyaFormData = z.infer<typeof varisangyaSchema>;

export default function CreateVarisangya() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VarisangyaFormData>({
    resolver: zodResolver(varisangyaSchema),
    defaultValues: {
      paymentDate: new Date().toISOString().split('T')[0],
    },
  });

  const selectedFamilyId = watch('familyId');

  useEffect(() => {
    fetchFamilies();
  }, []);

  useEffect(() => {
    if (selectedFamilyId) {
      fetchMembers(selectedFamilyId);
    } else {
      setMembers([]);
    }
  }, [selectedFamilyId]);

  const fetchFamilies = async () => {
    try {
      const result = await familyService.getAll();
      setFamilies(result.data || []);
    } catch (err) {
      console.error('Error fetching families:', err);
      setFamilies([]);
    }
  };

  const fetchMembers = async (familyId: string) => {
    try {
      const data = await memberService.getByFamily(familyId);
      setMembers(data);
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  };

  const onSubmit = async (data: VarisangyaFormData) => {
    try {
      setError(null);
      await collectibleService.createVarisangya({
        familyId: data.familyId || undefined,
        memberId: data.memberId || undefined,
        amount: data.amount,
        paymentDate: data.paymentDate,
        paymentMethod: data.paymentMethod,
        receiptNo: data.receiptNo,
        remarks: data.remarks,
      });
      navigate('/collectibles/varisangya');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create varisangya payment. Please try again.');
      console.error('Error creating varisangya:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Varisangya Payment</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Record a new varisangya payment</p>
        </div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Varisangyas', path: '/collectibles/varisangya' },
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
            <Select
              label="Family (Optional)"
              options={[
                { value: '', label: 'Select Family' },
                ...families.map((f) => ({ value: f.id, label: f.houseName })),
              ]}
              {...register('familyId')}
            />
            <Select
              label="Member (Optional)"
              options={[
                { value: '', label: 'Select Member' },
                ...members.map((m) => ({ value: m.id, label: `${m.name} (${m.familyName})` })),
              ]}
              {...register('memberId')}
              disabled={!selectedFamilyId}
            />
            <Input
              label="Amount"
              type="number"
              step="0.01"
              {...register('amount', { valueAsNumber: true })}
              error={errors.amount?.message}
              required
              placeholder="Amount"
            />
            <Input
              label="Payment Date"
              type="date"
              {...register('paymentDate')}
              error={errors.paymentDate?.message}
              required
            />
            <Select
              label="Payment Method"
              options={[
                { value: '', label: 'Select Method' },
                { value: 'cash', label: 'Cash' },
                { value: 'bank', label: 'Bank Transfer' },
                { value: 'cheque', label: 'Cheque' },
                { value: 'online', label: 'Online' },
              ]}
              {...register('paymentMethod')}
            />
            <Input label="Receipt No." {...register('receiptNo')} placeholder="Receipt Number" />
            <Input
              label="Remarks"
              {...register('remarks')}
              placeholder="Remarks"
              className="md:col-span-2"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={() => navigate('/collectibles/varisangya')}>
              <FiX className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              <FiSave className="h-4 w-4 mr-2" />
              Create Payment
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

