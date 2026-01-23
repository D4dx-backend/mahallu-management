import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEdit2, FiX, FiHome, FiUsers, FiUser } from 'react-icons/fi';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import StatCard from '@/components/ui/StatCard';
import Table from '@/components/ui/Table';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import TableToolbar from '@/components/ui/TableToolbar';
import { TableColumn, Pagination as PaginationType } from '@/types';
import { Family } from '@/types';
import { ROUTES } from '@/constants/routes';
import { familyService } from '@/services/familyService';
import { useDebounce } from '@/hooks/useDebounce';
import { exportToCSV, exportToJSON, exportToPDF } from '@/utils/exportUtils';

export default function FamiliesList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    fetchFamilies();
  }, [debouncedSearch, sortBy, currentPage]);

  const fetchFamilies = async () => {
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
      if (sortBy) {
        params.sortBy = sortBy === 'mahallId' ? 'mahallId' : 'date';
      }
      const result = await familyService.getAll(params);
      setFamilies(result.data);
      if (result.pagination) {
        setPagination(result.pagination);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch families');
      console.error('Error fetching families:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'csv' | 'json' | 'pdf') => {
    try {
      setIsExporting(true);
      const params: any = { limit: 10000 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (sortBy) params.sortBy = sortBy === 'mahallId' ? 'mahallId' : 'date';
      const result = await familyService.getAll(params);
      const dataToExport = result.data;
      if (dataToExport.length === 0) { alert('No data to export'); return; }
      const filename = 'families';
      const title = 'All Families';
      switch (type) {
        case 'csv': exportToCSV(columns, dataToExport, filename); break;
        case 'json': exportToJSON(columns, dataToExport, filename); break;
        case 'pdf': exportToPDF(columns, dataToExport, filename, title); break;
      }
    } catch (error: any) {
      console.error('Export error:', error);
      alert(error?.message || 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate stats
  const totalMembers = families.reduce((sum, f) => sum + (f.members?.length || 0), 0);
  
  // Calculate male and female counts from all members
  const genderCounts = families.reduce(
    (acc, family) => {
      if (family.members) {
        family.members.forEach((member) => {
          if (member.gender === 'male') {
            acc.male++;
          } else if (member.gender === 'female') {
            acc.female++;
          }
        });
      }
      return acc;
    },
    { male: 0, female: 0 }
  );
  

  const columns: TableColumn<Family>[] = [
    { key: 'id', label: 'No.', render: (_, __, index) => index + 1 },
    { key: 'mahallId', label: 'Mahall ID', render: (id) => id || '-' },
    { key: 'houseName', label: 'House Name', sortable: true },
    {
      key: 'familyHead',
      label: 'Family Head',
      render: (head) => head || '-',
    },
    {
      key: 'members',
      label: 'Members',
      render: (members) => members?.length || 0,
    },
    { key: 'houseNo', label: 'House No.' },
    { key: 'area', label: 'Area' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(ROUTES.FAMILIES.DETAIL(row.id));
            }}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
            title="View"
          >
            <FiEye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(ROUTES.FAMILIES.EDIT(row.id));
            }}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
            title="Edit"
          >
            <FiEdit2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const stats = [
    {
      title: 'Total Families',
      value: pagination?.total || families.length,
      icon: <FiHome className="h-5 w-5" />,
      onClick: () => {},
    },
    {
      title: 'Total Members',
      value: totalMembers,
      icon: <FiUsers className="h-5 w-5" />,
      onClick: () => {},
    },
    {
      title: 'Male - Female',
      value: `${genderCounts.male} - ${genderCounts.female}`,
      icon: <FiUser className="h-5 w-5" />,
      onClick: () => {},
    },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              All Families
            </h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Manage families and their members
            </p>
          </div>
          <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'All Families' }]} />
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Actions and Filters */}
      <Card>
        <div className="flex flex-col gap-4 mb-6">
          <TableToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onFilterClick={() => setIsFilterVisible(!isFilterVisible)}
            isFilterVisible={isFilterVisible}
            hasFilters={true}
            onRefresh={fetchFamilies}
            onExport={handleExport}
            isExporting={isExporting}
            actionButtons={
              <Link to={ROUTES.FAMILIES.CREATE}>
                <Button size="md">+ New Family</Button>
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
              <div className="w-40">
                <Select
                  options={[
                    { value: 'date', label: 'Date' },
                    { value: 'mahallId', label: 'Mahall ID' },
                  ]}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                />
              </div>
            </div>
          )}

        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button onClick={fetchFamilies} className="mt-4" variant="outline">
              Retry
            </Button>
          </div>
        ) : (
          <Table
            columns={columns}
            data={families}
            emptyMessage="No families found"
            exportFilename="families"
            exportTitle="All Families"
            showExport={false}
            onRowClick={(row) => navigate(ROUTES.FAMILIES.DETAIL(row.id))}
            onExportAll={async () => {
              const params: any = {
                limit: 10000,
              };
              if (debouncedSearch) {
                params.search = debouncedSearch;
              }
              if (sortBy) {
                params.sortBy = sortBy === 'mahallId' ? 'mahallId' : 'date';
              }
              const result = await familyService.getAll(params);
              return result.data;
            }}
          />
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

