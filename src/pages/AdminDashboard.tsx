import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';
import { Plus, Edit, Trash2, Loader2, Package, Inbox, Users, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Product {
  id: string;
  title: string;
  category?: string;
}

interface RFQ {
  id: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  message: string;
  createdAt: string;
}

interface Employee {
  id: string;
  email: string;
  role: 'admin' | 'pending' | 'rejected';
}

export default function AdminDashboard() {
  const { isMasterAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'rfqs' | 'employees'>('products');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'products') {
        const { data, error } = await supabase
          .from('products')
          .select('id, title, category')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setProducts(data || []);
      } else if (activeTab === 'rfqs') {
        const { data, error } = await supabase
          .from('rfqs')
          .select('*')
          .order('createdAt', { ascending: false });
        if (error) throw error;
        setRfqs(data || []);
      } else if (activeTab === 'employees' && isMasterAdmin) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setEmployees(data || []);
      }
    } catch (error) {
      console.error("Error fetching admin data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        console.error("Error deleting product", error);
        alert("Failed to delete product.");
      }
    }
  };

  const handleUpdateEmployeeStatus = async (id: string, role: 'admin' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', id);
      if (error) throw error;
      setEmployees(employees.map(emp => emp.id === id ? { ...emp, role } : emp));
    } catch (error) {
      console.error("Error updating employee status:", error);
      alert("Failed to update employee status.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Admin Dashboard</h1>
        <div className="mt-4 md:mt-0 flex space-x-4">
          <Link to="/admin/products/new" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700">
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </Link>
        </div>
      </div>

      <div className="mb-8 border-b border-stone-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`${activeTab === 'products' ? 'border-amber-500 text-amber-600' : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Package className="h-5 w-5 mr-2" />
            Products
          </button>
          <button
            onClick={() => setActiveTab('rfqs')}
            className={`${activeTab === 'rfqs' ? 'border-amber-500 text-amber-600' : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Inbox className="h-5 w-5 mr-2" />
            RFQs
          </button>
          {isMasterAdmin && (
            <button
              onClick={() => setActiveTab('employees')}
              className={`${activeTab === 'employees' ? 'border-amber-500 text-amber-600' : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'} whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Users className="h-5 w-5 mr-2" />
              Employees
            </button>
          )}
        </nav>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
        </div>
      ) : activeTab === 'products' ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-stone-200">
            {products.map((product) => (
              <li key={product.id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-600 truncate">{product.title}</p>
                      <p className="mt-2 flex items-center text-sm text-stone-500">
                        {product.category || 'Uncategorized'}
                      </p>
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0 flex gap-2">
                    <Link to={`/admin/products/${product.id}`} className="p-2 text-stone-400 hover:text-amber-600">
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-stone-400 hover:text-red-600">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {products.length === 0 && (
              <li className="px-4 py-8 text-center text-stone-500">No products found.</li>
            )}
          </ul>
        </div>
      ) : activeTab === 'rfqs' ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-stone-200">
            {rfqs.map((rfq) => (
              <li key={rfq.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-stone-900">{rfq.customerName} - {rfq.productName}</h3>
                    <p className="text-sm text-stone-500 mt-1"><a href={`mailto:${rfq.customerEmail}`} className="text-amber-600 hover:underline">{rfq.customerEmail}</a></p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    New
                  </span>
                </div>
                <div className="mt-4 bg-stone-50 p-4 rounded-md text-sm text-stone-700 whitespace-pre-wrap border border-stone-200">
                  {rfq.message}
                </div>
                <div className="mt-4 flex gap-4">
                  <a href={`mailto:${rfq.customerEmail}?subject=Re: RFQ for ${rfq.productName}`} className="text-sm font-medium text-amber-600 hover:text-amber-500">
                    Reply via Email
                  </a>
                </div>
              </li>
            ))}
            {rfqs.length === 0 && (
              <li className="px-4 py-8 text-center text-stone-500">No RFQs received yet.</li>
            )}
          </ul>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-stone-200">
            {employees.map((employee) => (
              <li key={employee.id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-600 truncate">{employee.email}</p>
                      <p className="mt-2 flex items-center text-sm text-stone-500">
                        Status: <span className={`ml-1 font-semibold ${employee.role === 'admin' ? 'text-green-600' : employee.role === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>{employee.role.toUpperCase()}</span>
                      </p>
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0 flex gap-2">
                    {employee.role !== 'admin' && (
                      <button onClick={() => handleUpdateEmployeeStatus(employee.id, 'admin')} className="p-2 text-green-600 hover:bg-green-50 rounded-full" title="Approve">
                        <Check className="h-5 w-5" />
                      </button>
                    )}
                    {employee.role !== 'rejected' && (
                      <button onClick={() => handleUpdateEmployeeStatus(employee.id, 'rejected')} className="p-2 text-red-600 hover:bg-red-50 rounded-full" title="Reject">
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
            {employees.length === 0 && (
              <li className="px-4 py-8 text-center text-stone-500">No employee accounts found.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
