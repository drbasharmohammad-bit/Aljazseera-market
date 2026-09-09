import React from 'react';
import { 
  X, 
  Store as StoreIcon, 
  MapPin, 
  Phone, 
  MessageCircle, 
  User, 
  ShoppingBag,
  Clock,
  ShieldCheck 
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { CITIES, CATEGORIES } from '../data/initialData';
import { ProductCard } from './ProductCard';

export const StoreDetailModal: React.FC = () => {
  const { selectedStore, setSelectedStore, products } = useMarket();

  if (!selectedStore) return null;

  const city = CITIES.find((c) => c.id === selectedStore.city);
  const category = CATEGORIES.find((c) => c.id === selectedStore.category);
  const storeProducts = products.filter((p) => p.storeId === selectedStore.id);

  const handleCall = () => {
    window.location.href = `tel:${selectedStore.phone}`;
  };

  const handleWhatsApp = () => {
    const cleanPhone = selectedStore.whatsapp.replace(/\D/g, '');
    const message = encodeURIComponent(
      `السلام عليكم ${selectedStore.ownerName || ''}، أتواصل معك عبر متجرك في سوق الجزيرة والفرات: ${selectedStore.name}`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative flex flex-col max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-slate-50 shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-2">
            <StoreIcon className="h-5 w-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-800">بيانات المتجر والفعالية</h2>
          </div>
          <button
            onClick={() => setSelectedStore(null)}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto no-scrollbar p-4 sm:p-6 space-y-5">
          {/* Store Hero Card */}
          <div className="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/90">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-700 text-white font-black text-2xl shadow-sm">
                  🏬
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-lg sm:text-xl font-black text-slate-900">
                      {selectedStore.name}
                    </h1>
                    {selectedStore.status === 'approved' && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[11px] font-bold border border-emerald-300">
                        <ShieldCheck className="h-3 w-3" />
                        <span>متجر موثق ونشط</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-600 font-medium">
                    <span className="flex items-center gap-1 text-slate-700">
                      <MapPin className="h-3.5 w-3.5 text-amber-600" />
                      <span>{city?.nameAr}</span>
                      {selectedStore.address && <span>- {selectedStore.address}</span>}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">
                      {category?.nameAr || 'عام'}
                    </span>
                    {selectedStore.ownerName && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <User className="h-3.5 w-3.5" />
                        <span>المالك: {selectedStore.ownerName}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons for Store */}
              <div className="flex items-center gap-2 pt-2 sm:pt-0">
                <button
                  onClick={handleCall}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 shadow-xs transition-all"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>اتصال</span>
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-300 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-all"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                  <span>واتساب</span>
                </button>
              </div>
            </div>

            {/* Description */}
            {selectedStore.description && (
              <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs sm:text-sm text-slate-600 leading-relaxed border border-slate-100">
                {selectedStore.description}
              </p>
            )}
          </div>

          {/* Store Products List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  المعروضات والمنتجات ({storeProducts.length})
                </h3>
              </div>
            </div>

            {storeProducts.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center border border-slate-200 text-slate-500 text-sm">
                لم يقم المتجر بإضافة منتجات بعد.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {storeProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
