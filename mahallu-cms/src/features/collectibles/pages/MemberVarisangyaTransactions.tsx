import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import TableToolbar from '@/components/ui/TableToolbar';
import { TableColumn } from '@/types';
import { collectibleService, Transaction, Wallet } from '@/services/collectibleService';
import { memberService } from '@/services/memberService';
import { formatDate } from '@/utils/format';
import { ROUTES } from '@/constants/routes';
import { exportToCSV, exportToJSON } from '@/utils/exportUtils';
import { exportInvoicesToPdf, InvoiceDetails } from '@/utils/invoiceUtils';

export default function MemberVarisangyaTransactions() {
  const [searchParams] = useSearchParams();
  const memberId = searchParams.get('memberId');
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  useEffect(() => {
    if (memberId) {
      fetchData();
    } else {
      fetchAllTransactions();
    }
  }, [memberId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch member details
      if (memberId) {
        const memberData = await memberService.getById(memberId);
        setMember(memberData);
      }

      // Fetch wallet
      const walletData = await collectibleService.getWallet({ memberId: memberId || undefined });
      setWallet(walletData);

      // Fetch transactions
      if (walletData?.id) {
        const transactionsData = await collectibleService.getWalletTransactions(walletData.id);
        setTransactions(transactionsData);
      } else {
        setTransactions([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch transactions');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all members and their wallets/transactions
      const membersResult = await memberService.getAll();
      const members = membersResult.data;
      
      const allTransactions: Transaction[] = [];
      
      for (const mem of members) {
        try {
          const walletData = await collectibleService.getWallet({ memberId: mem.id });
          if (walletData?.id) {
            const transactionsData = await collectibleService.getWalletTransactions(walletData.id);
            allTransactions.push(...transactionsData);
          }
        } catch (err) {
          // Skip if wallet doesn't exist
        }
      }
      
      setTransactions(allTransactions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'csv' | 'json' | 'pdf') => {
    try {
      setIsExporting(true);

      if (transactions.length === 0) {
        alert('No data to export');
        return;
      }

      const filename = `member-varisangya-transactions${memberId ? `-${memberId}` : ''}`;

      switch (type) {
        case 'csv':
          exportToCSV(columns, transactions, filename);
          break;
        case 'json':
          exportToJSON(columns, transactions, filename);
          break;
        case 'pdf':
          {
            const invoices: InvoiceDetails[] = transactions
              .filter((t) => t.type === 'credit' && t.referenceType === 'varisangya')
              .map((t) => ({
                title: 'Member Varisangya Transaction',
                receiptNo: t.referenceId || '-',
                payerLabel: 'Member',
                payerName: member?.name || '-',
                amount: t.amount,
                paymentDate: t.createdAt,
                paymentMethod: '-',
                remarks: t.description,
              }));

            await exportInvoicesToPdf(invoices, filename);
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

  const columns: TableColumn<Transaction>[] = [
    { key: 'id', label: 'No.', render: (_, __, index) => index + 1 },
    {
      key: 'type',
      label: 'Type',
      render: (type) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            type === 'credit'
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
    {
      key: 'referenceType',
      label: 'Reference',
      render: (type) => type || '-',
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (date) => formatDate(date),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Collectibles', path: ROUTES.COLLECTIBLES.OVERVIEW },
          { label: 'Member Varisangya', path: ROUTES.COLLECTIBLES.MEMBER_VARISANGYA.LIST },
          { label: 'Transactions' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Member Varisangya Transactions
            {member && ` - ${member.name}`}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View all varisangya transactions{member ? ` for ${member.name}` : ''}
          </p>
        </div>
        <Link to={ROUTES.COLLECTIBLES.MEMBER_VARISANGYA.LIST}>
          <Button variant="outline">
            <FiArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
        </Link>
      </div>

      {wallet && (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Wallet Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ₹{wallet.balance?.toLocaleString() || 0}
              </p>
            </div>
            {wallet.lastTransactionDate && (
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Last Transaction</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatDate(wallet.lastTransactionDate)}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      <Card>
        <TableToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onFilterClick={() => setIsFilterVisible(!isFilterVisible)}
          isFilterVisible={isFilterVisible}
          hasFilters={false}
          onRefresh={memberId ? fetchData : fetchAllTransactions}
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
            <Button onClick={memberId ? fetchData : fetchAllTransactions} className="mt-4" variant="outline">
              Retry
            </Button>
          </div>
        ) : (
          <Table columns={columns} data={transactions} emptyMessage="No transactions found" showExport={false} />
        )}
      </Card>
    </div>
  );
}

