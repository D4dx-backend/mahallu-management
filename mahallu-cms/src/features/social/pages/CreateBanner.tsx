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
import { socialService } from '@/services/socialService';

const bannerSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200, 'Title must be at most 200 characters'),
  image: z.string().min(1, 'Image URL is required'),
  link: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type BannerFormData = z.infer<typeof bannerSchema>;

export default function CreateBanner() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      status: 'active',
    },
  });

  const onSubmit = async (data: BannerFormData) => {
    try {
      setError(null);
      const bannerData: any = {
        title: data.title,
        image: data.image,
        status: data.status || 'active',
      };

      if (data.link) bannerData.link = data.link;
      if (data.startDate) bannerData.startDate = data.startDate;
      if (data.endDate) bannerData.endDate = data.endDate;

      await socialService.createBanner(bannerData);
      navigate(ROUTES.SOCIAL.BANNERS);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create banner. Please try again.');
      console.error('Error creating banner:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Banner</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add a new banner</p>
        </div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Banners', path: ROUTES.SOCIAL.BANNERS },
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
              label="Title"
              {...register('title')}
              error={errors.title?.message}
              required
              placeholder="Banner Title"
              className="md:col-span-2"
            />
            <Input
              label="Image URL"
              {...register('image')}
              error={errors.image?.message}
              required
              placeholder="https://example.com/banner.jpg"
              className="md:col-span-2"
            />
            <Input
              label="Link"
              {...register('link')}
              placeholder="https://example.com (Optional)"
              className="md:col-span-2"
            />
            <Input
              label="Start Date"
              type="date"
              {...register('startDate')}
            />
            <Input
              label="End Date"
              type="date"
              {...register('endDate')}
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
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.SOCIAL.BANNERS)}>
              <FiX className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              <FiSave className="h-4 w-4 mr-2" />
              Create Banner
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
