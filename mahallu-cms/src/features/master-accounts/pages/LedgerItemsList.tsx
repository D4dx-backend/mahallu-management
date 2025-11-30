import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiList, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import StatCard from '@/components/ui/StatCard';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import TableToolbar from '@/components/ui/TableToolbar';
import { TableColumn, Pagination as PaginationType } from '@/types';
import { masterAccountService, LedgerItem, Ledger } from '@/services/masterAccountService';
import { formatDate } from '@/utils/format';
import { exportToCSV, exportToJSON, exportToPDF } from '@/utils/exportUtils';

export default function LedgerItemsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [ledgerFilter, setLedgerFilter] = useState('all');
  const [items, setItems] = useState<LedgerItem[]>([]);
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchLedgers();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [ledgerFilter, currentPage]);

  const fetchLedgers = async () => {
    try {
      // Fetch all ledgers for dropdown (no pagination needed for filter)
      const result = await masterAccountService.getAllLedgers({ limit: 1000 });
      setLedgers(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error('Error fetching ledgers:', err);
      setLedgers([]);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (ledgerFilter !== 'all') {
        params.ledgerId = ledgerFilter;
      }
      const result = await masterAccountService.getLedgerItems(params);
      setItems(Array.isArray(result.data) ? result.data : []);
      if (result.pagination) {
        setPagination(result.pagination);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch ledger items');
      console.error('Error fetching items:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'csv' | 'json' | 'pdf') => {
    try {
      setIsExporting(true);
      
      const params: any = { limit: 10000 };
      if (ledgerFilter !== 'all') params.ledgerId = ledgerFilter;
      
      const result = await masterAccountService.getLedgerItems(params);
      const dataToExport = Array.isArray(result.data) ? result.data : [];

      if (dataToExport.length === 0) {
        alert('No data to export');
        return;
      }

      const filename = 'ledger-items';
      const title = 'Ledger Items';

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

  const columns: TableColumn<LedgerItem>[] = [
    { key: 'id', label: 'No.', render: (_, __, index) => index + 1 },
    {
      key: 'date',
      label: 'Date',
      render: (date) => formatDate(date),
    },
    {
      key: 'type',
      label: 'Type',
      render: (type) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            type === 'income'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}
        >
          {type}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (amount) => `₹${amount?.toLocaleString() || 0}`,
    },
    { key: 'description', label: 'Description' },
  ];

  const totalIncome = items.filter((i) => i.type === 'income').reduce((sum, i) => sum + (i.amount || 0), 0);
  const totalExpense = items.filter((i) => i.type === 'expense').reduce((sum, i) => sum + (i.amount || 0), 0);

  const stats = [
    { title: 'Total Items', value: pagination?.total || items.length, icon: <FiList className="h-5 w-5" /> },
    { title: 'Total Income', value: `₹${totalIncome.toLocaleString()}`, icon: <FiTrendingUp className="h-5 w-5" /> },
    { title: 'Total Expense', value: `₹${totalExpense.toLocaleString()}`, icon: <FiTrendingDown className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Ledger Items</h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Manage ledger transactions</p>
          </div>
          <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Ledger Items' }]} />
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
          onRefresh={fetchItems}
          onExport={handleExport}
          isExporting={isExporting}
          actionButtons={
            <Link to="/master-accounts/ledger-items/create">
              <Button size="md">
                + New Item
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
            <div className="w-64">
              <Select
                options={[
                  { value: 'all', label: 'All Ledgers' },
                  ...ledgers.map((l) => ({ value: l.id, label: l.name })),
                ]}
                value={ledgerFilter}
                onChange={(e) => setLedgerFilter(e.target.value)}
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
            <Button onClick={fetchItems} className="mt-4" variant="outline">
              Retry
            </Button>
          </div>
        ) : (
          <>
            <Table columns={columns} data={items} emptyMessage="No ledger items found" showExport={false} />
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.total}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

