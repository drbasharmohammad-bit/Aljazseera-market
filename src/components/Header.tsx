import React from 'react';
import { 
  Store as StoreIcon, 
  Lock, 
  Search, 
  Sparkles, 
  UserCheck, 
  PlusCircle, 
  ShieldCheck, 
  X, 
  SlidersHorizontal,
  MapPin
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { CITIES } from '../data/initialData';

export const Header: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedCity,
    setSelectedCity,
    setIsRegisterOpen,
    setIsMerchantModalOpen,
    setIsAdminModalOpen,
    currentMerchant,
    isAdminLoggedIn,
  } = useMarket();

  const currentCityObj = CITIES.find((c) => c.id === selectedCity) || CITIES[0];

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-b from-emerald-900 to-emerald-800 text-white shadow-md">
      {/* Top Notification / Guest bar */}
      <div className="border-b border-emerald-700/50 bg-emerald-950/40 px-3 py-1.5 text-xs">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-200">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <UserCheck className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-medium text-amber-300">وضع التصفح الفوري للزوار:</span>
            <span className="hidden sm:inline text-emerald-100/90">لا يتطلب تسجيل دخول أو رقم هاتف للشراء</span>
          </div>

          <div className="flex items-center gap-3">
            {currentMerchant ? (
              <button
                onClick={() => setIsMerchantModalOpen(true)}
                className="flex items-center gap-1 text-xs font-semibold text-amber-300 hover:text-amber-200"
              >
                <StoreIcon className="h-3 w-3" />
                <span>متجري: {currentMerchant.name}</span>
                {currentMerchant.status === 'pending' && (
                  <span className="rounded bg-amber-500/20 px-1 py-0.2 text-[10px] text-amber-300">
                    قيد المراجعة
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={() => setIsMerchantModalOpen(true)}
                className="text-xs text-emerald-200 hover:text-white transition-colors"
              >
                دخول التجار
              </button>
            )}

            {/* Subtle discreet lock icon for Admin access */}
            <button
              onClick={() => setIsAdminModalOpen(true)}
              title="لوحة الإدارة والإشراف"
              className={`flex items-center justify-center rounded p-1 transition-all ${
                isAdminLoggedIn
                  ? 'bg-amber-500 text-emerald-950'
                  : 'text-emerald-400/60 hover:text-amber-300 hover:bg-emerald-800/60'
              }`}
            >
              {isAdminLoggedIn ? (
                <ShieldCheck className="h-3.5 w-3.5" />
              ) : (
                <Lock className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Brand & Action Bar */}
      <div className="mx-auto max-w-5xl px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Logo & Region Identity */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-emerald-950 shadow-inner font-black text-xl">
              🌾
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-black tracking-tight text-white sm:text-xl">
                  سوق الجزيرة والفرات
                </h1>
                <span className="rounded-full bg-emerald-700/80 px-2 py-0.5 text-[10px] font-medium text-emerald-100 border border-emerald-600/60">
                  سوريا
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/90 font-medium">
                الحسكة • دير الزور • الرقة | تواصل مباشر دون وسيط
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRegisterOpen(true)}
              className="group flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-2 text-xs font-bold text-slate-950 shadow-sm shadow-amber-900/30 hover:brightness-105 active:scale-95 transition-all"
            >
              <PlusCircle className="h-4 w-4 text-slate-950" />
              <span className="hidden sm:inline">سجل متجرك الآن</span>
              <span className="sm:hidden">سجل متجرك</span>
            </button>
          </div>
        </div>

        {/* Instant Search Bar */}
        <div className="mt-3">
          <div className="relative flex items-center">
            <Search className="absolute right-3.5 h-4 w-4 text-emerald-600 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن أجهزة، خراف ومواشي، كباب فراتي، قطع غيار، مكياج..."
              className="w-full rounded-xl bg-white pr-10 pl-10 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 rounded-full p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
