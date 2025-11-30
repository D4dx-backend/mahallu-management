import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiDollarSign, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import Table from '@/components/ui/Table';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { TableColumn } from '@/types';
import { collectibleService, Wallet, Transaction } from '@/services/collectibleService';
import { familyService } from '@/services/familyService';
import { formatDate } from '@/utils/format';
import { ROUTES } from '@/constants/routes';

export default function FamilyVarisangyaWallet() {
  const [searchParams] = useSearchParams();
  const familyId = searchParams.get('familyId');
  
  const [wallets, setWallets] = useState<(Wallet & { family?: any })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWallets();
  }, [familyId]);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      setError(null);

      if (familyId) {
        // Fetch single family wallet
        const walletData = await collectibleService.getWallet({ familyId });
        const familyData = await familyService.getById(familyId);
        
        setWallets([{ ...walletData, family: familyData }]);
      } else {
        // Fetch all family wallets
        const familiesResult = await familyService.getAll();
        const families = familiesResult.data;
        
        const walletsData: (Wallet & { family?: any })[] = [];
        
        for (const family of families) {
          try {
            const walletData = await collectibleService.getWallet({ familyId: family.id });
            if (walletData && walletData.balance !== undefined) {
              walletsData.push({ ...walletData, family });
            }
          } catch (err) {
            // Skip if wallet doesn't exist
          }
        }
        
        setWallets(walletsData.sort((a, b) => (b.balance || 0) - (a.balance || 0)));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch wallets');
      console.error('Error fetching wallets:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns: TableColumn<Wallet & { family?: any }>[] = [
    { key: 'id', label: 'No.', render: (_, __, index) => index + 1 },
    {
      key: 'family',
      label: 'Family',
      render: (family) =>
        family ? (
          <Link
            to={ROUTES.FAMILIES.DETAIL(family.id)}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            {family.houseName}
          </Link>
        ) : (
          '-'
        ),
    },
    {
      key: 'balance',
      label: 'Balance',
      render: (balance) => (
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          ₹{(balance || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'lastTransactionDate',
      label: 'Last Transaction',
      render: (date) => (date ? formatDate(date) : '-'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Link
          to={`${ROUTES.COLLECTIBLES.FAMILY_VARISANGYA.TRANSACTIONS}?familyId=${row.family?.id || ''}`}
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
          title="View Transactions"
        >
          View Transactions
        </Link>
      ),
    },
  ];

  const totalBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
  const activeWallets = wallets.filter((w) => (w.balance || 0) > 0).length;

  const stats = [
    { title: 'Total Wallets', value: wallets.length, icon: <FiCreditCard className="h-5 w-5" /> },
    { title: 'Active Wallets', value: activeWallets, icon: <FiCheckCircle className="h-5 w-5" /> },
    { title: 'Total Balance', value: `₹${totalBalance.toLocaleString()}`, icon: <FiDollarSign className="h-5 w-5" /> },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Family Varisangya Wallets
              {wallets[0]?.family && ` - ${wallets[0].family.houseName}`}
            </h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              View wallet balances for families
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link to={ROUTES.COLLECTIBLES.FAMILY_VARISANGYA.LIST}>
              <Button variant="outline">
                <FiArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Button>
            </Link>
            <Breadcrumb
              items={[
                { label: 'Dashboard', path: '/dashboard' },
                { label: 'Collectibles', path: ROUTES.COLLECTIBLES.OVERVIEW },
                { label: 'Family Varisangya', path: ROUTES.COLLECTIBLES.FAMILY_VARISANGYA.LIST },
                { label: 'Wallet History' },
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button onClick={fetchWallets} className="mt-4" variant="outline">
              Retry
            </Button>
          </div>
        ) : (
          <Table columns={columns} data={wallets} emptyMessage="No wallets found" />
        )}
      </Card>
    </div>
  );
}

