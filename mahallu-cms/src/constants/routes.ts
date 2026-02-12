export const ROUTES = {
  // Auth
  LOGIN: '/login',
  
  // Dashboard
  DASHBOARD: '/dashboard',
  
  // Users
  USERS: {
    MAHALL: '/users/mahall',
    SURVEY: '/users/survey',
    INSTITUTE: '/users/institute',
    CREATE_MAHALL: '/users/mahall/create',
    EDIT_MAHALL: (id: string) => `/users/mahall/${id}/edit`,
  },
  
  // Families
  FAMILIES: {
    LIST: '/families',
    CREATE: '/families/create',
    UNAPPROVED: '/families/unapproved',
    DETAIL: (id: string) => `/families/${id}`,
    EDIT: (id: string) => `/families/${id}/edit`,
  },
  
  // Members
  MEMBERS: {
    LIST: '/members',
    CREATE: '/members/create',
    DETAIL: (id: string) => `/members/${id}`,
    EDIT: (id: string) => `/members/${id}/edit`,
  },
  
  // Institutes
  INSTITUTES: {
    LIST: '/institutes',
    CREATE: '/institutes/create',
    DETAIL: (id: string) => `/institutes/${id}`,
  },
  
  // Programs
  PROGRAMS: {
    LIST: '/programs',
    CREATE: '/programs/create',
    DETAIL: (id: string) => `/programs/${id}`,
  },
  
  // Madrasa
  MADRASA: {
    LIST: '/madrasa',
    CREATE: '/madrasa/create',
    DETAIL: (id: string) => `/madrasa/${id}`,
  },
  
  // Committees
  COMMITTEES: {
    LIST: '/committees',
    MEETINGS: '/committees/meetings',
    DETAIL: (id: string) => `/committees/${id}`,
  },
  
  // Registrations
  REGISTRATIONS: {
    NIKAH: '/registrations/nikah',
    DEATH: '/registrations/death',
    NOC: {
      COMMON: '/registrations/noc/common',
      NIKAH: '/registrations/noc/nikah',
    },
  },
  
  // Collectibles
  COLLECTIBLES: {
    OVERVIEW: '/collections',
    VARISANGYA: '/collectibles/varisangya',
    FAMILY_VARISANGYA: {
      LIST: '/collectibles/family-varisangya',
      TRANSACTIONS: '/collectibles/family-varisangya/transactions',
      WALLET: '/collectibles/family-varisangya/wallet',
    },
    MEMBER_VARISANGYA: {
      LIST: '/collectibles/member-varisangya',
      TRANSACTIONS: '/collectibles/member-varisangya/transactions',
      WALLET: '/collectibles/member-varisangya/wallet',
    },
    ZAKAT: '/collectibles/zakat',
  },
  
  // Social
  SOCIAL: {
    BANNERS: '/social/banners',
    CREATE_BANNER: '/social/banners/create',
    FEEDS: '/social/feeds',
    SUPER_FEEDS: '/social/super-feeds',
    ACTIVITY_LOGS: '/social/activity-logs',
    SUPPORT: '/social/support',
  },
  
  // Master Accounts
  MASTER_ACCOUNTS: {
    INSTITUTE_ACCOUNTS: '/master-accounts/institute',
    CATEGORIES: '/master-accounts/categories',
    WALLETS: '/master-accounts/wallets',
    LEDGERS: '/master-accounts/ledgers',
    LEDGER_ITEMS: '/master-accounts/ledger-items',
  },
  
  // Notifications
  NOTIFICATIONS: {
    INDIVIDUAL: '/notifications/individual',
    COLLECTION: '/notifications/collection',
  },
  
  // Reports
  REPORTS: {
    AREA: '/reports/area',
    BLOOD_BANK: '/reports/blood-bank',
    ORPHANS: '/reports/orphans',
  },
  
  // Mahall Main
  MAHALL_MAIN: '/mahall-main',
} as const;

