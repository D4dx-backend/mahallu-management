import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCreditCard, FiDollarSign, FiEye, FiDownload } from 'react-icons/fi';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import Table from '@/components/ui/Table';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import TableToolbar from '@/components/ui/TableToolbar';
import { TableColumn, Pagination as PaginationType } from '@/types';
import { collectibleService, Varisangya } from '@/services/collectibleService';
import { formatDate } from '@/utils/format';
import { exportToCSV, exportToJSON } from '@/utils/exportUtils';
import { exportInvoicesToPdf, downloadInvoicePdf, InvoiceDetails } from '@/utils/invoiceUtils';
import { familyService } from '@/services/familyService';
import { memberService } from '@/services/memberService';

export default function VarisangyaList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [varisangyas, setVarisangyas] = useState<Varisangya[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchVarisangyas();
  }, [currentPage]);

  const fetchVarisangyas = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      const result = await collectibleService.getAllVarisangyas(params);
      setVarisangyas(result.data);
      if (result.pagination) {
        setPagination(result.pagination);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch varisangyas');
      console.error('Error fetching varisangyas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'csv' | 'json' | 'pdf') => {
    try {
      setIsExporting(true);
      
      const params: any = { limit: 10000 };
      
      const result = await collectibleService.getAllVarisangyas(params);
      const dataToExport = result.data;

      if (dataToExport.length === 0) {
        alert('No data to export');
        return;
      }

      const filename = 'varisangya-payments';
      const title = 'Varisangya Payments';

      switch (type) {
        case 'csv':
          exportToCSV(columns, dataToExport, filename);
          break;
        case 'json':
          exportToJSON(columns, dataToExport, filename);
          break;
        case 'pdf':
          {
            const familyCache = new Map<string, string>();
            const memberCache = new Map<string, string>();

            const resolveFamilyName = async (familyId?: string) => {
              if (!familyId) return '-';
              if (familyCache.has(familyId)) return familyCache.get(familyId)!;
              const family = await familyService.getById(familyId);
              const name = family.houseName || '-';
              familyCache.set(familyId, name);
              return name;
            };

            const resolveMemberName = async (memberId?: string) => {
              if (!memberId) return '-';
              if (memberCache.has(memberId)) return memberCache.get(memberId)!;
              const member = await memberService.getById(memberId);
              const name = member.name || '-';
              memberCache.set(memberId, name);
              return name;
            };

            const invoices: InvoiceDetails[] = [];
            for (const entry of dataToExport) {
              const isMember = Boolean(entry.memberId);
              const payerName = isMember
                ? await resolveMemberName(entry.memberId)
                : await resolveFamilyName(entry.familyId);

              invoices.push({
                title: title,
                receiptNo: entry.receiptNo,
                payerLabel: isMember ? 'Member' : 'Family',
                payerName,
                amount: entry.amount,
                paymentDate: entry.paymentDate,
                paymentMethod: entry.paymentMethod,
                remarks: entry.remarks,
              });
            }

            await exportInvoicesToPdf(invoices, `varisangya-invoices-${new Date().toISOString().split('T')[0]}`);
          }
          break;
      }
    } catch (error: any) {
      console.error('Export error:', error);
      alert(error?.message || 'Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleViewPdf = async (entry: Varisangya) => {
    try {
      const isMember = Boolean(entry.memberId);
      const payerName = isMember
        ? (await memberService.getById(entry.memberId!)).name
        : (await familyService.getById(entry.familyId!)).houseName;

      const invoiceDetails: InvoiceDetails = {
        title: 'Varisangya Payment',
        receiptNo: entry.receiptNo,
        payerLabel: isMember ? 'Member' : 'Family',
        payerName: payerName || '-',
        amount: entry.amount,
        paymentDate: entry.paymentDate,
        paymentMethod: entry.paymentMethod,
        remarks: entry.remarks,
      };

      await downloadInvoicePdf(invoiceDetails);
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      alert(error?.message || 'Failed to generate PDF');
    }
  };

  const columns: TableColumn<Varisangya>[] = [
    { key: 'id', label: 'No.', render: (_, __, index) => index + 1 },
    {
      key: 'amount',
      label: 'Amount',
      render: (amount) => `₹${amount?.toLocaleString() || 0}`,
    },
    {
      key: 'paymentDate',
      label: 'Payment Date',
      render: (date) => formatDate(date),
    },
    { key: 'paymentMethod', label: 'Payment Method' },
    {
      key: 'receiptNo',
      label: 'Receipt No.',
      render: (receiptNo) => receiptNo || '-',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewPdf(row);
            }}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
            title="View/Download PDF"
          >
            <FiDownload className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const totalAmount = varisangyas.reduce((sum, v) => sum + (v.amount || 0), 0);

  const stats = [
    { title: 'Total Payments', value: pagination?.total || varisangyas.length, icon: <FiCreditCard className="h-5 w-5" /> },
    { title: 'Total Amount', value: `₹${totalAmount.toLocaleString()}`, icon: <FiDollarSign className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Varisangyas</h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Manage varisangya payments</p>
          </div>
          <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Varisangyas' }]} />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          onRefresh={fetchVarisangyas}
          onExport={handleExport}
          isExporting={isExporting}
          actionButtons={
            <Link to="/collectibles/varisangya/create">
              <Button size="md">
                + New Payment
              </Button>
            </Link>
          }
        />

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button onClick={fetchVarisangyas} className="mt-4" variant="outline">
              Retry
            </Button>
          </div>
        ) : (
          <Table columns={columns} data={varisangyas} emptyMessage="No varisangya payments found" showExport={false} />
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

