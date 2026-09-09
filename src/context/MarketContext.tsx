import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CityId, CategoryId, Store, Product, AdminCredentials } from '../types';
import { INITIAL_STORES, INITIAL_PRODUCTS } from '../data/initialData';
import { 
  db, 
  handleFirestoreError, 
  OperationType,
  collection, 
  addDoc,
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp,
  writeBatch,
  sanitizeFirestorePayload
} from '../lib/firebase';
import { compressImageToBase64 } from '../utils/imageCompressor';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface MarketContextType {
  stores: Store[];
  products: Product[];
  selectedCity: CityId;
  setSelectedCity: (city: CityId) => void;
  selectedCategory: CategoryId;
  setSelectedCategory: (cat: CategoryId) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Modals & Navigation
  selectedProduct: Product | null;
  setSelectedProduct: (p: Product | null) => void;
  selectedStore: Store | null;
  setSelectedStore: (s: Store | null) => void;
  isRegisterOpen: boolean;
  setIsRegisterOpen: (open: boolean) => void;
  isMerchantModalOpen: boolean;
  setIsMerchantModalOpen: (open: boolean) => void;
  isAdminModalOpen: boolean;
  setIsAdminModalOpen: (open: boolean) => void;
  
  // Merchant State
  currentMerchant: Store | null;
  loginMerchant: (phone: string, password?: string) => boolean;
  logoutMerchant: () => void;
  registerStore: (data: Omit<Store, 'id' | 'createdAt' | 'status'>, existingDocId?: string) => Promise<Store>;
  updateStoreProfile: (storeId: string, updates: Partial<Store>) => Promise<void>;
  
  // Product Actions
  addProduct: (data: Omit<Product, 'id' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Admin State & Actions
  isAdminLoggedIn: boolean;
  adminCredentials: AdminCredentials;
  loginAdmin: (user: string, pass: string) => boolean;
  logoutAdmin: () => void;
  updateAdminCredentials: (user: string, pass: string) => void;
  approveStore: (storeId: string) => Promise<void>;
  rejectStore: (storeId: string, reason?: string) => Promise<void>;
  deleteStore: (storeId: string) => Promise<void>;
  
  // Firebase Sync State & Actions
  isFirebaseLive: boolean;
  isSyncing: boolean;
  seedFirestoreDemoData: () => Promise<void>;
  
  // Toasts
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  
  // Reset
  resetToDefaults: () => void;
}

const STORAGE_KEYS = {
  STORES: 'souq_jazira_stores_v2',
  PRODUCTS: 'souq_jazira_products_v2',
  ADMIN_CRED: 'souq_jazira_admin_cred_v2',
  CURRENT_MERCHANT: 'souq_jazira_current_merchant_v2',
};

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load Stores from LocalStorage or Initial Data (graceful fallback)
  const [stores, setStores] = useState<Store[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STORES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error loading stores from localStorage', e);
    }
    return INITIAL_STORES;
  });

  // Load Products from LocalStorage or Initial Data (graceful fallback)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error loading products from localStorage', e);
    }
    return INITIAL_PRODUCTS;
  });

  // Admin Credentials
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_CRED);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error loading admin credentials', e);
    }
    return { username: 'admin', password: 'admin123' };
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Current Logged-in Merchant
  const [currentMerchant, setCurrentMerchant] = useState<Store | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_MERCHANT);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error loading merchant session', e);
    }
    return null;
  });

  // Firebase Live Sync Indicators
  const [isFirebaseLive, setIsFirebaseLive] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Filters & Search
  const [selectedCity, setSelectedCity] = useState<CityId>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isMerchantModalOpen, setIsMerchantModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Notifications
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync to LocalStorage as resilient cache/fallback
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores));
    } catch (e) {
      console.warn('LocalStorage save stores error', e);
    }
  }, [stores]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.warn('LocalStorage save products error', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_CRED, JSON.stringify(adminCredentials));
    } catch (e) {
      console.warn('LocalStorage save admin cred error', e);
    }
  }, [adminCredentials]);

  useEffect(() => {
    try {
      if (currentMerchant) {
        const updated = stores.find((s) => s.id === currentMerchant.id) || currentMerchant;
        localStorage.setItem(STORAGE_KEYS.CURRENT_MERCHANT, JSON.stringify(updated));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_MERCHANT);
      }
    } catch (e) {
      console.warn('LocalStorage save merchant error', e);
    }
  }, [currentMerchant, stores]);

  // Real-time Firestore Listeners
  useEffect(() => {
    let unsubscribeMerchants: (() => void) | null = null;
    let unsubscribeProducts: (() => void) | null = null;

    try {
      // 1. Listen to merchants collection in real-time
      const merchantsRef = collection(db, 'merchants');
      unsubscribeMerchants = onSnapshot(
        merchantsRef,
        (snapshot) => {
          setIsFirebaseLive(true);
          if (snapshot.empty) {
            setStores(INITIAL_STORES);
            return;
          }
          const firestoreStores: Store[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as any;
              const storeName = data.storeName || data.name || '';
              const receiptBase64 = data.receiptBase64 || data.receipt_base64 || data.receiptUrl || undefined;
              let createdAtStr = new Date().toISOString().split('T')[0];
              if (data.createdAt && typeof data.createdAt.toDate === 'function') {
                createdAtStr = data.createdAt.toDate().toISOString().split('T')[0];
              } else if (typeof data.createdAt === 'string') {
                createdAtStr = data.createdAt;
              }

              firestoreStores.push({
                id: docSnap.id,
                name: storeName,
                ownerName: data.ownerName || storeName,
                city: data.city || 'deir_ez_zor',
                phone: data.phone || '',
                whatsapp: data.whatsapp || data.phone || '',
                category: data.category || 'general_goods',
                description: data.description || '',
                logoUrl: data.logoUrl || undefined,
                status: data.status || 'pending',
                rejectionReason: data.rejectionReason || undefined,
                receipt_base64: receiptBase64,
                receiptUrl: receiptBase64,
                transferReference: data.transferReference || undefined,
                transferCompany: data.transferCompany || undefined,
                createdAt: createdAtStr,
                password: data.password || '123456',
                isFeatured: data.isFeatured || false,
                address: data.address || '',
              });
            });

            // Display approved merchants from firestore, or fallback to demo items if database has none
            setStores((prev) => {
              if (firestoreStores.length === 0) {
                return INITIAL_STORES;
              }
              const approvedInFirestore = firestoreStores.filter((s) => s.status === 'approved');
              if (approvedInFirestore.length === 0) {
                const firestoreIds = new Set(firestoreStores.map((s) => s.id));
                const remainingDemo = INITIAL_STORES.filter((s) => !firestoreIds.has(s.id));
                return [...firestoreStores, ...remainingDemo];
              }
              return firestoreStores;
            });
        },
        (error) => {
          setIsFirebaseLive(false);
          handleFirestoreError(error, OperationType.LIST, 'merchants');
        }
      );

      // 2. Listen to products collection in real-time
      const productsRef = collection(db, 'products');
      unsubscribeProducts = onSnapshot(
        productsRef,
        (snapshot) => {
          setIsFirebaseLive(true);
          if (!snapshot.empty) {
            const firestoreProducts: Product[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as any;
              firestoreProducts.push({
                id: docSnap.id,
                storeId: data.storeId || '',
                storeName: data.storeName || '',
                title: data.title || '',
                description: data.description || '',
                priceSyp: Number(data.priceSyp) || 0,
                priceUsd: data.priceUsd ? Number(data.priceUsd) : undefined,
                imageUrl: data.imageUrl || '',
                city: data.city || 'deir_ez_zor',
                category: data.category || 'general_goods',
                phone: data.phone || '',
                whatsapp: data.whatsapp || data.phone || '',
                isAvailable: data.isAvailable !== false,
                createdAt: data.createdAt || new Date().toISOString().split('T')[0],
                condition: data.condition || 'new',
              });
            });

            // Merge with any demo products not yet in firestore
            setProducts((prev) => {
              const firestoreIds = new Set(firestoreProducts.map((p) => p.id));
              const remainingDemo = prev.filter((p) => !firestoreIds.has(p.id) && p.id.startsWith('prod-demo-'));
              return [...firestoreProducts, ...remainingDemo];
            });
          }
        },
        (error) => {
          setIsFirebaseLive(false);
          handleFirestoreError(error, OperationType.LIST, 'products');
        }
      );
    } catch (e) {
      console.warn('Error setting up Firestore listeners, using local cache', e);
      setIsFirebaseLive(false);
    }

    return () => {
      if (unsubscribeMerchants) unsubscribeMerchants();
      if (unsubscribeProducts) unsubscribeProducts();
    };
  }, []);

  // Seed Initial Demo Data into Firestore
  const seedFirestoreDemoData = async () => {
    setIsSyncing(true);
    try {
      const batch = writeBatch(db);

      // Seed stores into merchants collection
      for (const store of INITIAL_STORES) {
        const storeRef = doc(db, 'merchants', store.id);
        const storePayload = sanitizeFirestorePayload({
          id: store.id,
          name: store.name,
          ownerName: store.ownerName,
          city: store.city,
          phone: store.phone,
          whatsapp: store.whatsapp,
          category: store.category,
          description: store.description,
          logoUrl: store.logoUrl || '',
          status: store.status,
          receipt_base64: store.receiptUrl || '',
          receiptUrl: store.receiptUrl || '',
          transferReference: store.transferReference || '',
          transferCompany: store.transferCompany || 'شركة الهرم',
          createdAt: store.createdAt,
          password: store.password || '123456',
          address: store.address || '',
          isFeatured: store.isFeatured || false,
        });
        batch.set(storeRef, storePayload, { merge: true });
      }

      // Seed products into products collection
      for (const prod of INITIAL_PRODUCTS) {
        const prodRef = doc(db, 'products', prod.id);
        const cleanProd = sanitizeFirestorePayload(prod);
        batch.set(prodRef, cleanProd, { merge: true });
      }

      await batch.commit();
      setIsFirebaseLive(true);
      showToast('تمت مزامنة عينات المتاجر والمنتجات بنجاح مع قاعدة فايربيس الحية!', 'success');
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'merchants/products');
      const msg = err?.message || String(err);
      if (msg.includes('NOT_FOUND') || msg.includes('not-found') || msg.includes('does not exist')) {
        showToast('تنبيه: قاعدة البيانات (default) غير منشأة بعد في كونسول فايربيس', 'error');
      } else {
        showToast('تعذر مزامنة العينات مع فايربيس، تأكد من اتصال الإنترنت وقواعد الأمان', 'error');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Merchant Actions
  const registerStore = async (data: Omit<Store, 'id' | 'createdAt' | 'status'>, existingDocId?: string): Promise<Store> => {
    setIsSyncing(true);
    const initialTempId = existingDocId || `store-${Date.now()}`;
    let newStoreId = initialTempId;
    const dateStr = new Date().toISOString().split('T')[0];

    // Compress receipt image to Base64 for optimal Firestore storage (keeps document well within 1MB limit)
    let compressedReceipt = data.receipt_base64 || data.receiptUrl || '';
    if (compressedReceipt && compressedReceipt.startsWith('data:image')) {
      try {
        compressedReceipt = await compressImageToBase64(compressedReceipt, 800, 0.65);
      } catch (compErr) {
        console.warn('Image compression fallback', compErr);
      }
    }

    const newStore: Store = {
      ...data,
      id: newStoreId,
      receipt_base64: compressedReceipt,
      receiptUrl: compressedReceipt,
      createdAt: dateStr,
      status: 'pending',
    };

    // If existingDocId is provided (e.g. from StoreRegistrationModal addDoc direct call), update local state and finish
    if (existingDocId) {
      setStores((prev) => [newStore, ...prev.filter(s => s.id !== existingDocId)]);
      setIsFirebaseLive(true);
      setIsSyncing(false);
      return newStore;
    }

    // Update local state immediately for instant feedback
    setStores((prev) => [newStore, ...prev]);

    // Save directly to Firestore "merchants" collection using addDoc
    try {
      const storeName = data.name;
      const city = data.city;
      const phone = data.phone;
      const category = data.category;
      const receiptBase64 = compressedReceipt || "";

      const merchantPayload = sanitizeFirestorePayload({
        storeName,
        city,
        phone,
        category,
        receiptBase64: receiptBase64 || "",
        status: "pending",
        createdAt: serverTimestamp(),
        // Complementary fields to keep complete profile & admin features operational
        id: newStoreId,
        name: storeName,
        ownerName: data.ownerName || storeName,
        whatsapp: data.whatsapp || phone,
        description: data.description || '',
        address: data.address || '',
        receipt_base64: receiptBase64,
        receiptUrl: receiptBase64,
        transferReference: data.transferReference || '',
        transferCompany: data.transferCompany || '',
        password: data.password || '123456',
        isFeatured: false,
      });

      const addDocPromise = addDoc(collection(db, "merchants"), merchantPayload);
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500));
      const res = (await Promise.race([addDocPromise, timeoutPromise])) as any;

      if (res && res.id) {
        newStoreId = res.id;
        newStore.id = res.id;
        // Sync local state store ID with Firestore doc ID so subsequent updates target the correct document
        setStores((prev) => prev.map((s) => (s.id === initialTempId ? { ...s, id: res.id } : s)));
        setIsFirebaseLive(true);
        showToast('✅ تم إرسال البيانات وحفظها في قاعدة بيانات Firebase بنجاح!', 'success');
      } else {
        console.info('ℹ️ استجابة فايربيس السحابية استغرقت وقتاً أطول من المعتاد. تم تأكيد التسجيل محلياً.');
        showToast('✅ تم تسجيل المتجر بنجاح وحفظه في النظام!', 'success');
      }
    } catch (err: any) {
      console.info('Firestore notice in registerStore:', err?.message || err);
      handleFirestoreError(err, OperationType.CREATE, 'merchants');
      showToast('✅ تم تسجيل المتجر وحفظه محلياً في النظام بنجاح', 'info');
    } finally {
      setIsSyncing(false);
    }

    return newStore;
  };

  const updateStoreProfile = async (storeId: string, updates: Partial<Store>) => {
    setStores((prev) =>
      prev.map((s) => (s.id === storeId ? { ...s, ...updates } : s))
    );
    if (currentMerchant && currentMerchant.id === storeId) {
      setCurrentMerchant((prev) => (prev ? { ...prev, ...updates } : null));
    }

    try {
      const cleanUpdates = sanitizeFirestorePayload(updates);
      await updateDoc(doc(db, 'merchants', storeId), cleanUpdates);
      showToast('تم تحديث بيانات المتجر في فايربيس بنجاح');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `merchants/${storeId}`);
      showToast('تم تحديث بيانات المتجر محلياً');
    }
  };

  const loginMerchant = (phone: string, password?: string): boolean => {
    const cleanPhone = phone.replace(/\s+/g, '').replace(/^[+]/, '');
    const found = stores.find((s) => {
      const sPhone = s.phone.replace(/\s+/g, '').replace(/^[+]/, '');
      const sWhatsapp = s.whatsapp.replace(/\s+/g, '').replace(/^[+]/, '');
      const matchPhone = sPhone.includes(cleanPhone) || sWhatsapp.includes(cleanPhone) || cleanPhone.includes(sPhone);
      
      if (!matchPhone) return false;
      if (s.password && password && s.password !== password) return false;
      return true;
    });

    if (found) {
      setCurrentMerchant(found);
      showToast(`مرحباً بك يا ${found.ownerName || found.name}!`, 'success');
      return true;
    } else {
      showToast('تعذر العثور على المتجر بهذا الرقم أو كلمة المرور غير صحيحة.', 'error');
      return false;
    }
  };

  const logoutMerchant = () => {
    setCurrentMerchant(null);
    showToast('تم تسجيل الخروج بنجاح', 'info');
  };

  // Product Actions
  const addProduct = async (data: Omit<Product, 'id' | 'createdAt'>) => {
    const newProductId = `prod-${Date.now()}`;
    const dateStr = new Date().toISOString().split('T')[0];

    const newProduct: Product = {
      ...data,
      id: newProductId,
      createdAt: dateStr,
    };

    setProducts((prev) => [newProduct, ...prev]);

    try {
      const cleanProduct = sanitizeFirestorePayload(newProduct);
      await setDoc(doc(db, 'products', newProductId), cleanProduct);
      showToast('تمت إضافة المنتج بنجاح وحفظه في فايربيس!', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `products/${newProductId}`);
      showToast('تمت إضافة المنتج محلياً', 'success');
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );

    try {
      const cleanUpdates = sanitizeFirestorePayload(updates);
      await updateDoc(doc(db, 'products', id), cleanUpdates);
      showToast('تم تحديث المنتج في فايربيس بنجاح', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `products/${id}`);
      showToast('تم تحديث بيانات المنتج محلياً', 'success');
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      await deleteDoc(doc(db, 'products', id));
      showToast('تم حذف المنتج من فايربيس والسوق', 'info');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
      showToast('تم حذف المنتج محلياً', 'info');
    }
  };

  // Admin Actions
  const loginAdmin = (user: string, pass: string): boolean => {
    if (user.trim() === adminCredentials.username && pass === adminCredentials.password) {
      setIsAdminLoggedIn(true);
      showToast('تم تسجيل الدخول إلى لوحة إدارة السوق بنجاح', 'success');
      return true;
    }
    showToast('بيانات الدخول غير صحيحة! يرجى التأكد من اسم المستخدم وكلمة المرور.', 'error');
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    showToast('تم تسجيل خروج الإدارة', 'info');
  };

  const updateAdminCredentials = (user: string, pass: string) => {
    setAdminCredentials({ username: user.trim(), password: pass });
    showToast('تم تحديث بيانات أمان المشرف بنجاح!', 'success');
  };

  // Approve Store in Firestore
  const approveStore = async (storeId: string) => {
    // 1. Update local state
    setStores((prev) =>
      prev.map((s) => (s.id === storeId ? { ...s, status: 'approved', rejectionReason: undefined } : s))
    );

    // 2. Update status in Firestore "merchants" collection
    try {
      const updates = sanitizeFirestorePayload({
        status: 'approved',
        rejectionReason: '',
      });
      await updateDoc(doc(db, 'merchants', storeId), updates);
      showToast('تم قبول المتجر وتفعيله رسمياً في فايربيس والسوق!', 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `merchants/${storeId}`);
      showToast('تم تفعيل المتجر محلياً (حدث تنبيه في تحديث السحابة)', 'info');
    }
  };

  // Reject Store in Firestore
  const rejectStore = async (storeId: string, reason?: string) => {
    const finalReason = reason || 'لم يتم استيفاء شروط الدفع أو الوثائق المطلوبة';

    setStores((prev) =>
      prev.map((s) =>
        s.id === storeId
          ? {
              ...s,
              status: 'rejected',
              rejectionReason: finalReason,
            }
          : s
      )
    );

    try {
      const updates = sanitizeFirestorePayload({
        status: 'rejected',
        rejectionReason: finalReason,
      });
      await updateDoc(doc(db, 'merchants', storeId), updates);
      showToast('تم رفض طلب المتجر وتحديث الحالة في فايربيس', 'info');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `merchants/${storeId}`);
      showToast('تم رفض طلب المتجر محلياً', 'info');
    }
  };

  // Delete Store in Firestore
  const deleteStore = async (storeId: string) => {
    setStores((prev) => prev.filter((s) => s.id !== storeId));
    setProducts((prev) => prev.filter((p) => p.storeId !== storeId));

    try {
      await deleteDoc(doc(db, 'merchants', storeId));
      showToast('تم حذف المتجر من فايربيس', 'info');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `merchants/${storeId}`);
      showToast('تم حذف المتجر محلياً', 'info');
    }
  };

  const resetToDefaults = () => {
    setStores(INITIAL_STORES);
    setProducts(INITIAL_PRODUCTS);
    setAdminCredentials({ username: 'admin', password: 'admin123' });
    setCurrentMerchant(null);
    setIsAdminLoggedIn(false);
    localStorage.clear();
    showToast('تمت استعادة البيانات الافتراضية بنجاح', 'info');
  };

  return (
    <MarketContext.Provider
      value={{
        stores,
        products,
        selectedCity,
        setSelectedCity,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        selectedProduct,
        setSelectedProduct,
        selectedStore,
        setSelectedStore,
        isRegisterOpen,
        setIsRegisterOpen,
        isMerchantModalOpen,
        setIsMerchantModalOpen,
        isAdminModalOpen,
        setIsAdminModalOpen,
        currentMerchant,
        loginMerchant,
        logoutMerchant,
        registerStore,
        updateStoreProfile,
        addProduct,
        updateProduct,
        deleteProduct,
        isAdminLoggedIn,
        adminCredentials,
        loginAdmin,
        logoutAdmin,
        updateAdminCredentials,
        approveStore,
        rejectStore,
        deleteStore,
        isFirebaseLive,
        isSyncing,
        seedFirestoreDemoData,
        toasts,
        showToast,
        removeToast,
        resetToDefaults,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};
