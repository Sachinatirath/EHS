import type { User } from '@/types';

export const DEMO_USERS: (User & { password: string })[] = [
  {
    id: 1,
    employee_id: 'AGT001',
    name: 'Vikram Singh',
    password: 'password123',
    role: 'agent',
    department: 'Manufacturing',
    phone: '+91 98765 11111',
    email: 'vikram.singh@example.com',
    address: 'Plot 22, Industrial Estate, Pune',
  },
  {
    id: 2,
    employee_id: 'AGT002',
    name: 'Sunita Rao',
    password: 'password123',
    role: 'agent',
    department: 'Warehouse',
    phone: '+91 98765 22222',
    email: 'sunita.rao@example.com',
    address: 'Sector 8, Warehouse Complex, Pune',
  },
  {
    id: 3,
    employee_id: 'HOD001',
    name: 'Manoj Kulkarni',
    password: 'password123',
    role: 'hod',
    department: 'EHS',
    phone: '+91 98765 33333',
    email: 'manoj.kulkarni@example.com',
    address: 'HOD Office, Plant Campus, Pune',
  },
];

export const USER_STORAGE_KEY = 'safety_observation.mock_user';
