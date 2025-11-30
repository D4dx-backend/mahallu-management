import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ROUTES } from '@/constants/routes';
import { registrationService, DeathRegistration } from '@/services/registrationService';
import { formatDate } from '@/utils/format';

export default function DeathRegistrationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState<DeathRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchRegistration();
    }
  }, [id]);

  const fetchRegistration = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await registrationService.getDeathById(id!);
      setRegistration(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load death registration');
      console.error('Error fetching registration:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Death Registrations', path: ROUTES.REGISTRATIONS.DEATH },
          ]}
        />
        <Card>
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error || 'Death registration not found'}</p>
            <Button onClick={() => navigate(ROUTES.REGISTRATIONS.DEATH)} className="mt-4" variant="outline">
              Back to Death Registrations
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Death Registrations', path: ROUTES.REGISTRATIONS.DEATH },
          { label: registration.deceasedName },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Death Registration - {registration.deceasedName}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Death registration details</p>
        </div>
        <Link to={ROUTES.REGISTRATIONS.DEATH}>
          <Button variant="outline">
            <FiArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Deceased Information
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Deceased Name</span>
              <p className="text-gray-900 dark:text-gray-100 font-medium">{registration.deceasedName}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Death Date</span>
              <p className="text-gray-900 dark:text-gray-100">{formatDate(registration.deathDate)}</p>
            </div>
            {registration.placeOfDeath && (
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Place of Death</span>
                <p className="text-gray-900 dark:text-gray-100">{registration.placeOfDeath}</p>
              </div>
            )}
            {registration.causeOfDeath && (
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Cause of Death</span>
                <p className="text-gray-900 dark:text-gray-100">{registration.causeOfDeath}</p>
              </div>
            )}
            {registration.mahallId && (
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Mahall ID</span>
                <p className="text-gray-900 dark:text-gray-100">{registration.mahallId}</p>
              </div>
            )}
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
              <div className="mt-1">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    statusColors[registration.status || 'pending']
                  }`}
                >
                  {registration.status || 'pending'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Informant Information
          </h2>
          <div className="space-y-3">
            {registration.informantName ? (
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Informant Name</span>
                <p className="text-gray-900 dark:text-gray-100">{registration.informantName}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">No informant information provided</p>
            )}
            {registration.informantRelation && (
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Relation to Deceased</span>
                <p className="text-gray-900 dark:text-gray-100">{registration.informantRelation}</p>
              </div>
            )}
            {registration.informantPhone && (
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Phone</span>
                <p className="text-gray-900 dark:text-gray-100">{registration.informantPhone}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {registration.remarks && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Remarks</h2>
          <p className="text-gray-700 dark:text-gray-300">{registration.remarks}</p>
        </Card>
      )}

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Registration Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Registration ID</span>
            <p className="text-gray-900 dark:text-gray-100 font-mono text-sm">{registration.id}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Created At</span>
            <p className="text-gray-900 dark:text-gray-100">{formatDate(registration.createdAt)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

