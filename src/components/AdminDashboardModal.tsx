import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Check, 
  XCircle, 
  Eye, 
  FileText, 
  Building2, 
  Users, 
  ShoppingBag, 
  Key, 
  Phone, 
  MapPin, 
  RotateCcw,
  AlertTriangle,
  Search,
  ExternalLink,
  Trash2,
  Cloud,
  Database,
  RefreshCw
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { CITIES, CATEGORIES } from '../data/initialData';
import { Store } from '../types';

export const AdminDashboardModal: React.FC = () => {
  const { 
    isAdminModalOpen, 
    setIsAdminModalOpen, 
    isAdminLoggedIn, 
    loginAdmin, 
    logoutAdmin,
    adminCredentials,
    updateAdminCredentials,
    stores,
    approveStore,
    rejectStore,
    deleteStore,
    products,
    resetToDefaults,
    showToast,
    isFirebaseLive,
    isSyncing,
    seedFirestoreDemoData
  } = useMarket();

  // Login Form
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Dashboard Active Tab
  const [activeTab, setActiveTab] = useState<'pending' | 'stores' | 'security' | 'stats'>('pending');

  // Receipt Inspection Lightbox
  const [inspectReceiptUrl, setInspectReceiptUrl] = useState<string | null>(null);
  const [inspectStore, setInspectStore] = useState<Store | null>(null);

  // Security Credentials Form
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Rejection modal prompt
  const [rejectPromptStoreId, setRejectPromptStoreId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  if (!isAdminModalOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginAdmin(username, password);
  };

  const handleUpdateCreds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      showToast('يرجى تحديد اسم المستخدم الجديد', 'error');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      showToast('كلمتا المرور غير متطابقتين!', 'error');
      return;
    }
    updateAdminCredentials(newUsername.trim(), newPassword || adminCredentials.password);
    setNewUsername('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleConfirmReject = (storeId: string) => {
    rejectStore(storeId, rejectionReason);
    setRejectPromptStoreId(null);
    setRejectionReason('');
  };

  const pendingStores = stores.filter((s) => s.status === 'pending');
  const approvedStores = stores.filter((s) => s.status === 'approved');
  const rejectedStores = stores.filter((s) => s.status === 'rejected');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative flex flex-col max-h-[94vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-slate-50 shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">لوحة الإدارة والإشراف المركزي</h2>
                <span className="rounded bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/30">
                  سرية ومحمية
                </span>
              </div>
              <p className="text-xs text-slate-300">
                تدقيق طلبات التجار، مطابقة إيصالات الحوالات، وإدارة المنصة
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAdminModalOpen(false)}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        {!isAdminLoggedIn ? (
          /* Admin Login Screen */
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 flex items-center justify-center">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
              <div className="text-center mb-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-800 mb-2 border border-slate-200">
                  <Lock className="h-7 w-7 text-emerald-800" />
                </div>
                <h3 className="text-base font-bold text-slate-900">تسجيل دخول المشرف</h3>
                <p className="text-xs text-slate-500 mt-1">
                  الافتراضي: اسم المستخدم <span className="font-mono font-bold text-emerald-700">admin</span> | كلمة المرور <span className="font-mono font-bold text-emerald-700">admin123</span>
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم المستخدم (Username)
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    كلمة المرور (Password)
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 py-3 text-sm font-bold text-white shadow-xs transition-all active:scale-98"
                >
                  <ShieldCheck className="h-4 w-4 text-amber-300" />
                  <span>دخول لوحة التحكم</span>
                </button>
              </form>

              <button
                type="button"
                onClick={() => {
                  setUsername('admin');
                  setPassword('admin123');
                  loginAdmin('admin', 'admin123');
                }}
                className="mt-4 w-full text-center text-xs text-emerald-700 font-semibold hover:underline"
              >
                الدخول التلقائي بالبيانات الافتراضية
              </button>
            </div>
          </div>
        ) : (
          /* Logged-in Admin Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tab Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                    activeTab === 'pending'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>طلبات المراجعة</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      pendingStores.length > 0
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {pendingStores.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('stores')}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                    activeTab === 'stores'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span>المتاجر والفعاليات ({stores.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                    activeTab === 'security'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Key className="h-3.5 w-3.5" />
                  <span>الأمان وكلمة المرور</span>
                </button>

                <button
                  onClick={() => setActiveTab('stats')}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                    activeTab === 'stats'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>إحصائيات المنصة</span>
                </button>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Firebase Live Indicator */}
                <div className="hidden sm:flex items-center">
                  {isFirebaseLive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100/90 text-emerald-800 px-2.5 py-1 text-xs font-bold border border-emerald-300">
                      <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                      <Cloud className="h-3.5 w-3.5" />
                      <span>فايربيس متصل (Firestore Live)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 text-amber-800 px-2.5 py-1 text-xs font-bold border border-amber-300">
                      <Cloud className="h-3.5 w-3.5" />
                      <span>تخزين محلي احتياطي</span>
                    </span>
                  )}
                </div>

                {/* Seed demo data to Firestore */}
                <button
                  type="button"
                  onClick={seedFirestoreDemoData}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 text-xs font-bold border border-slate-300 transition-colors"
                  title="مزامنة عينات المتاجر والمنتجات إلى فايربيس"
                >
                  <RefreshCw className={`h-3.5 w-3.5 text-emerald-700 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span className="hidden md:inline">{isSyncing ? 'جارِ المزامنة...' : 'مزامنة العينات لفايربيس'}</span>
                </button>

                <button
                  onClick={logoutAdmin}
                  className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200 shrink-0"
                >
                  خروج المشرف
                </button>
              </div>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6">
              {/* TAB 1: PENDING MERCHANT REGISTRATIONS */}
              {activeTab === 'pending' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        طلبات تسجيل المتاجر الجديدة بانتظار التحقق من الحوالة
                      </h3>
                      <p className="text-xs text-slate-500">
                        قم بفحص إيصال الحوالة البنكية أو شركة الهرم/الفؤاد ثم اضغط "قبول" لتفعيل المتجر فوراً.
                      </p>
                    </div>
                  </div>

                  {pendingStores.length === 0 ? (
                    <div className="rounded-2xl bg-white p-12 text-center border border-slate-200 text-slate-500">
                      <Check className="mx-auto h-12 w-12 text-emerald-500 mb-2" />
                      <h4 className="font-bold text-slate-800">لا توجد طلبات معلقة حالياً</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        كافة طلبات التجار تم تدقيقها والموافقة عليها.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingStores.map((store) => {
                        const cityObj = CITIES.find((c) => c.id === store.city);
                        const catObj = CATEGORIES.find((c) => c.id === store.category);

                        return (
                          <div
                            key={store.id}
                            className="rounded-2xl bg-white p-4 sm:p-5 shadow-xs border border-amber-300 bg-amber-50/20"
                          >
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              {/* Store Details */}
                              <div className="space-y-2 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-black text-slate-900 text-base">
                                    {store.name}
                                  </h4>
                                  <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-300">
                                    قيد المراجعة
                                  </span>
                                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                                    {catObj?.nameAr}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                                  <div>
                                    <strong className="text-slate-800">المالك:</strong>{' '}
                                    {store.ownerName}
                                  </div>
                                  <div>
                                    <strong className="text-slate-800">المنطقة:</strong>{' '}
                                    {cityObj?.nameAr} - {store.address || 'العنوان غير محدد'}
                                  </div>
                                  <div>
                                    <strong className="text-slate-800">رقم الهاتف:</strong>{' '}
                                    <a
                                      href={`tel:${store.phone}`}
                                      className="text-emerald-700 font-bold hover:underline"
                                    >
                                      {store.phone}
                                    </a>
                                  </div>
                                  <div>
                                    <strong className="text-slate-800">تاريخ التقديم:</strong>{' '}
                                    {store.createdAt}
                                  </div>
                                </div>

                                {store.description && (
                                  <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    {store.description}
                                  </p>
                                )}

                                {/* Transfer Details */}
                                <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-2.5 text-xs text-emerald-950 flex flex-wrap items-center justify-between gap-2">
                                  <div>
                                    <span className="text-emerald-800 font-semibold block">
                                      طريقة وسند الدفع:
                                    </span>
                                    <span className="font-bold">
                                      {store.transferCompany || 'شركة الهرم'} | رقم الإشعار:{' '}
                                      <span className="font-mono text-emerald-900 bg-emerald-100 px-1.5 py-0.5 rounded">
                                        {store.transferReference || 'غير متوفر'}
                                      </span>
                                    </span>
                                  </div>

                                  {(store.receipt_base64 || store.receiptUrl) && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setInspectReceiptUrl(store.receipt_base64 || store.receiptUrl || null);
                                        setInspectStore(store);
                                      }}
                                      className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-white border border-emerald-300 px-2.5 py-1.5 rounded-lg shadow-2xs hover:bg-emerald-50 transition-colors"
                                    >
                                      <Eye className="h-3.5 w-3.5 text-emerald-600" />
                                      <span>معاينة الإيصال مكبراً</span>
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Receipt Thumbnail & Actions */}
                              <div className="flex flex-col items-center gap-3 shrink-0 border-t md:border-t-0 md:border-r border-slate-200 pt-3 md:pt-0 md:pr-4">
                                {(store.receipt_base64 || store.receiptUrl) ? (
                                  <div
                                    onClick={() => {
                                      setInspectReceiptUrl(store.receipt_base64 || store.receiptUrl || null);
                                      setInspectStore(store);
                                    }}
                                    className="group relative h-28 w-28 rounded-xl overflow-hidden border-2 border-emerald-500 cursor-pointer shadow-xs"
                                  >
                                    <img
                                      src={store.receipt_base64 || store.receiptUrl}
                                      alt="إيصال الحوالة"
                                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Eye className="h-5 w-5 text-white" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-28 w-28 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs text-center p-2 border border-slate-200">
                                    لا توجد صورة إيصال
                                  </div>
                                )}

                                {/* Approval & Rejection Buttons */}
                                <div className="flex items-center gap-2 w-full">
                                  <button
                                    onClick={() => approveStore(store.id)}
                                    className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-3 py-2 text-xs font-bold text-white shadow-xs transition-all active:scale-95"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                    <span>قبول وتفعيل</span>
                                  </button>

                                  <button
                                    onClick={() => setRejectPromptStoreId(store.id)}
                                    className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-2 text-xs font-bold transition-all active:scale-95"
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                    <span>رفض</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ALL STORES LIST */}
              {activeTab === 'stores' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        قائمة المحال والفعاليات التجارية ({stores.length})
                      </h3>
                      <p className="text-xs text-slate-500">
                        المتاجر النشطة، المعلقة، والمرفوضة عبر كافة المحافظات
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {stores.map((s) => {
                      const city = CITIES.find((c) => c.id === s.city);
                      const cat = CATEGORIES.find((c) => c.id === s.category);
                      const storeProdCount = products.filter((p) => p.storeId === s.id).length;

                      return (
                        <div
                          key={s.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-800 font-bold shrink-0">
                              🏬
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-slate-900">{s.name}</h4>
                                {s.status === 'approved' && (
                                  <span className="rounded bg-emerald-100 px-2 py-0.2 text-[10px] font-bold text-emerald-800">
                                    نشط
                                  </span>
                                )}
                                {s.status === 'pending' && (
                                  <span className="rounded bg-amber-100 px-2 py-0.2 text-[10px] font-bold text-amber-800">
                                    قيد المراجعة
                                  </span>
                                )}
                                {s.status === 'rejected' && (
                                  <span className="rounded bg-red-100 px-2 py-0.2 text-[10px] font-bold text-red-800">
                                    مرفوض
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                                <span>{city?.nameAr}</span>
                                <span>•</span>
                                <span>{cat?.nameAr}</span>
                                <span>•</span>
                                <span>الهاتف: {s.phone}</span>
                                <span>•</span>
                                <span className="font-semibold text-emerald-700">
                                  {storeProdCount} منتج معروض
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {s.status !== 'approved' && (
                              <button
                                onClick={() => approveStore(s.id)}
                                className="rounded-xl bg-emerald-700 hover:bg-emerald-800 px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition-colors"
                              >
                                تفعيل المتجر
                              </button>
                            )}
                            <button
                              onClick={() => deleteStore(s.id)}
                              className="rounded-xl p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="حذف المتجر بالكامل"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: SECURITY & ADMIN CREDENTIALS */}
              {activeTab === 'security' && (
                <div className="max-w-md mx-auto py-3 space-y-6">
                  <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                      <Key className="h-5 w-5 text-emerald-700" />
                      <h3 className="font-bold text-base text-slate-900">
                        تعديل بيانات أمان المشرف (Admin Credentials)
                      </h3>
                    </div>

                    <form onSubmit={handleUpdateCreds} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          اسم المستخدم الحالي
                        </label>
                        <input
                          type="text"
                          disabled
                          value={adminCredentials.username}
                          className="w-full rounded-xl bg-slate-100 border border-slate-200 px-3 py-2 text-xs text-slate-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          اسم مستخدم جديد (Username)
                        </label>
                        <input
                          type="text"
                          required
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          placeholder="مثال: super_admin"
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          كلمة المرور الجديدة (Password)
                        </label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="كلمة مرور جديدة قوية"
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          تأكيد كلمة المرور الجديدة
                        </label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="أعد كتابة كلمة المرور"
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs focus:border-emerald-600 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-xl bg-emerald-800 hover:bg-emerald-900 py-3 text-xs font-bold text-white shadow-xs transition-all active:scale-98"
                      >
                        حفظ بيانات الأمان الجديدة
                      </button>
                    </form>
                  </div>

                  {/* Demo Reset Box */}
                  <div className="rounded-2xl bg-slate-100 p-4 border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">إعادة ضبط المصنع للبيانات التجريبية</span>
                      <span className="text-slate-500">يعيد المنتجات والمتاجر الافتراضية وكلمات المرور الأولية.</span>
                    </div>
                    <button
                      onClick={resetToDefaults}
                      className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl transition-colors shrink-0"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>إعادة الضبط</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: PLATFORM STATISTICS */}
              {activeTab === 'stats' && (
                <div className="space-y-6">
                  {/* Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs">
                      <span className="text-xs text-slate-400 font-semibold block">المتاجر المعتمدة</span>
                      <span className="text-2xl font-black text-emerald-800 mt-1 block">
                        {approvedStores.length}
                      </span>
                    </div>
                    <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs">
                      <span className="text-xs text-slate-400 font-semibold block">طلبات بانتظار المراجعة</span>
                      <span className="text-2xl font-black text-amber-600 mt-1 block">
                        {pendingStores.length}
                      </span>
                    </div>
                    <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs">
                      <span className="text-xs text-slate-400 font-semibold block">إجمالي المنتجات</span>
                      <span className="text-2xl font-black text-slate-900 mt-1 block">
                        {products.length}
                      </span>
                    </div>
                    <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs">
                      <span className="text-xs text-slate-400 font-semibold block">المحافظات المغطاة</span>
                      <span className="text-2xl font-black text-indigo-700 mt-1 block">
                        3 محافظات
                      </span>
                    </div>
                  </div>

                  {/* City breakdown */}
                  <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-2xs">
                    <h4 className="font-bold text-sm text-slate-900 mb-3">
                      توزيع المنتجات والأنشطة بحسب المحافظة
                    </h4>
                    <div className="space-y-3">
                      {CITIES.filter((c) => c.id !== 'all').map((city) => {
                        const cityProducts = products.filter((p) => p.city === city.id).length;
                        const cityStores = stores.filter((s) => s.city === city.id).length;
                        const percentage = products.length > 0 ? Math.round((cityProducts / products.length) * 100) : 0;

                        return (
                          <div key={city.id} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-800 font-bold">{city.nameAr}</span>
                              <span className="text-slate-500">
                                {cityProducts} منتج • {cityStores} متجر ({percentage}%)
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-emerald-700 transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox for full-size receipt inspection */}
      {inspectReceiptUrl && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => {
            setInspectReceiptUrl(null);
            setInspectStore(null);
          }}
        >
          <div 
            className="relative max-h-[92vh] max-w-xl w-full bg-white rounded-3xl p-3 overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 px-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-800" />
                <span className="text-xs font-bold text-slate-900">
                  معاينة إيصال الحوالة: {inspectStore?.name} ({inspectStore?.transferReference})
                </span>
              </div>
              <button
                onClick={() => {
                  setInspectReceiptUrl(null);
                  setInspectStore(null);
                }}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-1 text-center">
              <img
                src={inspectReceiptUrl}
                alt="إيصال الحوالة بالحجم الكامل"
                className="mx-auto max-h-[72vh] w-auto object-contain rounded-xl shadow-xs"
              />
            </div>

            {inspectStore && inspectStore.status === 'pending' && (
              <div className="border-t border-slate-100 pt-3 px-2 flex items-center gap-2">
                <button
                  onClick={() => {
                    approveStore(inspectStore.id);
                    setInspectReceiptUrl(null);
                    setInspectStore(null);
                  }}
                  className="flex-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 py-2.5 text-xs font-bold text-white transition-colors"
                >
                  الموافقة على الإيصال وتفعيل المتجر فوراً
                </button>
                <button
                  onClick={() => {
                    setRejectPromptStoreId(inspectStore.id);
                    setInspectReceiptUrl(null);
                    setInspectStore(null);
                  }}
                  className="rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 px-4 py-2.5 text-xs font-bold transition-colors"
                >
                  رفض
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rejection Prompt Modal */}
      {rejectPromptStoreId && (
        <div 
          className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setRejectPromptStoreId(null)}
        >
          <div 
            className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>تأكيد رفض طلب تسجيل المتجر</span>
            </h4>
            <p className="text-xs text-slate-500">
              يرجى كتابة سبب الرفض ليظهر للتاجر عند محاولة تسجيل الدخول:
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="مثال: رقم الحوالة غير مطابق، أو صورة الإيصال غير واضحة."
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:border-red-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectPromptStoreId(null)}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleConfirmReject(rejectPromptStoreId)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
