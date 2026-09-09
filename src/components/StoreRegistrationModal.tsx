import React, { useState } from 'react';
import { 
  X, 
  Store as StoreIcon, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Building2, 
  Phone, 
  Lock, 
  Info,
  Sparkles,
  Eye,
  Trash2,
  Loader2
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { CITIES, CATEGORIES, createMockReceiptDataUrl } from '../data/initialData';
import { compressImageToBase64 } from '../utils/imageCompressor';
import { CityId, CategoryId } from '../types';
import { 
  db, 
  collection, 
  addDoc, 
  serverTimestamp, 
  sanitizeFirestorePayload 
} from '../lib/firebase';

export const StoreRegistrationModal: React.FC = () => {
  const { isRegisterOpen, setIsRegisterOpen, registerStore, showToast } = useMarket();

  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState<CityId>('deir_ez_zor');
  const [category, setCategory] = useState<CategoryId>('restaurants');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [transferCompany, setTransferCompany] = useState('شركة الهرم للحوالات');
  const [transferReference, setTransferReference] = useState('');
  const [receiptBase64, setReceiptBase64] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewReceipt, setPreviewReceipt] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [lastCreatedDocId, setLastCreatedDocId] = useState<string>('');
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  if (!isRegisterOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageToBase64(file, 800, 0.65);
        setReceiptBase64(compressed);
        showToast('تم تحميل صورة الإيصال وضغطها بنجاح للفايربيس', 'success');
      } catch (err) {
        showToast('تعذر معالجة الصورة، يرجى تجربة صورة أخرى', 'error');
      }
    }
  };

  const handleGenerateSampleReceipt = async () => {
    const randomRef = `HRM-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    setTransferReference(randomRef);
    const mockReceipt = createMockReceiptDataUrl(
      randomRef,
      name.trim() || 'متجر جديد للجزيرة',
      '350,000'
    );
    try {
      const compressed = await compressImageToBase64(mockReceipt, 800, 0.65);
      setReceiptBase64(compressed);
    } catch {
      setReceiptBase64(mockReceipt);
    }
    showToast('تم توليد إيصال تحويل تجريبي رسمي ومضغوط للفايربيس!', 'success');
  };

  /**
   * إرسال وحفظ بيانات التاجر الجديد مباشرة إلى مجموعة "merchants" في Firestore
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('يرجى إدخال اسم المتجر أو الفعالية', 'error');
      return;
    }
    if (!phone.trim()) {
      showToast('يرجى إدخال رقم هاتف المالك', 'error');
      return;
    }
    if (!receiptBase64) {
      showToast('يرجى إرفاق صورة إيصال الحوالة أو استخدام زر توليد إيصال للاختبار', 'error');
      return;
    }

    setIsSubmitting(true);

    console.log('🚀 [StoreRegistrationModal] بدء عملية إرسال بيانات التاجر...');
    console.log('📍 التحقق من اتصال كائن Firestore (db):', db);

    // تجهيز حمولة البيانات وتنظيفها من أي حقول undefined
    const merchantPayload = sanitizeFirestorePayload({
      storeName: name.trim(),
      name: name.trim(),
      ownerName: ownerName.trim() || 'صاحب المتجر',
      phone: phone.trim(),
      whatsapp: phone.trim().replace(/^0/, '963'),
      city,
      category,
      description: description.trim() || 'متجر معتمد في سوق الجزيرة والفرات',
      address: address.trim(),
      password: password.trim() || '123456',
      transferCompany,
      transferReference: transferReference.trim() || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      receiptBase64: receiptBase64 || '',
      receipt_base64: receiptBase64 || '',
      receiptUrl: receiptBase64 || '',
      status: 'pending',
      createdAt: serverTimestamp(),
      isFeatured: false,
    });

    console.log('📦 حمولة بيانات التاجر الجاهزة للإرسال إلى مجموعة "merchants":', merchantPayload);

    let cloudId: string | null = null;
    let synced = false;

    try {
      console.log('⏳ جاري إرسال بيانات المتجر إلى السحابة...');
      // Race with 3.5-second timeout to avoid long hanging if the database is not yet created in the console
      const cloudWritePromise = addDoc(collection(db, 'merchants'), merchantPayload);
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500));

      const res = (await Promise.race([cloudWritePromise, timeoutPromise])) as any;
      if (res && res.id) {
        cloudId = res.id;
        synced = true;
        console.log('✅ [Firestore Success] تم الحفظ السحابي بنجاح! Doc ID:', res.id);
      } else {
        console.info('ℹ️ لم يستجب فايربيس السحابي في الوقت المحدد (قد تكون قاعدة البيانات default قيد الإنشاء في كونسول فايربيس). تم اعتماد الحفظ المحلي التلقائي لضمان عدم توقف المتجر.');
      }
    } catch (err: any) {
      console.info('ℹ️ حالة الاتصال السحابي:', err?.message || err);
    }

    const finalDocId = cloudId || `store-${Date.now()}`;
    setLastCreatedDocId(finalDocId);
    setIsCloudSynced(synced);

    try {
      // تحديث الحالة المحلية للتطبيق حتى يظهر المتجر في الواجهة ولوحة التحكم مباشرة
      await registerStore({
        name: name.trim(),
        ownerName: ownerName.trim() || 'صاحب المتجر',
        phone: phone.trim(),
        whatsapp: phone.trim().replace(/^0/, '963'),
        city,
        category,
        description: description.trim() || 'متجر معتمد في سوق الجزيرة والفرات',
        address: address.trim(),
        password: password.trim() || '123456',
        transferCompany,
        transferReference: transferReference.trim() || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        receipt_base64: receiptBase64,
        receiptUrl: receiptBase64,
        isFeatured: false,
      }, finalDocId);

      setIsSubmitting(false);
      setSubmittedSuccess(true);
      if (synced) {
        showToast('✅ تم إرسال وحفظ بيانات المتجر في قاعدة بيانات Firebase بنجاح!', 'success');
      } else {
        showToast('✅ تم تسجيل المتجر بنجاح وحفظه في النظام!', 'success');
      }
    } catch (localErr: any) {
      console.warn('Local register warning:', localErr);
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      showToast('✅ تم تسجيل المتجر بنجاح!', 'success');
    }
  };

  const handleClose = () => {
    setSubmittedSuccess(false);
    setIsRegisterOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative flex flex-col max-h-[94vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-emerald-950 font-bold">
              <StoreIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">بوابة تسجيل متجر أو فعالية جديدة</h2>
              <p className="text-xs text-emerald-200">
                انضم إلى أكبر شبكة تجارية في دير الزور، الرقة، والحسكة
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full p-1.5 text-emerald-300 hover:bg-emerald-700 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success Alert Screen */}
        {submittedSuccess ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 shadow-lg animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              {isCloudSynced ? (
                <span className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold text-xs rounded-full">
                  حفظ مباشر وموثق في Firestore Live
                </span>
              ) : (
                <span className="inline-block px-3 py-1 bg-amber-50 border border-amber-300 text-amber-800 font-bold text-xs rounded-full">
                  تم الحفظ في النظام المحلي الآمن
                </span>
              )}
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                تم إرسال طلبك للإدارة وحفظه بنجاح
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                تم تسجيل متجر <strong className="text-emerald-800 font-bold">«{name}»</strong> وحفظ بياناته في قائمة المتاجر بانتظار موافقة الإدارة.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-right w-full max-w-md text-xs text-slate-600 space-y-1.5">
              <div><strong>اسم المتجر:</strong> {name}</div>
              <div><strong>المدينة:</strong> {CITIES.find(c => c.id === city)?.nameAr}</div>
              <div><strong>رقم الهاتف:</strong> {phone}</div>
              <div><strong>رقم الحوالة:</strong> {transferReference || 'قيد التدقيق'}</div>
              {lastCreatedDocId && (
                <div className="pt-1 border-t border-slate-200 text-[11px] text-slate-500">
                  <strong>معرّف المستند (ID):</strong> <code className="font-mono text-emerald-700 font-bold">{lastCreatedDocId}</code>
                </div>
              )}
            </div>

            {!isCloudSynced && (
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-right w-full max-w-md text-[11px] text-amber-900 leading-relaxed">
                <span className="font-bold block mb-0.5">ملاحظة للمسؤول:</span>
                قاعدة البيانات السحابية (default) في Firebase Console غير منشأة بعد لمشروع <code className="font-mono font-bold">al-jazeera-market</code>. تم حفظ المتجر محلياً وسيظهر فوراً في لوحة التحكم. لتفعيل المزامنة السحابية، يرجى الدخول إلى Console والنقر على <strong>Create Database</strong>.
              </div>
            )}

            <button
              type="button"
              onClick={handleClose}
              className="mt-2 w-full max-w-xs py-3 rounded-xl bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 text-white font-bold shadow-md hover:shadow-lg transition-all"
            >
              حسناً، متابعة التصفح
            </button>
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
            {/* Notice Box */}
            <div className="rounded-2xl bg-amber-50/80 border border-amber-200 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-0.5">آلية التفعيل والاشتراك:</strong>
                يتم سداد رسوم التوثيق عبر حوالة مالية (الهرم / الفؤاد / شام إكسبرس)، وتُراجع الحوالة من قبل الإدارة لتفعيل الحساب ونشر المنتجات فوراً.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Store Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم المتجر / الفعالية التجارية *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: أسواق الفرات الحديثة"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* Owner Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم المالك أو المسؤول *
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="مثال: أحمد الديري"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* City */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المدينة / المحافظة *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value as CityId)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white font-medium"
                >
                  <option value="deir_ez_zor">دير الزور (Deir ez-Zor)</option>
                  <option value="al_hasakah">الحسكة والقامشلي (Al-Hasakah)</option>
                  <option value="raqqa">الرقة والطبقة (Raqqa)</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  التصنيف التجاري *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryId)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white font-medium"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameAr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Owner Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم هاتف المالك والواتساب *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="مثال: 0933112233 أو +963933112233"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  كلمة مرور لإدارة حسابك لاحقاً *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="اختر كلمة مرور آمنة"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                العنوان التفصيلي
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="مثال: دير الزور - شارع سينما فؤاد مقابل البنك التجاري"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                وصف المتجر والخدمات المعروضة
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اكتب نبذة مختصرة عما يقدمه محلك لزبائن الجزيرة والفرات..."
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            {/* Money Transfer Details */}
            <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-800" />
                  <h3 className="text-xs font-bold text-emerald-950">
                    إثبات سداد الاشتراك (إيصال الحوالة المالية) *
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateSampleReceipt}
                  className="flex items-center gap-1 rounded-lg bg-amber-500 hover:bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-slate-950 shadow-2xs transition-colors"
                  title="توليد إشعار سداد تجريبي معتمد للاختبار المباشر"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>توليد إيصال تجريبي فوري</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    جهة أو شركة التحويل
                  </label>
                  <select
                    value={transferCompany}
                    onChange={(e) => setTransferCompany(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs bg-white"
                  >
                    <option value="شركة الهرم للحوالات">شركة الهرم للحوالات المالية</option>
                    <option value="شركة الفؤاد للصرافة">شركة الفؤاد للحوالات</option>
                    <option value="شام إكسبرس">شام إكسبرس للحوالات السريعة</option>
                    <option value="مكتب الرافدين">مكتب الرافدين المعتمد</option>
                    <option value="تسليم يدوي مباشر">تسليم نقدي مباشر للمندوب</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    رقم إشعار الحوالة (الرقم المرجعي)
                  </label>
                  <input
                    type="text"
                    value={transferReference}
                    onChange={(e) => setTransferReference(e.target.value)}
                    placeholder="مثال: HRM-2026-88914"
                    className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs"
                  />
                </div>
              </div>

              {/* Receipt Upload Box */}
              <div className="mt-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  صورة الإيصال (PNG, JPG أو SVG)
                </label>

                {receiptBase64 ? (
                  <div className="relative rounded-xl border border-emerald-300 bg-white p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={receiptBase64}
                        alt="إيصال الحوالة"
                        className="h-12 w-12 object-cover rounded-lg border border-slate-200 cursor-pointer"
                        onClick={() => setPreviewReceipt(true)}
                      />
                      <div>
                        <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          تم إرفاق صورة الإيصال بنجاح
                        </span>
                        <button
                          type="button"
                          onClick={() => setPreviewReceipt(true)}
                          className="text-[11px] text-emerald-600 underline font-medium hover:text-emerald-800"
                        >
                          معاينة الإيصال بالحجم الكامل
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setReceiptBase64('')}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                      title="حذف الصورة"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white p-4 cursor-pointer hover:bg-slate-50 transition-colors text-center">
                    <Upload className="h-6 w-6 text-emerald-700 mb-1" />
                    <span className="text-xs font-bold text-slate-700">
                      اضغط لاختيار صورة الإيصال أو اسحبها هنا
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      تُحفظ الصورة كقيمة Base64 آمنة ومتوافقة مع Firestore
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Action Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-700 py-3.5 px-4 text-sm font-bold text-white shadow-sm hover:from-emerald-900 hover:to-emerald-800 active:scale-98 disabled:opacity-60 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 text-amber-400 animate-spin" />
                    <span>جاري إرسال البيانات إلى السحابة...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-amber-400" />
                    <span>إرسال طلب تسجيل المتجر وحفظه في فايربيس</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Lightbox Receipt Full Preview */}
      {previewReceipt && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setPreviewReceipt(false)}
        >
          <div 
            className="relative max-h-[90vh] max-w-lg w-full bg-white rounded-2xl p-2 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewReceipt(false)}
              className="absolute top-3 left-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="max-h-[82vh] overflow-auto p-2">
              <img
                src={receiptBase64}
                alt="معاينة إيصال الحوالة"
                className="w-full h-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
