import React from 'react';
import { MapPin } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { CITIES } from '../data/initialData';

export const CityFilterTabs: React.FC = () => {
  const { selectedCity, setSelectedCity, products, stores } = useMarket();

  const getCityCount = (cityId: string) => {
    if (cityId === 'all') {
      return products.length;
    }
    return products.filter((p) => p.city === cityId).length;
  };

  return (
    <div className="bg-white border-b border-slate-200/80 shadow-xs px-3 py-2.5">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold pl-2 shrink-0 border-l border-slate-200 ml-1">
            <MapPin className="h-3.5 w-3.5 text-emerald-700" />
            <span>المنطقة:</span>
          </div>

          {CITIES.map((city) => {
            const isSelected = selectedCity === city.id;
            const count = getCityCount(city.id);

            return (
              <button
                key={city.id}
                onClick={() => setSelectedCity(city.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-900/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                <span>{city.nameAr}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                    isSelected
                      ? 'bg-amber-400 text-emerald-950 font-bold'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
