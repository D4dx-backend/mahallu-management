import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCreditCard, FiDollarSign, FiDownload, FiEdit2, FiX } from 'react-icons/fi';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import StatCard from '@/components/ui/StatCard';
import Table from '@/components/ui/Table';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import TableToolbar from '@/components/ui/TableToolbar';
import Modal from '@/components/ui/Modal';
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
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [familyNameFilter, setFamilyNameFilter] = useState('');
  const [varisangyas, setVarisangyas] = useState<Varisangya[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [editingRow, setEditingRow] = useState<Varisangya | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({ amount: 0, paymentDate: '', paymentMethod: '', remarks: '' });

  const parseYMD = (s: string): { y: number; m: number; d: number } | null => {
    const parts = s.trim().split('-').map(Number);
    if (parts.length !== 3 || parts.some((n) => isNaN(n))) return null;
    const [a, b, c] = parts;
    if (a > 31 || a >= 1000) return { y: a, m: b, d: c };
    if (c > 31 || c >= 1000) return { y: c, m: b, d: a };
    return null;
  };

  const filterByDateRange = (rows: Varisangya[], from?: string, to?: string): Varisangya[] => {
    if (!from && !to) return rows;
    const fromParsed = from ? parseYMD(from) : null;
    const toParsed = to ? parseYMD(to) : null;
    if (!fromParsed && !toParsed) return rows;
    const startMs = fromParsed
      ? Date.UTC(fromParsed.y, fromParsed.m - 1, fromParsed.d, 0, 0, 0, 0)
      : 0;
    const endMs = toParsed
      ? Date.UTC(toParsed.y, toParsed.m - 1, toParsed.d, 23, 59, 59, 999)
      : Number.MAX_SAFE_INTEGER;
    return rows.filter((row) => {
      const t = row.paymentDate ? new Date(row.paymentDate).getTime() : 0;
      return t >= startMs && t <= endMs;
    });
  };

  useEffect(() => {
    fetchVarisangyas();
  }, [currentPage, dateFrom, dateTo, familyNameFilter]);

  const fetchVarisangyas = async () => {
    try {
      setLoading(true);
      setError(null);
      const hasDateFilter = Boolean(dateFrom || dateTo);
      const hasFamilyFilter = familyNameFilter.trim().length > 0;
      const hasClientFilter = hasDateFilter || hasFamilyFilter;
      const params: Record<string, unknown> = {
        page: hasClientFilter ? 1 : currentPage,
        limit: hasClientFilter ? 10000 : itemsPerPage,
      };
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (hasClientFilter) params._t = Date.now();
      const result = await collectibleService.getAllVarisangyas(params);
      let data = result.data ?? [];
      let total = result.pagination?.total ?? data.length;
      if (hasDateFilter) data = filterByDateRange(data, dateFrom, dateTo);
      if (hasFamilyFilter) {
        const q = familyNameFilter.trim().toLowerCase();
        data = data.filter((row) => getPayerName(row).toLowerCase().includes(q));
      }
      if (hasClientFilter) {
        total = data.length;
        const start = (currentPage - 1) * itemsPerPage;
        data = data.slice(start, start + itemsPerPage);
      }
      console.log('[Varisangya Filter] Response:', { count: data.length, total, firstPaymentDate: data[0]?.paymentDate });
      console.log('[Varisangya Filter] What the UI is showing (each row):', data.map((row, i) => ({
        no: i + 1,
        name: typeof row.memberId === 'object' && row.memberId?.name ? row.memberId.name : typeof row.familyId === 'object' && row.familyId?.houseName ? row.familyId.houseName : '-',
        amount: row.amount,
        paymentDate: row.paymentDate,
        receiptNo: row.receiptNo,
      })));
      setVarisangyas(data);
      if (result.pagination) {
        setPagination({
          ...result.pagination,
          page: currentPage,
          total,
          totalPages: Math.max(1, Math.ceil(total / itemsPerPage)),
          limit: itemsPerPage,
        });
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
      
      const params: Record<string, unknown> = { limit: 10000 };
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const result = await collectibleService.getAllVarisangyas(params);
      let dataToExport = result.data ?? [];
      if (dateFrom || dateTo) dataToExport = filterByDateRange(dataToExport, dateFrom, dateTo);
      if (familyNameFilter.trim()) {
        const q = familyNameFilter.trim().toLowerCase();
        dataToExport = dataToExport.filter((row) => getPayerName(row).toLowerCase().includes(q));
      }

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
                ? await resolveMemberName(getId(entry.memberId))
                : await resolveFamilyName(getId(entry.familyId));

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

  const getId = (x: string | { _id: string } | undefined): string | undefined =>
    x && typeof x === 'object' ? x._id : (typeof x === 'string' ? x : undefined);
  const handleViewPdf = async (entry: Varisangya) => {
    try {
      let payerName: string | undefined;
      let payerLabel: string;

      const memberId = getId(entry.memberId);
      const familyId = getId(entry.familyId);

      if (entry.memberId && typeof entry.memberId === 'object' && entry.memberId.name) {
        payerName = entry.memberId.name;
        payerLabel = 'Member';
      } else if (memberId) {
        payerName = (await memberService.getById(memberId)).name;
        payerLabel = 'Member';
      } else if (entry.familyId && typeof entry.familyId === 'object' && entry.familyId.houseName) {
        payerName = entry.familyId.houseName;
        payerLabel = 'Family';
      } else if (familyId) {
        payerName = (await familyService.getById(familyId)).houseName;
        payerLabel = 'Family';
      } else {
        payerName = '-';
        payerLabel = 'Unknown';
      }

      const invoiceDetails: InvoiceDetails = {
        title: 'Varisangya Payment',
        receiptNo: entry.receiptNo,
        payerLabel,
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

  const openEdit = (row: Varisangya) => {
    setEditingRow(row);
    setEditForm({
      amount: row.amount ?? 0,
      paymentDate: row.paymentDate ? new Date(row.paymentDate).toISOString().split('T')[0] : '',
      paymentMethod: row.paymentMethod ?? '',
      remarks: row.remarks ?? '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingRow?.id) return;
    try {
      setSavingEdit(true);
      await collectibleService.updateVarisangya(editingRow.id, {
        amount: editForm.amount,
        paymentDate: editForm.paymentDate,
        paymentMethod: editForm.paymentMethod || undefined,
        remarks: editForm.remarks || undefined,
      });
      setEditingRow(null);
      await fetchVarisangyas();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update payment');
    } finally {
      setSavingEdit(false);
    }
  };

  const getPayerName = (row: Varisangya): string => {
    const m = row.memberId;
    const f = row.familyId;
    if (m && typeof m === 'object' && m.name) return m.name;
    if (f && typeof f === 'object' && f.houseName) return f.houseName;
    return '-';
  };

  const getFamilyName = (row: Varisangya): string => {
    const f = row.familyId;
    const m = row.memberId;
    if (f && typeof f === 'object' && f.houseName) return f.houseName;
    const member = m && typeof m === 'object' ? (m as Record<string, unknown>) : null;
    if (member?.familyName && typeof member.familyName === 'string') return member.familyName as string;
    const memberFamily = member?.familyId as { houseName?: string } | undefined;
    if (memberFamily?.houseName) return memberFamily.houseName;
    return '-';
  };

  const columns: TableColumn<Varisangya>[] = [
    { key: 'id', label: 'No.', render: (_, __, index) => index + 1 },
    { key: 'name', label: 'Name', render: (_, row) => getPayerName(row) },
    { key: 'familyName', label: 'Family name', render: (_, row) => getFamilyName(row) },
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
              openEdit(row);
            }}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
            title="Edit payment"
          >
            <FiEdit2 className="h-4 w-4" />
          </button>
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
          hasFilters={true}
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

        {isFilterVisible && (
          <div className="relative flex flex-wrap items-end gap-4 p-4 mb-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <button
              type="button"
              onClick={() => setIsFilterVisible(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 sm:relative sm:right-0 sm:top-0 order-last sm:order-none"
              aria-label="Close filter"
            >
              <FiX className="h-4 w-4" />
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 flex-1">
              <Input
                label="Family name"
                type="text"
                value={familyNameFilter}
                onChange={(e) => {
                  setFamilyNameFilter(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Filter by name"
              />
              <Input
                label="From Date"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <Input
                label="To Date"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date();
                  const first = new Date(now.getFullYear(), now.getMonth(), 1);
                  const toLocal = (d: Date) =>
                    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                  setDateFrom(toLocal(first));
                  setDateTo(toLocal(now));
                  setCurrentPage(1);
                }}
              >
                This month
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date();
                  const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                  const last = new Date(now.getFullYear(), now.getMonth(), 0);
                  const toLocal = (d: Date) =>
                    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                  setDateFrom(toLocal(first));
                  setDateTo(toLocal(last));
                  setCurrentPage(1);
                }}
              >
                Last month
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                  setFamilyNameFilter('');
                  setCurrentPage(1);
                }}
              >
                Clear
              </Button>
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

      <Modal
        isOpen={!!editingRow}
        onClose={() => setEditingRow(null)}
        title="Edit payment"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditingRow(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} isLoading={savingEdit}>
              Save
            </Button>
          </>
        }
      >
        {editingRow && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Receipt: {editingRow.receiptNo ?? '-'} · {getPayerName(editingRow)}
            </p>
            <Input
              label="Amount"
              type="number"
              min={0}
              step={0.01}
              value={editForm.amount || ''}
              onChange={(e) => setEditForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
            />
            <Input
              label="Payment Date"
              type="date"
              value={editForm.paymentDate}
              onChange={(e) => setEditForm((f) => ({ ...f, paymentDate: e.target.value }))}
            />
            <Input
              label="Payment Method"
              type="text"
              value={editForm.paymentMethod}
              onChange={(e) => setEditForm((f) => ({ ...f, paymentMethod: e.target.value }))}
              placeholder="e.g. cash"
            />
            <Input
              label="Remarks"
              type="text"
              value={editForm.remarks}
              onChange={(e) => setEditForm((f) => ({ ...f, remarks: e.target.value }))}
              placeholder="Optional"
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

