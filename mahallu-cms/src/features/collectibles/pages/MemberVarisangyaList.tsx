import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiDollarSign, FiUsers, FiCreditCard } from 'react-icons/fi';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import Table from '@/components/ui/Table';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import TableToolbar from '@/components/ui/TableToolbar';
import ActionsMenu, { ActionMenuItem } from '@/components/ui/ActionsMenu';
import { TableColumn, Pagination as PaginationType } from '@/types';
import { collectibleService, Varisangya } from '@/services/collectibleService';
import { memberService, Member } from '@/services/memberService';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/utils/format';
import { ROUTES } from '@/constants/routes';
import { exportToCSV, exportToJSON, exportToPDF } from '@/utils/exportUtils';

interface MemberVarisangyaData extends Member {
  totalVarisangya?: number;
  varisangyaCount?: number;
  lastPaymentDate?: string;
}

export default function MemberVarisangyaList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [members, setMembers] = useState<MemberVarisangyaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    fetchMembers();
  }, [debouncedSearch, currentPage]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch members
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }
      
      const membersResult = await memberService.getAll(params);
      const membersData = membersResult.data;
      
      // Fetch varisangyas for all members
      const varisangyasResult = await collectibleService.getAllVarisangyas();
      const allVarisangyas = varisangyasResult.data;
      
      // Calculate varisangya totals for each member
      const membersWithVarisangya = membersData.map((member) => {
        const memberVarisangyas = allVarisangyas.filter(
          (v) => v.memberId === member.id
        );
        
        const totalVarisangya = memberVarisangyas.reduce(
          (sum, v) => sum + (v.amount || 0),
          0
        );
        
        const lastPayment = memberVarisangyas.sort(
          (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
        )[0];
        
        return {
          ...member,
          totalVarisangya,
          varisangyaCount: memberVarisangyas.length,
          lastPaymentDate: lastPayment?.paymentDate,
        };
      });
      
      setMembers(membersWithVarisangya);
      if (membersResult.pagination) {
        setPagination(membersResult.pagination);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch members');
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'csv' | 'json' | 'pdf') => {
    try {
      setIsExporting(true);
      
      const params: any = { limit: 10000 };
      if (debouncedSearch) params.search = debouncedSearch;
      
      const membersResult = await memberService.getAll(params);
      const membersData = membersResult.data;
      const varisangyasResult = await collectibleService.getAllVarisangyas();
      const allVarisangyas = varisangyasResult.data;
      
      const dataToExport = membersData.map((member) => {
        const memberVarisangyas = allVarisangyas.filter(
          (v) => v.memberId === member.id
        );
        const totalVarisangya = memberVarisangyas.reduce(
          (sum, v) => sum + (v.amount || 0),
          0
        );
        const lastPayment = memberVarisangyas.sort(
          (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
        )[0];
        return {
          ...member,
          totalVarisangya,
          varisangyaCount: memberVarisangyas.length,
          lastPaymentDate: lastPayment?.paymentDate,
        };
      });

      if (dataToExport.length === 0) {
        alert('No data to export');
        return;
      }

      const filename = 'member-varisangya';
      const title = 'Member Varisangya';

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

  const columns: TableColumn<MemberVarisangyaData>[] = [
    { key: 'id', label: 'No.', render: (_, __, index) => index + 1 },
    {
      key: 'name',
      label: 'Member Name',
      render: (name, row) => (
        <Link
          to={ROUTES.MEMBERS.DETAIL(row.id)}
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          {name}
        </Link>
      ),
    },
    { key: 'familyName', label: 'Family' },
    {
      key: 'varisangyaCount',
      label: 'Payments',
      render: (count) => count || 0,
    },
    {
      key: 'totalVarisangya',
      label: 'Total Amount',
      render: (amount) => `₹${(amount || 0).toLocaleString()}`,
    },
    {
      key: 'lastPaymentDate',
      label: 'Last Payment',
      render: (date) => (date ? formatDate(date) : '-'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => {
        const actionItems: ActionMenuItem[] = [
          {
            label: 'View Transactions',
            icon: <FiEye />,
            onClick: () => navigate(`${ROUTES.COLLECTIBLES.MEMBER_VARISANGYA.TRANSACTIONS}?memberId=${row.id}`),
          },
          {
            label: 'View Wallet',
            icon: <FiDollarSign />,
            onClick: () => navigate(`${ROUTES.COLLECTIBLES.MEMBER_VARISANGYA.WALLET}?memberId=${row.id}`),
          },
        ];
        return <ActionsMenu items={actionItems} />;
      },
    },
  ];

  const totalAmount = members.reduce((sum, m) => sum + (m.totalVarisangya || 0), 0);
  const totalPayments = members.reduce((sum, m) => sum + (m.varisangyaCount || 0), 0);

  const stats = [
    { title: 'Total Members', value: pagination?.total || members.length, icon: <FiUsers className="h-5 w-5" /> },
    { title: 'Total Payments', value: totalPayments, icon: <FiCreditCard className="h-5 w-5" /> },
    { title: 'Total Amount', value: `₹${totalAmount.toLocaleString()}`, icon: <FiDollarSign className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Member Varisangya</h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">View varisangya payments by member</p>
          </div>
          <Breadcrumb
            items={[
              { label: 'Dashboard', path: '/dashboard' },
              { label: 'Collectibles', path: ROUTES.COLLECTIBLES.OVERVIEW },
              { label: 'Member Varisangya' },
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
          hasFilters={false}
          onRefresh={fetchMembers}
          onExport={handleExport}
          isExporting={isExporting}
        />

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button onClick={fetchMembers} className="mt-4" variant="outline">
              Retry
            </Button>
          </div>
        ) : (
          <Table columns={columns} data={members} emptyMessage="No members found" showExport={false} />
        )}

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

