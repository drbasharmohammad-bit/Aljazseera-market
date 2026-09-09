import React, { useState } from 'react';
import { 
  X, 
  Store as StoreIcon, 
  Plus, 
  Trash2, 
  Edit3, 
  LogOut, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Package, 
  Image as ImageIcon,
  DollarSign,
  Phone,
  Sparkles,
  Upload
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { CITIES, CATEGORIES } from '../data/initialData';
import { CategoryId, CityId, Product } from '../types';

export const MerchantDashboardModal: React.FC = () => {
  const { 
    isMerchantModalOpen, 
    setIsMerchantModalOpen, 
    currentMerchant, 
    loginMerchant, 
    logoutMerchant,
    products,
    addProduct,
    deleteProduct,
    showToast,
    stores
  } = useMarket();

  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Add listing state
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [prodTitle, setProdTitle] = useState('');
  const [prodPriceSyp, setProdPriceSyp] = useState('');
  const [prodPriceUsd, setProdPriceUsd] = useState('');
  const [prodCategory, setProdCategory] = useState<CategoryId>('restaurants');
  const [prodCondition, setProdCondition] = useState<'جديد' | 'مستعمل بحالة ممتازة' | 'طبيعي طازج' | 'حسب الطلب'>('جديد');
  const [prodDescription, setProdDescription] = useState('');
  const [prodImage, setProdImage] = useState('');

  if (!isMerchantModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim()) {
      showToast('يرجى إدخال رقم هاتف المتجر', 'error');
      return;
    }
    loginMerchant(loginPhone, loginPassword);
  };

  const handleQuickLogin = (phone: string, pass: string = '123456') => {
    setLoginPhone(phone);
    setLoginPassword(pass);
    loginMerchant(phone, pass);
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMerchant) return;

    if (!prodTitle.trim()) {
      showToast('يرجى كتابة عنوان المنتج', 'error');
      return;
    }

    const priceSypNum = parseInt(prodPriceSyp.replace(/\D/g, ''), 10) || 0;
    const priceUsdNum = prodPriceUsd ? parseFloat(prodPriceUsd) : undefined;

    if (priceSypNum <= 0) {
      showToast('يرجى إدخال سعر صحيح بالليرة السورية', 'error');
      return;
    }

    // Default image if empty
    const fallbackImage =
      prodImage.trim() ||
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80';

    addProduct({
      storeId: currentMerchant.id,
      storeName: currentMerchant.name,
      title: prodTitle.trim(),
      description: prodDescription.trim() || 'منتج عالي الجودة مع ضمان المتجر',
      priceSyp: priceSypNum,
      priceUsd: priceUsdNum,
      imageUrl: fallbackImage,
      city: currentMerchant.city,
      category: prodCategory,
      phone: currentMerchant.phone,
      whatsapp: currentMerchant.whatsapp,
      isAvailable: true,
      condition: prodCondition,
    });

    // Reset form
    setProdTitle('');
    setProdPriceSyp('');
    setProdPriceUsd('');
    setProdDescription('');
    setProdImage('');
    setIsAddingProduct(false);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProdImage(reader.result as string);
        showToast('تم تحميل صورة المنتج بنجاح', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // Products belonging to current merchant
  const myProducts = currentMerchant
    ? products.filter((p) => p.storeId === currentMerchant.id)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative flex flex-col max-h-[94vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-slate-50 shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-emerald-950 font-bold">
              <StoreIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">بوابة التجار وإدارة المحال</h2>
              <p className="text-xs text-emerald-200">
                إدارة المعروضات والمنتجات في سوق الجزيرة والفرات
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMerchantModalOpen(false)}
            className="rounded-full p-1.5 text-emerald-300 hover:bg-emerald-700 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6">
          {!currentMerchant ? (
            /* Login Screen */
            <div className="mx-auto max-w-md py-4">
              <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200/90">
                <div className="text-center mb-6">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 mb-3 border border-emerald-200">
                    <StoreIcon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">تسجيل دخول التجار</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    أدخل رقم الهاتف المسجل به المتجر للدخول إلى لوحة تحكمك
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      رقم الهاتف المسجل
                    </label>
                    <input
                      type="tel"
                      required
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      placeholder="مثال: +963933112233 أو 0933112233"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      كلمة المرور
                    </label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="كلمة المرور (اختياري للحسابات التجريبية)"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-bold text-white shadow-xs hover:bg-emerald-800 transition-all active:scale-98"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                    <span>دخول لوحة المتجر</span>
                  </button>
                </form>

                {/* Quick Test Logins */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <span className="block text-[11px] font-bold text-slate-400 mb-2">
                    حسابات تجريبية سريعة للتجربة:
                  </span>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('+963933112233')}
                      className="w-full flex items-center justify-between rounded-xl bg-slate-50 hover:bg-emerald-50/60 p-2.5 text-xs text-slate-700 border border-slate-200 transition-colors"
                    >
                      <span className="font-bold">سوبرماركت الفرات المركزي (دير الزور)</span>
                      <span className="text-[11px] text-emerald-700 font-semibold">دخول فوري</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('+963988445566')}
                      className="w-full flex items-center justify-between rounded-xl bg-slate-50 hover:bg-emerald-50/60 p-2.5 text-xs text-slate-700 border border-slate-200 transition-colors"
                    >
                      <span className="font-bold">معرض الجزيرة للأجهزة (الحسكة)</span>
                      <span className="text-[11px] text-emerald-700 font-semibold">دخول فوري</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('+963994556677', 'store123')}
                      className="w-full flex items-center justify-between rounded-xl bg-amber-50/50 hover:bg-amber-100/60 p-2.5 text-xs text-amber-900 border border-amber-200 transition-colors"
                    >
                      <span className="font-bold">معرض الفرات للمفروشات (طلب قيد المراجعة)</span>
                      <span className="text-[11px] text-amber-700 font-semibold">تجربة فحص الحالة</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Logged-in Merchant Portal */
            <div className="space-y-5">
              {/* Merchant Status Card */}
              <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/90">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white font-black text-xl shadow-xs">
                      🏬
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-slate-900 text-base sm:text-lg">
                          {currentMerchant.name}
                        </h3>
                        {currentMerchant.status === 'approved' && (
                          <span className="flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[11px] font-bold border border-emerald-300">
                            <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                            <span>متجر معتمد ونشط</span>
                          </span>
                        )}
                        {currentMerchant.status === 'pending' && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[11px] font-bold border border-amber-300">
                            <Clock className="h-3 w-3 text-amber-700" />
                            <span>قيد المراجعة من الإدارة</span>
                          </span>
                        )}
                        {currentMerchant.status === 'rejected' && (
                          <span className="flex items-center gap-1 rounded-full bg-red-100 text-red-800 px-2 py-0.5 text-[11px] font-bold border border-red-300">
                            <XCircle className="h-3 w-3 text-red-700" />
                            <span>مرفوض</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        رقم الهاتف: {currentMerchant.phone} | المدينة:{' '}
                        {CITIES.find((c) => c.id === currentMerchant.city)?.nameAr}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={logoutMerchant}
                    className="flex items-center gap-1.5 self-start sm:self-center text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>تسجيل خروج</span>
                  </button>
                </div>

                {/* Status Notice */}
                {currentMerchant.status === 'pending' && (
                  <div className="mt-4 rounded-xl bg-amber-50 p-3.5 border border-amber-200 text-xs text-amber-900">
                    <strong className="block font-bold mb-1">
                      طلب اشتراكك قيد المراجعة والتدقيق:
                    </strong>
                    لقد تم إرسال إشعار حوالة الاشتراك (الرقم المرجعي:{' '}
                    <span className="font-mono font-bold">
                      {currentMerchant.transferReference || 'غير محدد'}
                    </span>
                    ). سيقوم المشرف بالتحقق من الإيصال وتفعيل متجرك لنشر المنتجات مباشرة.
                  </div>
                )}

                {currentMerchant.status === 'rejected' && (
                  <div className="mt-4 rounded-xl bg-red-50 p-3.5 border border-red-200 text-xs text-red-900">
                    <strong className="block font-bold mb-1">تم رفض طلب المتجر:</strong>
                    سبب الرفض: {currentMerchant.rejectionReason || 'يرجى مراجعة إدارة المنصة للتفاصيل.'}
                  </div>
                )}
              </div>

              {/* Product Management Section (Available for Approved Merchants) */}
              {currentMerchant.status === 'approved' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-emerald-700" />
                      <h4 className="text-base font-bold text-slate-900">
                        معروضات المتجر ({myProducts.length})
                      </h4>
                    </div>

                    {!isAddingProduct && (
                      <button
                        onClick={() => setIsAddingProduct(true)}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-all active:scale-95"
                      >
                        <Plus className="h-4 w-4" />
                        <span>إضافة منتج أو عرض جديد</span>
                      </button>
                    )}
                  </div>

                  {/* Add Product Form */}
                  {isAddingProduct && (
                    <form
                      onSubmit={handleAddProductSubmit}
                      className="rounded-2xl bg-white p-5 shadow-xs border border-emerald-200 mb-6 space-y-4 animate-in fade-in duration-200"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h5 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-amber-500" />
                          <span>إضافة منتج أو عرض جديد في السوق</span>
                        </h5>
                        <button
                          type="button"
                          onClick={() => setIsAddingProduct(false)}
                          className="text-xs text-slate-400 hover:text-slate-600"
                        >
                          إلغاء
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            اسم أو عنوان المنتج *
                          </label>
                          <input
                            type="text"
                            required
                            value={prodTitle}
                            onChange={(e) => setProdTitle(e.target.value)}
                            placeholder="مثال: غنم بلدي نعيمي أو خضار طازجة"
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            القسم أو التصنيف *
                          </label>
                          <select
                            value={prodCategory}
                            onChange={(e) => setProdCategory(e.target.value as CategoryId)}
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white"
                          >
                            {CATEGORIES.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.nameAr}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            السعر بالليرة السورية (ل.س) *
                          </label>
                          <input
                            type="number"
                            required
                            value={prodPriceSyp}
                            onChange={(e) => setProdPriceSyp(e.target.value)}
                            placeholder="مثال: 350000"
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            السعر بالدولار (USD - اختياري)
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={prodPriceUsd}
                            onChange={(e) => setProdPriceUsd(e.target.value)}
                            placeholder="مثال: 25"
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            حالة السلعة
                          </label>
                          <select
                            value={prodCondition}
                            onChange={(e) => setProdCondition(e.target.value as any)}
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs bg-white"
                          >
                            <option value="جديد">جديد</option>
                            <option value="مستعمل بحالة ممتازة">مستعمل بحالة ممتازة</option>
                            <option value="طبيعي طازج">طبيعي طازج</option>
                            <option value="حسب الطلب">حسب الطلب</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          الوصف والمواصفات
                        </label>
                        <textarea
                          rows={2}
                          value={prodDescription}
                          onChange={(e) => setProdDescription(e.target.value)}
                          placeholder="اكتب مواصفات السلعة، مدة الضمان، الكمية المتوفرة..."
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                        />
                      </div>

                      {/* Image Upload / URL */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          صورة المنتج
                        </label>
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          <input
                            type="text"
                            value={prodImage}
                            onChange={(e) => setProdImage(e.target.value)}
                            placeholder="رابط صورة مباشر أو اختر ملفاً من جهازك"
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                          />
                          <label className="shrink-0 flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 cursor-pointer">
                            <Upload className="h-3.5 w-3.5" />
                            <span>رفع صورة</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                        {prodImage && (
                          <div className="mt-2 h-16 w-16 overflow-hidden rounded-lg border border-slate-200">
                            <img
                              src={prodImage}
                              alt="معاينة"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingProduct(false)}
                          className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                        >
                          إلغاء
                        </button>
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all active:scale-95"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-200" />
                          <span>نشر المنتج الآن</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of Products */}
                  {myProducts.length === 0 ? (
                    <div className="rounded-2xl bg-white p-8 text-center border border-slate-200 text-slate-500 text-xs">
                      لا توجد لديك منتجات معروضة حالياً. اضغط على زر "إضافة منتج أو عرض جديد" للبدء.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myProducts.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between rounded-2xl bg-white p-3.5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={p.imageUrl}
                              alt={p.title}
                              className="h-14 w-14 rounded-xl object-cover border border-slate-100"
                            />
                            <div>
                              <h5 className="font-bold text-sm text-slate-900 line-clamp-1">
                                {p.title}
                              </h5>
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-emerald-800 font-bold">
                                <span>{new Intl.NumberFormat('ar-SY').format(p.priceSyp)} ل.س</span>
                                {p.priceUsd && (
                                  <span className="text-[11px] text-slate-400 font-normal">
                                    (${p.priceUsd})
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">
                                القسم:{' '}
                                {CATEGORIES.find((c) => c.id === p.category)?.nameAr || 'عام'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => deleteProduct(p.id)}
                              className="rounded-xl p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="حذف المنتج"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
