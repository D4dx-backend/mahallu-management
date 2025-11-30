import { 
  FiHome, 
  FiUsers, 
  FiSettings, 
  FiDatabase, 
  FiFileText, 
  FiDollarSign,
  FiShare2,
  FiBarChart2,
  FiBell,
  FiLayers,
  FiShield,
  FiGrid,
  FiClipboard,
  FiBook,
  FiBriefcase,
  FiList,
  FiCreditCard,
  FiBookOpen,
  FiFileMinus,
  FiMessageSquare,
  FiMessageCircle,
  FiMap,
  FiDroplet,
  FiSmile,
  FiPlusSquare,
  FiAlertCircle,
  FiUserCheck,
  FiTarget,
  FiCalendar,
  FiClock,
  FiHeart,
  FiMinusCircle,
  FiFile,
  FiFilePlus,
  FiArchive,
  FiActivity,
  FiGift,
  FiImage,
  FiCast,
  FiStar,
  FiHelpCircle,
  FiUser
} from 'react-icons/fi';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType;
  path?: string;
  children?: MenuItem[];
  superAdminOnly?: boolean;
  allowedRoles?: ('super_admin' | 'mahall' | 'survey' | 'institute')[];
}

export const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: FiHome,
    path: '/dashboard',
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: FiShield,
    superAdminOnly: true,
    children: [
      { id: 'tenants', label: 'Tenants Management', icon: FiGrid, path: '/admin/tenants', superAdminOnly: true },
      { id: 'all-users', label: 'All Users', icon: FiUsers, path: '/admin/users', superAdminOnly: true },
    ],
  },
  {
    id: 'users',
    label: 'Users',
    icon: FiUsers,
    allowedRoles: ['super_admin', 'mahall'], // Only super admin and mahall can manage users
    children: [
      { id: 'mahall-users', label: 'Mahall Users', icon: FiUser, path: '/users/mahall', allowedRoles: ['super_admin', 'mahall'] },
      { id: 'survey-users', label: 'Survey Users', icon: FiClipboard, path: '/users/survey', allowedRoles: ['super_admin', 'mahall'] },
      { id: 'institute-users', label: 'Institute Users', icon: FiBook, path: '/users/institute', allowedRoles: ['super_admin', 'mahall'] },
    ],
  },
  {
    id: 'mahall-main',
    label: 'Mahall Main',
    icon: FiSettings,
    path: '/mahall-main',
  },
  {
    id: 'master-accounts',
    label: 'Master Accounts',
    icon: FiLayers,
    allowedRoles: ['super_admin', 'mahall', 'institute'], // All admin roles can access
    children: [
      { id: 'institute-accounts', label: 'Institute Accounts', icon: FiBriefcase, path: '/master-accounts/institute', allowedRoles: ['super_admin', 'mahall', 'institute'] },
      { id: 'categories', label: 'Institute Categories', icon: FiList, path: '/master-accounts/categories', allowedRoles: ['super_admin', 'mahall', 'institute'] },
      { id: 'wallets', label: 'Institute Wallets', icon: FiCreditCard, path: '/master-accounts/wallets', allowedRoles: ['super_admin', 'mahall', 'institute'] },
      { id: 'ledgers', label: 'Ledgers', icon: FiBookOpen, path: '/master-accounts/ledgers', allowedRoles: ['super_admin', 'mahall', 'institute'] },
      { id: 'ledger-items', label: 'Ledger Items', icon: FiFileMinus, path: '/master-accounts/ledger-items', allowedRoles: ['super_admin', 'mahall', 'institute'] },
    ],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: FiBell,
    children: [
      { id: 'individual', label: 'Individual', icon: FiMessageSquare, path: '/notifications/individual' },
      { id: 'collection', label: 'Collection', icon: FiMessageCircle, path: '/notifications/collection' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: FiBarChart2,
    children: [
      { id: 'area', label: 'Area', icon: FiMap, path: '/reports/area' },
      { id: 'blood-bank', label: 'Blood Bank', icon: FiDroplet, path: '/reports/blood-bank' },
      { id: 'orphans', label: 'Orphans', icon: FiSmile, path: '/reports/orphans' },
    ],
  },
  {
    id: 'data',
    label: 'Data',
    icon: FiDatabase,
    children: [
      {
        id: 'families',
        label: 'Families',
        icon: FiHome,
        children: [
          { id: 'all-families', label: 'All Families', icon: FiList, path: '/families' },
          { id: 'create-family', label: 'Create Family', icon: FiPlusSquare, path: '/families/create' },
          { id: 'unapproved', label: 'Unapproved', icon: FiAlertCircle, path: '/families/unapproved' },
        ],
      },
      { id: 'members', label: 'Members', icon: FiUserCheck, path: '/members' },
      { id: 'collections', label: 'Collections', icon: FiDollarSign, path: '/collections' },
      {
        id: 'institutes',
        label: 'Institutes',
        icon: FiTarget,
        children: [
          { id: 'all-institutes', label: 'All Institutes', icon: FiList, path: '/institutes' },
          { id: 'create-institute', label: 'Create Institute', icon: FiPlusSquare, path: '/institutes/create' },
        ],
      },
      {
        id: 'programs',
        label: 'Programs',
        icon: FiCalendar,
        children: [
          { id: 'all-programs', label: 'All Programs', icon: FiList, path: '/programs' },
          { id: 'create-program', label: 'Create Programme', icon: FiPlusSquare, path: '/programs/create' },
        ],
      },
      {
        id: 'madrasa',
        label: 'Madrasa',
        icon: FiBook,
        children: [
          { id: 'all-madrasa', label: 'All Madrasa', icon: FiList, path: '/madrasa' },
          { id: 'create-madrasa', label: 'Create Madrasa', icon: FiPlusSquare, path: '/madrasa/create' },
        ],
      },
      {
        id: 'committees',
        label: 'Committees',
        icon: FiUsers,
        children: [
          { id: 'all-committees', label: 'All Committees', icon: FiList, path: '/committees' },
          { id: 'all-meetings', label: 'All Meetings', icon: FiClock, path: '/committees/meetings' },
        ],
      },
    ],
  },
  {
    id: 'registrations',
    label: 'Registrations',
    icon: FiFileText,
    children: [
      { id: 'nikah', label: 'Nikah Registrations', icon: FiHeart, path: '/registrations/nikah' },
      { id: 'death', label: 'Death Registrations', icon: FiMinusCircle, path: '/registrations/death' },
      {
        id: 'noc',
        label: 'N.O.C',
        icon: FiFile,
        children: [
          { id: 'common-noc', label: 'Common NOC', icon: FiFileText, path: '/registrations/noc/common' },
          { id: 'nikah-noc', label: 'Nikah NOC', icon: FiFilePlus, path: '/registrations/noc/nikah' },
          { id: 'create-noc', label: 'Create NOC', icon: FiPlusSquare, path: '/registrations/noc/create' },
        ],
      },
    ],
  },
  {
    id: 'collectibles',
    label: 'Collectibles',
    icon: FiDollarSign,
    children: [
      { id: 'varisangya', label: 'Varisangyas', icon: FiArchive, path: '/collectibles/varisangya' },
      {
        id: 'family-varisangya',
        label: 'Family Varisangya',
        icon: FiHome,
        children: [
          { id: 'family-list', label: 'List', icon: FiList, path: '/collectibles/family-varisangya' },
          { id: 'family-transactions', label: 'Transactions', icon: FiActivity, path: '/collectibles/family-varisangya/transactions' },
          { id: 'family-wallet', label: 'Wallet History', icon: FiCreditCard, path: '/collectibles/family-varisangya/wallet' },
        ],
      },
      {
        id: 'member-varisangya',
        label: 'Member Varisangya',
        icon: FiUser,
        children: [
          { id: 'member-list', label: 'List', icon: FiList, path: '/collectibles/member-varisangya' },
          { id: 'member-transactions', label: 'Transactions', icon: FiActivity, path: '/collectibles/member-varisangya/transactions' },
          { id: 'member-wallet', label: 'Wallet History', icon: FiCreditCard, path: '/collectibles/member-varisangya/wallet' },
        ],
      },
      { id: 'zakat', label: 'Zakat', icon: FiGift, path: '/collectibles/zakat' },
    ],
  },
  {
    id: 'social',
    label: 'Social',
    icon: FiShare2,
    children: [
      { id: 'banners', label: 'Banners', icon: FiImage, path: '/social/banners' },
      { id: 'feeds', label: 'Feeds', icon: FiCast, path: '/social/feeds' },
      { id: 'super-feeds', label: 'Super Feeds', icon: FiStar, path: '/social/super-feeds' },
      { id: 'activity-logs', label: 'Activity Logs', icon: FiActivity, path: '/social/activity-logs' },
      { id: 'support', label: 'Support', icon: FiHelpCircle, path: '/social/support' },
    ],
  },
];
