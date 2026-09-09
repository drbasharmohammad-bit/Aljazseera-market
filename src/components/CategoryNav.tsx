import React from 'react';
import {
  Utensils,
  Building2,
  Sparkles,
  Baby,
  Smartphone,
  ShoppingBasket,
  Wheat,
  Wrench,
  Stethoscope,
  Package,
  LayoutGrid,
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { CATEGORIES } from '../data/initialData';
import { CategoryId } from '../types';

export const CategoryNav: React.FC = () => {
  const { selectedCategory, setSelectedCategory, products } = useMarket();

  const getCategoryIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'Utensils':
        return <Utensils className={className} />;
      case 'Building2':
        return <Building2 className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Baby':
        return <Baby className={className} />;
      case 'Smartphone':
        return <Smartphone className={className} />;
      case 'ShoppingBasket':
        return <ShoppingBasket className={className} />;
      case 'Wheat':
        return <Wheat className={className} />;
      case 'Wrench':
        return <Wrench className={className} />;
      case 'Stethoscope':
        return <Stethoscope className={className} />;
      case 'Package':
        return <Package className={className} />;
      default:
        return <LayoutGrid className={className} />;
    }
  };

  const allCount = products.length;

  return (
    <section className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 py-3 px-3">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold text-slate-700 tracking-wide">
            الأقسام والفعاليات التجارية
          </h2>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-xs text-emerald-700 font-semibold hover:underline"
            >
              عرض الكل
            </button>
          )}
        </div>

        {/* Scrollable Categories List */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5">
          {/* All Categories Button */}
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex flex-col items-center justify-center min-w-[76px] rounded-2xl p-2.5 transition-all text-center border ${
              selectedCategory === 'all'
                ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-xs ring-1 ring-emerald-600/30'
                : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl mb-1.5 ${
                selectedCategory === 'all'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 shadow-2xs'
              }`}
            >
              <LayoutGrid className="h-4.5 w-4.5" />
            </div>
            <span className="text-[11px] font-bold leading-tight">كافة الأقسام</span>
            <span className="text-[9px] text-slate-400 mt-0.5">{allCount} عرض</span>
          </button>

          {/* Individual Category Buttons */}
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const catCount = products.filter((p) => p.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as CategoryId)}
                className={`flex flex-col items-center justify-center min-w-[88px] max-w-[105px] rounded-2xl p-2.5 transition-all text-center border shrink-0 ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-xs ring-1 ring-emerald-600/30'
                    : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl mb-1.5 ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-slate-700 shadow-2xs'
                  }`}
                >
                  {getCategoryIcon(cat.iconName, 'h-4.5 w-4.5')}
                </div>
                <span className="text-[11px] font-bold leading-tight line-clamp-1">
                  {cat.nameAr}
                </span>
                <span className="text-[9px] text-slate-400 mt-0.5">{catCount} عرض</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
