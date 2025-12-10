// Common types used across the application

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'super_admin' | 'mahall' | 'survey' | 'institute' | 'member';
  tenantId?: string;
  memberId?: string;
  status: 'active' | 'inactive';
  joiningDate: string;
  lastLogin?: string;
  permissions?: Permission[];
  isSuperAdmin?: boolean;
  tenant?: {
    id: string;
    name: string;
    code: string;
  };
  member?: {
    id: string;
    name: string;
    phone: string;
    familyName: string;
  };
}

export interface Permission {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
}

export interface Family {
  id: string;
  tenantId?: string;
  mahallId?: string;
  houseName: string;
  familyHead?: string;
  contactNo?: string;
  wardNumber?: string;
  houseNo?: string;
  area?: string;
  place?: string;
  via?: string;
  state: string;
  district: string;
  pinCode?: string;
  postOffice?: string;
  lsgName: string;
  village: string;
  varisangyaGrade?: string;
  members?: Member[];
  status?: 'approved' | 'unapproved' | 'pending';
  createdAt: string;
}

export interface Member {
  id: string;
  tenantId?: string;
  mahallId?: string;
  name: string;
  familyId: string;
  familyName: string;
  age?: number;
  gender?: 'male' | 'female';
  bloodGroup?: string;
  healthStatus?: string;
  phone?: string;
  education?: string;
  createdAt: string;
}

export interface Institute {
  id: string;
  tenantId?: string;
  name: string;
  place: string;
  joinDate: string;
  type: 'institute' | 'program' | 'madrasa';
  description?: string;
  contactNo?: string;
  email?: string;
  address?: {
    state: string;
    district: string;
    pinCode?: string;
    postOffice?: string;
  };
  status?: 'active' | 'inactive';
  createdAt: string;
}

export interface Committee {
  id: string;
  tenantId?: string;
  name: string;
  description?: string;
  members?: Member[] | string[];
  status?: 'active' | 'inactive';
  createdAt: string;
}

export interface Meeting {
  id: string;
  tenantId?: string;
  committeeId: string;
  committeeName?: string;
  title: string;
  meetingDate: string;
  attendance?: Member[] | string[];
  totalMembers?: number;
  attendancePercent: number;
  agenda?: string;
  minutes?: string;
  status?: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

