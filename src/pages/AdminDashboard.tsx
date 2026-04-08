import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { Plus, Edit, Trash2, Loader2, Package, Inbox, Users, Check, X, Settings, LogOut, Search, ChevronRight, Archive } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

interface Product {
  id: string;
  title: string;
  category?: string;
}

interface RFQ {
  id: string;
  product_name: string;
  customer_name: string;
  customer_email: string;
  message: string;
  created_at: string;
  status: string;
}

interface Employee {
  id: string;
  email: string;
  role: 'admin' | 'employee' | 'pending' | 'rejected';
}

export default function AdminDashboard() {
  const { isMasterAdmin, role, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'rfqs' | 'employees' | 'settings'>('products');
  const [rfqStatusFilter, setRfqStatusFilter] = useState<'active' | 'new' | 'read' | 'archived' | 'all'>('active');
  const [rfqStartDate, setRfqStartDate] = useState<string>('');
  const [rfqEndDate, setRfqEndDate] = useState<string>('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  
  // Stats
  const [stats, setStats] = useState({ products: 0, newRfqs: 0, employees: 0 });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Always fetch stats
      const [prodRes, rfqRes, empRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('rfqs').select('id', { count: 'exact' }).eq('status', 'new'),
        (role === 'admin' || isMasterAdmin) ? supabase.from('profiles').select('id', { count: 'exact' }) : Promise.resolve({ count: 0 })
      ]);
      
      setStats({
        products: prodRes.count || 0,
        newRfqs: rfqRes.count || 0,
        employees: empRes.count || 0
      });

      // Fetch categories for filter
      const { data: catData } = await supabase.from('site_settings').select('value').eq('key', 'categories').single();
      if (catData && catData.value) {
        try {
          setCategories(JSON.parse(catData.value));
        } catch (e) {}
      }

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
          .order('created_at', { ascending: false });
        if (error) throw error;
        setRfqs(data || []);
      } else if (activeTab === 'employees' && (role === 'admin' || isMasterAdmin)) {
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
    if (window.confirm(t('admin.dashboard.products.deleteConfirm'))) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        setProducts(products.filter(p => p.id !== id));
        setStats(prev => ({ ...prev, products: prev.products - 1 }));
      } catch (error) {
        console.error("Error deleting product", error);
        alert(t('admin.dashboard.products.deleteError'));
      }
    }
  };

  const handleUpdateEmployeeStatus = async (id: string, role: 'admin' | 'employee' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', id);
      if (error) throw error;
      setEmployees(employees.map(emp => emp.id === id ? { ...emp, role } : emp));
    } catch (error) {
      console.error("Error updating employee status:", error);
      alert(t('admin.dashboard.employees.updateError'));
    }
  };

  const handleUpdateRfqStatus = async (id: string, newStatus: string, currentStatus: string) => {
    try {
      const { error } = await supabase
        .from('rfqs')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
      setRfqs(rfqs.map(rfq => rfq.id === id ? { ...rfq, status: newStatus } : rfq));
      
      // Update stats if moving in/out of 'new'
      if (currentStatus === 'new' && newStatus !== 'new') {
        setStats(prev => ({ ...prev, newRfqs: prev.newRfqs - 1 }));
      } else if (currentStatus !== 'new' && newStatus === 'new') {
        setStats(prev => ({ ...prev, newRfqs: prev.newRfqs + 1 }));
      }
    } catch (error) {
      console.error("Error updating RFQ status:", error);
      alert("Failed to update RFQ status.");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const filteredProducts = products.filter(p => {
    if (productCategoryFilter !== 'all') {
      if (productCategoryFilter === 'uncategorized') return !p.category;
      return p.category === productCategoryFilter;
    }
    return true;
  });

  const filteredRfqs = rfqs.filter(rfq => {
    const status = rfq.status || 'new';
    if (rfqStatusFilter === 'active') {
      if (status === 'archived') return false;
    } else if (rfqStatusFilter !== 'all' && status !== rfqStatusFilter) {
      return false;
    }
    
    if (rfqStartDate) {
      const rfqDate = new Date(rfq.created_at).toISOString().split('T')[0];
      if (rfqDate < rfqStartDate) return false;
    }
    
    if (rfqEndDate) {
      const rfqDate = new Date(rfq.created_at).toISOString().split('T')[0];
      if (rfqDate > rfqEndDate) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-stone-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-stone-900 p-1.5 rounded-lg">
                <Package className="h-5 w-5 text-amber-500" />
              </div>
              <h1 className="text-xl font-bold text-stone-900 tracking-tight">BOLEN Admin</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors hidden sm:block">
                View Website
              </Link>
              <div className="h-4 w-px bg-stone-300 hidden sm:block"></div>
              <button 
                onClick={handleLogout}
                className="inline-flex items-center text-sm font-medium text-stone-500 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex items-center gap-4">
            <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Total Products</p>
              <p className="text-2xl font-bold text-stone-900">{stats.products}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
              <Inbox className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">New RFQs</p>
              <p className="text-2xl font-bold text-stone-900">{stats.newRfqs}</p>
            </div>
          </div>
          {(role === 'admin' || isMasterAdmin) && (
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex items-center gap-4">
              <div className="bg-green-50 p-3 rounded-xl text-green-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-stone-500">Team Members</p>
                <p className="text-2xl font-bold text-stone-900">{stats.employees}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          {/* Tabs */}
          <div className="bg-white p-1 rounded-xl border border-stone-200 inline-flex overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab('products')}
              className={`${activeTab === 'products' ? 'bg-stone-100 text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'} px-4 py-2 rounded-lg font-medium text-sm flex items-center transition-all whitespace-nowrap`}
            >
              <Package className="h-4 w-4 mr-2" />
              {t('admin.dashboard.tabs.products')}
            </button>
            <button
              onClick={() => setActiveTab('rfqs')}
              className={`${activeTab === 'rfqs' ? 'bg-stone-100 text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'} px-4 py-2 rounded-lg font-medium text-sm flex items-center transition-all whitespace-nowrap`}
            >
              <Inbox className="h-4 w-4 mr-2" />
              {t('admin.dashboard.tabs.rfqs')}
              {stats.newRfqs > 0 && (
                <span className="ml-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {stats.newRfqs}
                </span>
              )}
            </button>
            {(role === 'admin' || isMasterAdmin) && (
              <button
                onClick={() => setActiveTab('employees')}
                className={`${activeTab === 'employees' ? 'bg-stone-100 text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'} px-4 py-2 rounded-lg font-medium text-sm flex items-center transition-all whitespace-nowrap`}
              >
                <Users className="h-4 w-4 mr-2" />
                {t('admin.dashboard.tabs.employees')}
              </button>
            )}
            <button
              onClick={() => setActiveTab('settings')}
              className={`${activeTab === 'settings' ? 'bg-stone-100 text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'} px-4 py-2 rounded-lg font-medium text-sm flex items-center transition-all whitespace-nowrap`}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </button>
          </div>

          {/* Action Button */}
          {activeTab === 'products' && (
            <Link to="/admin/products/new" className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              {t('admin.dashboard.addProduct')}
            </Link>
          )}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="bg-white shadow-sm border border-stone-200 rounded-2xl overflow-hidden animate-pulse">
            <div className="divide-y divide-stone-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="px-6 py-5 flex items-center justify-between">
                  <div>
                    <div className="h-5 w-48 bg-stone-200 rounded mb-2"></div>
                    <div className="h-4 w-32 bg-stone-100 rounded"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 bg-stone-100 rounded-lg"></div>
                    <div className="h-8 w-8 bg-stone-100 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'products' ? (
          <div className="space-y-6">
            <div className="bg-white p-4 shadow-sm border border-stone-200 rounded-2xl flex flex-col sm:flex-row gap-4 items-end sm:items-center">
              <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Category Filter</label>
                <select 
                  value={productCategoryFilter} 
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="block w-full rounded-xl border-stone-200 py-2 pl-3 pr-10 text-sm focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-stone-50"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="uncategorized">Uncategorized</option>
                </select>
              </div>
            </div>

            <div className="bg-white shadow-sm border border-stone-200 rounded-2xl overflow-hidden">
              <ul className="divide-y divide-stone-100">
                {filteredProducts.map((product) => (
                  <li key={product.id} className="hover:bg-stone-50 transition-colors">
                    <div className="px-6 py-4 flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-stone-900 truncate">{product.title}</p>
                        <p className="mt-1 flex items-center text-sm text-stone-500">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-stone-100 text-stone-800">
                            {product.category || t('admin.dashboard.products.uncategorized')}
                          </span>
                        </p>
                      </div>
                      <div className="ml-5 flex-shrink-0 flex gap-2">
                        <Link to={`/admin/products/${product.id}`} className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors">
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
                {filteredProducts.length === 0 && (
                  <li className="px-6 py-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-stone-300 mb-3" />
                    <p className="text-stone-500 font-medium">
                      {products.length === 0 ? t('admin.dashboard.products.noProducts') : 'No products match your filter.'}
                    </p>
                  </li>
                )}
              </ul>
            </div>
          </div>
        ) : activeTab === 'rfqs' ? (
          <div className="space-y-6">
            <div className="bg-white p-4 shadow-sm border border-stone-200 rounded-2xl flex flex-col sm:flex-row gap-4 items-end sm:items-center">
              <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Status Filter</label>
                <select 
                  value={rfqStatusFilter} 
                  onChange={(e) => setRfqStatusFilter(e.target.value as 'active' | 'new' | 'read' | 'archived' | 'all')}
                  className="block w-full rounded-xl border-stone-200 py-2 pl-3 pr-10 text-sm focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-stone-50"
                >
                  <option value="active">Active (New & Read)</option>
                  <option value="new">Unread (New)</option>
                  <option value="read">Read</option>
                  <option value="archived">Archived</option>
                  <option value="all">All RFQs</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Date Range</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="date" 
                    value={rfqStartDate} 
                    onChange={(e) => setRfqStartDate(e.target.value)}
                    className="block w-full rounded-xl border-stone-200 py-2 px-3 text-sm focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-stone-50"
                    placeholder="From"
                  />
                  <span className="text-stone-400 text-sm">to</span>
                  <input 
                    type="date" 
                    value={rfqEndDate} 
                    onChange={(e) => setRfqEndDate(e.target.value)}
                    className="block w-full rounded-xl border-stone-200 py-2 px-3 text-sm focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 bg-stone-50"
                    placeholder="To"
                  />
                  {(rfqStartDate || rfqEndDate) && (
                    <button 
                      onClick={() => { setRfqStartDate(''); setRfqEndDate(''); }} 
                      className="p-2 text-stone-400 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                      title="Clear date filter"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow-sm border border-stone-200 rounded-2xl overflow-hidden">
              <ul className="divide-y divide-stone-100">
                {filteredRfqs.map((rfq) => (
                  <li key={rfq.id} className={`p-6 transition-colors ${rfq.status === 'new' ? 'bg-amber-50/30' : rfq.status === 'archived' ? 'bg-stone-50/50 opacity-75' : 'hover:bg-stone-50'}`}>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-stone-900">{rfq.customer_name}</h3>
                          <span className="text-stone-300">•</span>
                          <span className="text-sm font-medium text-stone-600">{rfq.product_name}</span>
                        </div>
                        <p className="text-sm text-stone-500"><a href={`mailto:${rfq.customer_email}`} className="text-amber-600 hover:text-amber-700 hover:underline">{rfq.customer_email}</a></p>
                        <p className="text-xs text-stone-400 mt-1.5 font-mono">{new Date(rfq.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                          rfq.status === 'new' ? 'bg-amber-100 text-amber-800' : 
                          rfq.status === 'archived' ? 'bg-stone-200 text-stone-500' : 
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {rfq.status === 'new' ? t('admin.dashboard.rfqs.new') : rfq.status === 'archived' ? 'Archived' : 'Read'}
                        </span>
                        
                        <div className="flex items-center gap-2 mt-2">
                          {rfq.status === 'new' ? (
                            <button 
                              onClick={() => handleUpdateRfqStatus(rfq.id, 'read', rfq.status)}
                              className="text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors bg-stone-900 text-white hover:bg-stone-800"
                            >
                              <Check className="h-3.5 w-3.5" /> Mark Read
                            </button>
                          ) : rfq.status === 'archived' ? (
                            <button 
                              onClick={() => handleUpdateRfqStatus(rfq.id, 'read', rfq.status)}
                              className="text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors bg-stone-100 text-stone-600 hover:bg-stone-200"
                            >
                              <Inbox className="h-3.5 w-3.5" /> Unarchive
                            </button>
                          ) : (
                            <>
                              <button 
                                onClick={() => handleUpdateRfqStatus(rfq.id, 'new', rfq.status)}
                                className="text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors bg-stone-100 text-stone-600 hover:bg-stone-200"
                              >
                                Mark Unread
                              </button>
                              <button 
                                onClick={() => handleUpdateRfqStatus(rfq.id, 'archived', rfq.status)}
                                className="text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors bg-stone-100 text-stone-600 hover:bg-red-50 hover:text-red-600"
                              >
                                <Archive className="h-3.5 w-3.5" /> Archive
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 bg-stone-50 p-4 rounded-xl text-sm text-stone-700 whitespace-pre-wrap border border-stone-200/60 leading-relaxed">
                      {rfq.message}
                    </div>
                    <div className="mt-4 flex gap-4">
                      <a href={`mailto:${rfq.customer_email}?subject=Re: RFQ for ${rfq.product_name}`} className="inline-flex items-center text-sm font-semibold text-amber-600 hover:text-amber-700">
                        {t('admin.dashboard.rfqs.replyEmail')}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </a>
                    </div>
                  </li>
                ))}
                {filteredRfqs.length === 0 && (
                  <li className="px-6 py-12 text-center">
                    <Inbox className="mx-auto h-12 w-12 text-stone-300 mb-3" />
                    <p className="text-stone-500 font-medium">
                      {rfqs.length === 0 ? t('admin.dashboard.rfqs.noRfqs') : 'No RFQs match your filters.'}
                    </p>
                  </li>
                )}
              </ul>
            </div>
          </div>
        ) : activeTab === 'employees' ? (
          <div className="bg-white shadow-sm border border-stone-200 rounded-2xl overflow-hidden">
            <ul className="divide-y divide-stone-100">
              {employees.map((employee) => (
                <li key={employee.id} className="hover:bg-stone-50 transition-colors">
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-stone-900 truncate">{employee.email}</p>
                      <p className="mt-1 flex items-center text-sm text-stone-500">
                        {t('admin.dashboard.employees.status')} 
                        <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          employee.role === 'admin' ? 'bg-green-100 text-green-800' : 
                          employee.role === 'employee' ? 'bg-blue-100 text-blue-800' : 
                          employee.role === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                        </span>
                      </p>
                    </div>
                    <div className="ml-5 flex-shrink-0 flex gap-2 items-center">
                      {employee.role === 'pending' ? (
                        <>
                          <button onClick={() => handleUpdateEmployeeStatus(employee.id, 'employee')} className="px-3 py-1.5 text-xs bg-stone-900 text-white hover:bg-stone-800 rounded-lg font-medium transition-colors">
                            Approve as Employee
                          </button>
                          <button onClick={() => handleUpdateEmployeeStatus(employee.id, 'admin')} className="px-3 py-1.5 text-xs bg-stone-100 text-stone-900 hover:bg-stone-200 rounded-lg font-medium transition-colors">
                            Approve as Admin
                          </button>
                          <button onClick={() => handleUpdateEmployeeStatus(employee.id, 'rejected')} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title={t('admin.dashboard.employees.reject')}>
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <select 
                          value={employee.role}
                          onChange={(e) => handleUpdateEmployeeStatus(employee.id, e.target.value as 'admin' | 'employee' | 'rejected')}
                          className="text-sm border-stone-200 rounded-lg shadow-sm focus:border-stone-900 focus:ring-stone-900 bg-stone-50 py-1.5"
                        >
                          <option value="employee">Employee</option>
                          <option value="admin">Admin</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      )}
                    </div>
                  </div>
                </li>
              ))}
              {employees.length === 0 && (
                <li className="px-6 py-12 text-center text-stone-500">{t('admin.dashboard.employees.noEmployees')}</li>
              )}
            </ul>
          </div>
        ) : activeTab === 'settings' ? (
          <React.Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-8 w-8 text-stone-400 animate-spin" /></div>}>
            {React.createElement(React.lazy(() => import('./AdminSettings')))}
          </React.Suspense>
        ) : null}
      </div>
    </div>
  );
}
