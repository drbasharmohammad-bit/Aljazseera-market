import React, { useMemo } from 'react';
import { MarketProvider, useMarket } from './context/MarketContext';
import { Header } from './components/Header';
import { CityFilterTabs } from './components/CityFilterTabs';
import { CategoryNav } from './components/CategoryNav';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { StoreDetailModal } from './components/StoreDetailModal';
import { StoreRegistrationModal } from './components/StoreRegistrationModal';
import { MerchantDashboardModal } from './components/MerchantDashboardModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { ToastContainer } from './components/ToastContainer';
import { Footer } from './components/Footer';
import { CITIES, CATEGORIES } from './data/initialData';
import { 
  Sparkles, 
  MapPin, 
  SlidersHorizontal, 
  RotateCcw, 
  Store as StoreIcon, 
  Layers,
  Search,
  CheckCircle2,
  Tag,
  ShieldCheck,
  Phone,
  MessageCircle,
  ChevronLeft
} from 'lucide-react';

const MarketplaceContent: React.FC = () => {
  const {
    products,
    selectedCity,
    setSelectedCity,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    setIsRegisterOpen,
    stores,
    setSelectedStore,
  } = useMarket();

  const currentCityObj = CITIES.find((c) => c.id === selectedCity) || CITIES[0];
  const currentCategoryObj = CATEGORIES.find((cat) => cat.id === selectedCategory);

  // Approved merchants (from live Firestore or fallback demo items)
  const approvedStores = useMemo(() => {
    const list = stores.filter((s) => s.status === 'approved');
    if (selectedCity !== 'all') {
      const cityFiltered = list.filter((s) => s.city === selectedCity);
      return cityFiltered.length > 0 ? cityFiltered : list;
    }
    return list;
  }, [stores, selectedCity]);

  // Filter products based on selected city, category, and search query
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // City filter
      if (selectedCity !== 'all' && product.city !== selectedCity) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      // Search query filter (Arabic keyword matching across title, description, storeName)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const inTitle = product.title.toLowerCase().includes(query);
        const inDesc = product.description.toLowerCase().includes(query);
        const inStore = product.storeName.toLowerCase().includes(query);
        const inCity = (CITIES.find((c) => c.id === product.city)?.nameAr || '').includes(query);
        if (!inTitle && !inDesc && !inStore && !inCity) {
          return false;
        }
      }
      return true;
    });
  }, [products, selectedCity, selectedCategory, searchQuery]);

  const activeFiltersCount =
    (selectedCity !== 'all' ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedCity('all');
    setSelectedCategory('all');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation & Brand */}
      <Header />

      {/* Quick City Filter Tabs */}
      <CityFilterTabs />

      {/* Commercial Categories Slider */}
      <CategoryNav />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-3.5 py-4">
        {/* City & Filter Status Banner */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-2xl bg-white p-3.5 shadow-2xs border border-slate-200/80">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  {selectedCity === 'all' ? 'كافة محافظات الجزيرة والفرات' : `محافظة ${currentCityObj.nameAr}`}
                </span>
                {selectedCategory !== 'all' && (
                  <span className="rounded-md bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-[11px] font-bold">
                    {currentCategoryObj?.nameAr}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {searchQuery ? `نتائج البحث عن "${searchQuery}"` : currentCityObj.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
            <span className="font-semibold text-slate-600">
              {filteredProducts.length} عرض متوفر
            </span>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-slate-600 font-bold transition-colors text-[11px]"
              >
                <RotateCcw className="h-3 w-3" />
                <span>إعادة ضبط الفلاتر</span>
              </button>
            )}
          </div>
        </div>

        {/* Featured Store Invitation Banner for Merchants */}
        {selectedCategory === 'all' && !searchQuery && (
          <div className="mb-5 rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 p-4 sm:p-5 text-white shadow-xs border border-emerald-700/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300">
                    أصحاب المحال والمطاعم والمزارع في الحسكة ودير الزور والرقة
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black">
                  هل لديك متجر أو فعالية تجارية؟ اعرض منتجاتك لآلاف المشترين فوراً
                </h3>
                <p className="text-xs text-emerald-200/90 leading-relaxed max-w-2xl">
                  وثّق متجرك برقم هاتف وواتساب مباشر، وتواصل مع زبائنك دون أي عمولة أو اقتطاع مالي.
                </p>
              </div>

              <button
                onClick={() => setIsRegisterOpen(true)}
                className="shrink-0 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2.5 text-xs font-black shadow-xs transition-all active:scale-95"
              >
                سجل متجرك الآن
              </button>
            </div>
          </div>
        )}

        {/* Approved Merchants Showcase (Market View) */}
        {!searchQuery && approvedStores.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    المتاجر والفعاليات المعتمدة
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    محلات ومزارع موثقة رسمياً في قاعدة بيانات السوق
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                {approvedStores.length} متجر معتمد
              </span>
            </div>

            {/* Horizontal Scroll / Grid of Approved Stores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {approvedStores.slice(0, 6).map((store) => {
                const city = CITIES.find((c) => c.id === store.city);
                const category = CATEGORIES.find((c) => c.id === store.category);
                const storeProds = products.filter((p) => p.storeId === store.id);

                return (
                  <div
                    key={store.id}
                    onClick={() => setSelectedStore(store)}
                    className="group relative flex flex-col justify-between rounded-2xl bg-white p-3.5 border border-slate-200 hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <StoreIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                                {store.name}
                              </h3>
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" title="معتمد وموثق" />
                            </div>
                            <span className="text-[11px] text-slate-500">
                              {store.ownerName || 'مالك معتمد'}
                            </span>
                          </div>
                        </div>

                        <span className="rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-bold shrink-0">
                          {city?.nameAr}
                        </span>
                      </div>

                      {store.description && (
                        <p className="text-[11px] text-slate-600 line-clamp-1">
                          {store.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">
                        {storeProds.length} معروضات
                      </span>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${store.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors"
                          title="اتصال هاتفي"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                        <a
                          href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors"
                          title="محادثة واتساب"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                        </a>
                        <button
                          type="button"
                          className="flex items-center gap-0.5 text-emerald-800 font-bold px-1.5 py-1 rounded hover:bg-emerald-50 transition-colors"
                        >
                          <span>عرض</span>
                          <ChevronLeft className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section Heading for Products */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            {selectedCategory === 'all' ? 'أحدث العروض والسلع في السوق' : `معروضات قسم: ${currentCategoryObj?.nameAr}`}
          </h2>
          <span className="text-xs text-slate-500">
            {filteredProducts.length} منتج
          </span>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center border border-slate-200 shadow-2xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              لم نعثر على منتجات مطابقة لبحثك
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              جرب تغيير كلمة البحث أو اختيار مدينة أو تصنيف آخر من الأقسام بالأعلى.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-4 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 shadow-xs"
            >
              عرض كافة المنتجات
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      {/* Modals & Dialogs */}
      <ProductDetailModal />
      <StoreDetailModal />
      <StoreRegistrationModal />
      <MerchantDashboardModal />
      <AdminDashboardModal />
      <ToastContainer />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <MarketProvider>
      <MarketplaceContent />
    </MarketProvider>
  );
}
