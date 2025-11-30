import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiSave } from 'react-icons/fi';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ROUTES } from '@/constants/routes';
import { familyService } from '@/services/familyService';
import { STATES, getDistrictsByState } from '@/constants/locations';

const familySchema = z.object({
  // Step 1: Place Details
  mahallId: z.string().optional(),
  varisangyaGrade: z.string().optional(),
  houseName: z.string().min(1, 'House Name is required'),
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
  // Step 2: House Details
  familyHead: z.string().optional(),
  // Step 3: Financial Details (can be empty for now)
});

type FamilyFormData = z.infer<typeof familySchema>;

const steps = [
  { id: 1, name: 'Place Details', description: 'Location information' },
  { id: 2, name: 'House Details', description: 'House information' },
  { id: 3, name: 'Financial Details', description: 'Financial information' },
];

export default function CreateFamily() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<FamilyFormData>({
    resolver: zodResolver(familySchema),
    defaultValues: {
      state: 'Kerala',
      district: '',
      pinCode: '678601',
      postOffice: 'Thiruvizhamkunnu',
      lsgName: 'Koodali',
      village: 'Kottoppadam-I',
    },
  });

  // Watch state changes to update districts
  const selectedState = watch('state');
  
  // Get districts based on selected state
  const districtOptions = selectedState ? getDistrictsByState(selectedState) : [];
  
  // Reset district when state changes
  const handleStateChange = (value: string) => {
    setValue('state', value);
    setValue('district', ''); // Reset district when state changes
  };

  const onNext = async () => {
    setError(null);
    let fieldsToValidate: (keyof FamilyFormData)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ['houseName', 'state', 'district', 'lsgName', 'village'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['familyHead'];
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const onPrevious = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: FamilyFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await familyService.create(data);
      navigate(ROUTES.FAMILIES.LIST);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create family. Please try again.');
      console.error('Error creating family:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const gradeOptions = [
    { value: '', label: 'Select an grade...' },
    { value: 'Grade A', label: 'Grade A' },
    { value: 'Grade B', label: 'Grade B' },
    { value: 'Grade C', label: 'Grade C' },
    { value: 'Grade D', label: 'Grade D' },
  ];

  const areaOptions = [
    { value: '', label: 'Select an area...' },
    { value: 'Area A', label: 'Area A' },
    { value: 'Area B', label: 'Area B' },
    { value: 'Area C', label: 'Area C' },
    { value: 'Area D', label: 'Area D' },
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

      {/* Step Indicator */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    currentStep === step.id
                      ? 'border-primary-600 bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                      : currentStep > step.id
                      ? 'border-green-500 bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-400'
                      : 'border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800'
                  }`}
                >
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      currentStep === step.id
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step.name}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Place Details
              </h2>
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
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                House Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Family Head"
                  {...register('familyHead')}
                  placeholder="Family Head Name"
                  className="md:col-span-2"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Review & Submit
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please review all the information before submitting. You can go back to make changes if needed.
              </p>
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm dark:bg-red-900 dark:border-red-700 dark:text-red-200">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={currentStep === 1}
            >
              <FiArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            {currentStep < steps.length ? (
              <Button type="button" onClick={onNext}>
                Next
                <FiArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
                <FiSave className="h-4 w-4 mr-2" />
                Create Family
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}

