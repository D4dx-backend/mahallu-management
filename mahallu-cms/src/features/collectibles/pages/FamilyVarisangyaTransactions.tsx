import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { TableColumn } from '@/types';
import { collectibleService, Transaction, Wallet } from '@/services/collectibleService';
import { familyService } from '@/services/familyService';
import { formatDate } from '@/utils/format';
import { ROUTES } from '@/constants/routes';

export default function FamilyVarisangyaTransactions() {
  const [searchParams] = useSearchParams();
  const familyId = searchParams.get('familyId');
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [family, setFamily] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (familyId) {
      fetchData();
    } else {
      fetchAllTransactions();
    }
  }, [familyId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch family details
      if (familyId) {
        const familyData = await familyService.getById(familyId);
        setFamily(familyData);
      }

      // Fetch wallet
      const walletData = await collectibleService.getWallet({ familyId: familyId || undefined });
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
      
      // Fetch all families and their wallets/transactions
      const familiesResult = await familyService.getAll();
      const families = familiesResult.data;
      
      const allTransactions: Transaction[] = [];
      
      for (const fam of families) {
        try {
          const walletData = await collectibleService.getWallet({ familyId: fam.id });
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
          { label: 'Family Varisangya', path: ROUTES.COLLECTIBLES.FAMILY_VARISANGYA.LIST },
          { label: 'Transactions' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Family Varisangya Transactions
            {family && ` - ${family.houseName}`}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View all varisangya transactions{family ? ` for ${family.houseName}` : ''}
          </p>
        </div>
        <Link to={ROUTES.COLLECTIBLES.FAMILY_VARISANGYA.LIST}>
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
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button onClick={familyId ? fetchData : fetchAllTransactions} className="mt-4" variant="outline">
              Retry
            </Button>
          </div>
        ) : (
          <Table columns={columns} data={transactions} emptyMessage="No transactions found" />
        )}
      </Card>
    </div>
  );
}

