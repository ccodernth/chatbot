// app/routes/admin/products.tsx
import React from 'react';
import { json, LoaderFunction, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import AdminLayout from '../../components/admin/AdminLayout';
import ProductManagement from '../../components/admin/ProductManagement';
import { AdminProvider } from '../../contexts/AdminContext';
import { requireAuth } from '../../utils/auth.server';

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireAuth(request);
  
  // Check if user is admin
  if (user.role !== 'admin') {
    return redirect('/');
  }

  return json({ user });
};

export default function AdminProductsRoute() {
  const { user } = useLoaderData();

  return (
    <AdminProvider>
      <AdminLayout>
        <ProductManagement />
      </AdminLayout>
    </AdminProvider>
  );
}