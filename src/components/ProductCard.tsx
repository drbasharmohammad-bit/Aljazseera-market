import React from 'react';
import { Phone, MessageCircle, MapPin, Store as StoreIcon, Tag, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';
import { CITIES, CATEGORIES } from '../data/initialData';
import { useMarket } from '../context/MarketContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { setSelectedProduct, setSelectedStore, stores } = useMarket();

  const city = CITIES.find((c) => c.id === product.city);
  const category = CATEGORIES.find((cat) => cat.id === product.category);

  // Format Syrian Pound with commas
  const formatSyp = (num: number) => {
    return new Intl.NumberFormat('ar-SY').format(num);
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${product.phone}`;
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanPhone = product.whatsapp.replace(/\D/g, '');
    const message = encodeURIComponent(
      `السلام عليكم، استفسر بخصوص معروضكم في سوق الجزيرة والفرات:\n*${product.title}*\nالسعر: ${formatSyp(product.priceSyp)} ل.س`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleStoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const foundStore = stores.find((s) => s.id === product.storeId);
    if (foundStore) {
      setSelectedStore(foundStore);
    }
  };

  return (
    <div
      onClick={() => setSelectedProduct(product)}
      className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div>
        {/* Product Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          <img
            src={product.imageUrl}
            alt={product.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* City Badge */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs">
            <MapPin className="h-3 w-3 text-amber-400" />
            <span>{city?.nameAr || 'الجزيرة'}</span>
          </div>

          {/* Condition / Stock Badge */}
          {product.condition && (
            <div className="absolute bottom-2.5 right-2.5 rounded-md bg-emerald-950/80 backdrop-blur-xs px-2 py-0.5 text-[10px] font-medium text-emerald-200">
              {product.condition}
            </div>
          )}

          {/* Price Tag Overlay */}
          <div className="absolute bottom-2.5 left-2.5 flex flex-col items-end rounded-xl bg-white/95 backdrop-blur-xs px-2.5 py-1 shadow-sm border border-slate-100">
            <div className="flex items-baseline gap-1 text-emerald-800 font-black text-sm sm:text-base leading-none">
              <span>{formatSyp(product.priceSyp)}</span>
              <span className="text-[10px] font-bold text-emerald-600">ل.س</span>
            </div>
            {product.priceUsd && (
              <span className="text-[10px] font-semibold text-slate-500 leading-none mt-0.5">
                ≈ ${product.priceUsd} USD
              </span>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-3.5 pb-2">
          {/* Category Pill & Store Name */}
          <div className="flex items-center justify-between gap-1 mb-1.5 text-xs">
            <button
              type="button"
              onClick={handleStoreClick}
              className="flex items-center gap-1 text-slate-600 hover:text-emerald-700 font-semibold truncate transition-colors"
            >
              <StoreIcon className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span className="truncate">{product.storeName}</span>
            </button>
            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
              {category?.nameAr || 'قسم عام'}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 min-h-[2.6rem] group-hover:text-emerald-800 transition-colors">
            {product.title}
          </h3>

          {/* Short description preview */}
          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Action Buttons: Direct Call & WhatsApp */}
      <div className="p-3 pt-2 border-t border-slate-100/90 bg-slate-50/50">
        <div className="grid grid-cols-2 gap-2">
          {/* Call Button */}
          <button
            type="button"
            onClick={handleCall}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 py-2 px-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 active:scale-95 transition-all"
            title="اتصال هاتفي مباشر"
          >
            <Phone className="h-3.5 w-3.5 text-emerald-200" />
            <span>اتصال هاتفي</span>
          </button>

          {/* WhatsApp Button */}
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-300 py-2 px-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100/80 active:scale-95 transition-all"
            title="مراسلة عبر واتساب"
          >
            <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
            <span>واتساب</span>
          </button>
        </div>
      </div>
    </div>
  );
};
