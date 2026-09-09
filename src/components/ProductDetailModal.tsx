import React from 'react';
import { 
  X, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Store as StoreIcon, 
  Calendar, 
  CheckCircle, 
  Share2, 
  ExternalLink 
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { CITIES, CATEGORIES } from '../data/initialData';

export const ProductDetailModal: React.FC = () => {
  const { 
    selectedProduct, 
    setSelectedProduct, 
    setSelectedStore, 
    stores,
    showToast 
  } = useMarket();

  if (!selectedProduct) return null;

  const city = CITIES.find((c) => c.id === selectedProduct.city);
  const category = CATEGORIES.find((cat) => cat.id === selectedProduct.category);
  const store = stores.find((s) => s.id === selectedProduct.storeId);

  const formatSyp = (num: number) => {
    return new Intl.NumberFormat('ar-SY').format(num);
  };

  const handleCall = () => {
    window.location.href = `tel:${selectedProduct.phone}`;
  };

  const handleWhatsApp = () => {
    const cleanPhone = selectedProduct.whatsapp.replace(/\D/g, '');
    const message = encodeURIComponent(
      `السلام عليكم، أتواصل معك بخصوص معروضك على منصة سوق الجزيرة والفرات:\n*${selectedProduct.title}*\nالسعر: ${formatSyp(selectedProduct.priceSyp)} ل.س\nالمتجر: ${selectedProduct.storeName}`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleViewStore = () => {
    if (store) {
      setSelectedStore(store);
      setSelectedProduct(null);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: selectedProduct.title,
        text: `${selectedProduct.title} في سوق الجزيرة والفرات`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('تم نسخ رابط المنتج إلى الحافظة', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative flex flex-col max-h-[92vh] w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-3 left-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/70 text-white backdrop-blur-xs hover:bg-slate-900 transition-colors"
          aria-label="إغلاق"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto no-scrollbar pb-24">
          {/* Main Photo */}
          <div className="relative aspect-video sm:aspect-[16/10] w-full bg-slate-100 overflow-hidden">
            <img
              src={selectedProduct.imageUrl}
              alt={selectedProduct.title}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
            {/* City Tag */}
            <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-slate-900/80 backdrop-blur-xs px-3 py-1 text-xs font-bold text-white">
              <MapPin className="h-3.5 w-3.5 text-amber-400" />
              <span>{city?.nameAr || 'الجزيرة والفرات'}</span>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Badges & Meta */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 text-xs font-bold">
                  {category?.nameAr || 'قسم عام'}
                </span>
                {selectedProduct.condition && (
                  <span className="rounded-lg bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 text-xs font-semibold">
                    {selectedProduct.condition}
                  </span>
                )}
              </div>

              <button
                onClick={handleShare}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>مشاركة</span>
              </button>
            </div>

            {/* Title */}
            <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
              {selectedProduct.title}
            </h2>

            {/* Price Box */}
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-emerald-50/70 p-4 border border-emerald-200/80">
              <div>
                <span className="text-xs text-emerald-800 font-semibold block mb-0.5">السعر المعروض:</span>
                <div className="flex items-baseline gap-1.5 font-black text-2xl text-emerald-900">
                  <span>{formatSyp(selectedProduct.priceSyp)}</span>
                  <span className="text-sm font-bold text-emerald-700">ليرة سورية</span>
                </div>
              </div>
              {selectedProduct.priceUsd && (
                <div className="text-left rounded-xl bg-white px-3 py-1.5 shadow-2xs border border-emerald-100">
                  <span className="text-[11px] text-slate-500 font-medium block">يعادل بالدولار:</span>
                  <span className="text-base font-extrabold text-amber-600">
                    ${selectedProduct.priceUsd} USD
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                تفاصيل المنتج والمواصفات
              </h3>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/70 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedProduct.description}
              </div>
            </div>

            {/* Merchant / Store Box */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700 border border-amber-500/20">
                    <StoreIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold block">المتجر أو البائع:</span>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                      {selectedProduct.storeName}
                    </h4>
                    {store?.address && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="line-clamp-1">{store.address}</span>
                      </p>
                    )}
                  </div>
                </div>

                {store && (
                  <button
                    onClick={handleViewStore}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200 transition-colors"
                  >
                    <span>زيارة المتجر</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Direct Contact Notice */}
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50/70 p-3 text-xs text-amber-800 border border-amber-200/60">
              <CheckCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                تواصل مع المتجر مباشرة دون دفع أي عمولات أو رسوم إضافية عبر الوسائل أدناه:
              </span>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="absolute bottom-0 inset-x-0 border-t border-slate-200 bg-white/95 backdrop-blur-md p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Call button */}
            <button
              onClick={handleCall}
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 active:scale-98 transition-all"
            >
              <Phone className="h-4 w-4 text-emerald-200" />
              <span>اتصال هاتفي</span>
            </button>

            {/* WhatsApp button */}
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 border-2 border-emerald-500 py-3 px-4 text-sm font-bold text-emerald-800 hover:bg-emerald-100/90 active:scale-98 transition-all"
            >
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              <span>مراسلة واتساب</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
