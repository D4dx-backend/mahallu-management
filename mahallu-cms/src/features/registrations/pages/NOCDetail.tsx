import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2 } from 'react-icons/fi';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ROUTES } from '@/constants/routes';
import { registrationService, NOC } from '@/services/registrationService';
import { formatDate } from '@/utils/format';

export default function NOCDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [noc, setNOC] = useState<NOC | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchNOC();
    }
  }, [id]);

  const fetchNOC = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await registrationService.getNOCById(id!);
      setNOC(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load NOC');
      console.error('Error fetching NOC:', err);
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

  if (error || !noc) {
    return (
      <div className="space-y-6">
        <Breadcrumb
          items={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'NOC', path: noc?.type === 'nikah' ? ROUTES.REGISTRATIONS.NOC.NIKAH : ROUTES.REGISTRATIONS.NOC.COMMON },
          ]}
        />
        <Card>
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error || 'NOC not found'}</p>
            <Button
              onClick={() => navigate(noc?.type === 'nikah' ? ROUTES.REGISTRATIONS.NOC.NIKAH : ROUTES.REGISTRATIONS.NOC.COMMON)}
              className="mt-4"
              variant="outline"
            >
              Back to NOC List
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

  const typeColors: Record<string, string> = {
    common: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    nikah: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          {
            label: 'NOC',
            path: noc.type === 'nikah' ? ROUTES.REGISTRATIONS.NOC.NIKAH : ROUTES.REGISTRATIONS.NOC.COMMON,
          },
          { label: noc.applicantName },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            NOC - {noc.applicantName}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">NOC details</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/registrations/noc/${noc.id}/edit`}>
            <Button variant="outline">
              <FiEdit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Link
            to={noc.type === 'nikah' ? ROUTES.REGISTRATIONS.NOC.NIKAH : ROUTES.REGISTRATIONS.NOC.COMMON}
          >
            <Button variant="outline">
              <FiArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Applicant Information
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Applicant Name</span>
              <p className="text-gray-900 dark:text-gray-100 font-medium">{noc.applicantName}</p>
            </div>
            {noc.applicantPhone && (
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Phone</span>
                <p className="text-gray-900 dark:text-gray-100">{noc.applicantPhone}</p>
              </div>
            )}
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Type</span>
              <div className="mt-1">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    typeColors[noc.type || 'common']
                  }`}
                >
                  {noc.type === 'nikah' ? 'Nikah NOC' : 'Common NOC'}
                </span>
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
              <div className="mt-1">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    statusColors[noc.status || 'pending']
                  }`}
                >
                  {noc.status || 'pending'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">NOC Details</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Purpose</span>
              <p className="text-gray-900 dark:text-gray-100">{noc.purpose}</p>
            </div>
            {noc.issuedDate && (
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Issued Date</span>
                <p className="text-gray-900 dark:text-gray-100">{formatDate(noc.issuedDate)}</p>
              </div>
            )}
            {noc.expiryDate && (
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Expiry Date</span>
                <p className="text-gray-900 dark:text-gray-100">{formatDate(noc.expiryDate)}</p>
              </div>
            )}
            {noc.nikahRegistrationId && (
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Related Nikah Registration</span>
                <Link
                  to={`/registrations/nikah/${noc.nikahRegistrationId}`}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  View Registration
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>

      {noc.remarks && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Remarks</h2>
          <p className="text-gray-700 dark:text-gray-300">{noc.remarks}</p>
        </Card>
      )}

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Registration Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">NOC ID</span>
            <p className="text-gray-900 dark:text-gray-100 font-mono text-sm">{noc.id}</p>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Created At</span>
            <p className="text-gray-900 dark:text-gray-100">{formatDate(noc.createdAt)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

