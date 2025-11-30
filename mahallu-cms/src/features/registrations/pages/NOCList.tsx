import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiEye, FiEdit2, FiX, FiFileText, FiClock, FiCheckCircle } from 'react-icons/fi';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import StatCard from '@/components/ui/StatCard';
import Table from '@/components/ui/Table';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import TableToolbar from '@/components/ui/TableToolbar';
import ActionsMenu, { ActionMenuItem } from '@/components/ui/ActionsMenu';
import { TableColumn, Pagination as PaginationType } from '@/types';
import { registrationService, NOC } from '@/services/registrationService';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/utils/format';
import { ROUTES } from '@/constants/routes';
import { exportToCSV, exportToJSON, exportToPDF } from '@/utils/exportUtils';

export default function NOCList() {
  const navigate = useNavigate();
  const location = useLocation();
  const isNikahNOC = location.pathname === ROUTES.REGISTRATIONS.NOC.NIKAH;
  const isCommonNOC = location.pathname === ROUTES.REGISTRATIONS.NOC.COMMON;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>(() => {
    if (isNikahNOC) return 'nikah';
    if (isCommonNOC) return 'common';
    return 'all';
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [nocs, setNocs] = useState<NOC[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    fetchNOCs();
  }, [debouncedSearch, typeFilter, statusFilter, currentPage]);

  const fetchNOCs = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }
      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const result = await registrationService.getAllNOC(params);
      setNocs(result.data);
      if (result.pagination) {
        setPagination(result.pagination);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch NOCs');
      console.error('Error fetching NOCs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'csv' | 'json' | 'pdf') => {
    try {
      setIsExporting(true);
      
      const params: any = { limit: 10000 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const result = await registrationService.getAllNOC(params);
      const dataToExport = result.data;

      if (dataToExport.length === 0) {
        alert('No data to export');
        return;
      }

      const filename = 'noc-list';
      const title = 'NOC List';

      switch (type) {
        case 'csv':
          exportToCSV(columns, dataToExport, filename);
          break;
        case 'json':
          exportToJSON(columns, dataToExport, filename);
          break;
        case 'pdf':
          exportToPDF(columns, dataToExport, filename, title);
          break;
      }
    } catch (error: any) {
      console.error('Export error:', error);
      alert(error?.message || 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const columns: TableColumn<NOC>[] = [
    { key: 'id', label: 'No.', render: (_, __, index) => index + 1 },
    { key: 'applicantName', label: 'Applicant', sortable: true },
    { key: 'purpose', label: 'Purpose' },
    {
      key: 'type',
      label: 'Type',
      render: (type) => (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
          {type}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => {
        const statusColors: Record<string, string> = {
          pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };
        return (
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status || 'pending']}`}>
            {status || 'pending'}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (date) => formatDate(date),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => {
        const actionItems: ActionMenuItem[] = [
          {
            label: 'View',
            icon: <FiEye />,
            onClick: () => navigate(`/registrations/noc/${row.id}`),
          },
          {
            label: 'Edit',
            icon: <FiEdit2 />,
            onClick: () => navigate(`/registrations/noc/${row.id}/edit`),
          },
        ];
        return <ActionsMenu items={actionItems} />;
      },
    },
  ];

  const stats = [
    { title: 'Total NOCs', value: pagination?.total || nocs.length, icon: <FiFileText className="h-5 w-5" /> },
    {
      title: 'Pending',
      value: nocs.filter((n) => n.status === 'pending' || !n.status).length,
      icon: <FiClock className="h-5 w-5" />,
    },
    {
      title: 'Approved',
      value: nocs.filter((n) => n.status === 'approved').length,
      icon: <FiCheckCircle className="h-5 w-5" />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {isNikahNOC ? 'Nikah NOC' : isCommonNOC ? 'Common NOC' : 'NOC (No Objection Certificate)'}
            </h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              {isNikahNOC ? 'Manage Nikah NOC requests' : isCommonNOC ? 'Manage Common NOC requests' : 'Manage NOC requests'}
            </p>
          </div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', path: '/dashboard' },
              { label: 'Registrations', path: ROUTES.REGISTRATIONS.NIKAH },
              {
                label: isNikahNOC ? 'Nikah NOC' : isCommonNOC ? 'Common NOC' : 'NOC',
                path: isNikahNOC ? ROUTES.REGISTRATIONS.NOC.NIKAH : isCommonNOC ? ROUTES.REGISTRATIONS.NOC.COMMON : '#',
              },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>

      <Card>
        <TableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onFilterClick={() => setIsFilterVisible(!isFilterVisible)}
          isFilterVisible={isFilterVisible}
          hasFilters={true}
          onRefresh={fetchNOCs}
          onExport={handleExport}
          isExporting={isExporting}
          actionButtons={
            <Link to="/registrations/noc/create">
              <Button size="md">
                + New NOC
              </Button>
            </Link>
          }
        />

        {isFilterVisible && (
          <div className="relative flex flex-wrap items-center gap-4 mb-6 p-4 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700">
            <button
              onClick={() => setIsFilterVisible(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FiX className="h-4 w-4" />
            </button>
            {!isNikahNOC && !isCommonNOC && (
              <div className="w-32">
                <Select
                  options={[
                    { value: 'all', label: 'All Types' },
                    { value: 'common', label: 'Common' },
                    { value: 'nikah', label: 'Nikah' },
                  ]}
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                />
              </div>
            )}
            <div className="w-32">
              <Select
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'rejected', label: 'Rejected' },
                ]}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button onClick={fetchNOCs} className="mt-4" variant="outline">
              Retry
            </Button>
          </div>
        ) : (
          <Table columns={columns} data={nocs} emptyMessage="No NOCs found" showExport={false} />
        )}

        {/* Pagination */}
        {pagination && (
          <div className="mt-4">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={(page) => {
                setCurrentPage(page);
              }}
            />
          </div>
        )}
      </Card>
    </div>
  );
}

