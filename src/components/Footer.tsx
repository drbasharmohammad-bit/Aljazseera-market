import React from 'react';
import { Lock, ShieldCheck, Heart, MapPin, Store, Phone, CheckCircle } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { CITIES } from '../data/initialData';

export const Footer: React.FC = () => {
  const { 
    setIsAdminModalOpen, 
    setIsRegisterOpen, 
    setIsMerchantModalOpen, 
    isAdminLoggedIn,
    setSelectedCity 
  } = useMarket();

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white pt-10 pb-8 text-slate-600">
      <div className="mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-100">
          {/* Brand & Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800 text-white font-black text-lg">
                🌾
              </div>
              <h3 className="font-black text-base text-slate-900">سوق الجزيرة والفرات</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              السوق الرقمي الموحد والمجاني للتصفح المباشر في محافظات شرق سوريا (الحسكة، دير الزور، الرقة). نربط المستهلكين بأصحاب المحال، المزارع، والفعاليات التجارية مباشرة بدون وسطاء.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
              <span>تواصل هاتفي وواتساب فوري مجاناً</span>
            </div>
          </div>

          {/* Supported Regions */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-3">
              المناطق والمحافظات المغطاة
            </h4>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => setSelectedCity('deir_ez_zor')}
                className="flex items-center gap-2 text-slate-600 hover:text-emerald-700 transition-colors w-full text-right"
              >
                <MapPin className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span>دير الزور (المدينة، الميادين، البوكمال وكافة الريف)</span>
              </button>
              <button
                onClick={() => setSelectedCity('al_hasakah')}
                className="flex items-center gap-2 text-slate-600 hover:text-emerald-700 transition-colors w-full text-right"
              >
                <MapPin className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span>الحسكة (القامشلي، رأس العين، عامودا، المالكية)</span>
              </button>
              <button
                onClick={() => setSelectedCity('raqqa')}
                className="flex items-center gap-2 text-slate-600 hover:text-emerald-700 transition-colors w-full text-right"
              >
                <MapPin className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span>الرقة (مركز المدينة، الطبقة، تل أبيض ومزارع الفرات)</span>
              </button>
            </div>
          </div>

          {/* Quick Actions for Merchants */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-3">
              بوابة التجار وأصحاب الفعاليات
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="w-full flex items-center justify-between rounded-xl bg-emerald-50 hover:bg-emerald-100/80 p-2.5 text-xs text-emerald-900 font-bold border border-emerald-200 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Store className="h-3.5 w-3.5 text-emerald-700" />
                  <span>تسجيل متجر جديد (اشتراك موثق)</span>
                </span>
                <span className="text-[10px] text-emerald-700">تقديم الطلب ←</span>
              </button>

              <button
                onClick={() => setIsMerchantModalOpen(true)}
                className="w-full flex items-center justify-between rounded-xl bg-slate-50 hover:bg-slate-100 p-2.5 text-xs text-slate-700 font-semibold border border-slate-200 transition-colors"
              >
                <span>دخول التجار المسجلين وإدارة العروض</span>
                <span className="text-[10px] text-slate-400">لوحة التحكم</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright & discrete lock entry */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© 2026 سوق الجزيرة والفرات. جميع الحقوق محفوظة لشرق سوريا.</p>

          <div className="flex items-center gap-4">
            <span className="text-[11px] text-slate-400">
              تصفح سريع وآمن • حفظ محلي دائم (LocalStorage)
            </span>

            {/* Discrete Admin Entry: Subtle Lock Icon */}
            <button
              onClick={() => setIsAdminModalOpen(true)}
              title="لوحة الإدارة والإشراف الأمني (مخفية ومحمية)"
              className={`flex items-center gap-1 rounded-md p-1 transition-all ${
                isAdminLoggedIn
                  ? 'text-amber-600 bg-amber-50 px-2'
                  : 'text-slate-300 hover:text-slate-600'
              }`}
            >
              {isAdminLoggedIn ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold">المشرف متصل</span>
                </>
              ) : (
                <Lock className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
