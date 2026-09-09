export type CityId = 'all' | 'al_hasakah' | 'deir_ez_zor' | 'raqqa';

export interface CityInfo {
  id: CityId;
  nameAr: string;
  nameEn: string;
  tagline: string;
}

export type CategoryId =
  | 'all'
  | 'restaurants'
  | 'malls'
  | 'cosmetics'
  | 'toys'
  | 'electronics'
  | 'supermarket'
  | 'agriculture'
  | 'maintenance'
  | 'doctors'
  | 'variety';

export interface CategoryInfo {
  id: CategoryId;
  nameAr: string;
  nameEn: string;
  iconName: string;
  badgeColor: string;
  accentBg: string;
}

export interface Store {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  whatsapp: string;
  city: CityId;
  category: CategoryId;
  description: string;
  logoUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  receiptUrl?: string; // Base64 or image URL
  receipt_base64?: string; // Base64 compressed receipt
  transferReference?: string;
  transferCompany?: string;
  createdAt: string;
  password?: string;
  isFeatured?: boolean;
  address?: string;
}

export interface Product {
  id: string;
  storeId: string;
  storeName: string;
  title: string;
  description: string;
  priceSyp: number;
  priceUsd?: number;
  imageUrl: string;
  city: CityId;
  category: CategoryId;
  phone: string;
  whatsapp: string;
  isAvailable: boolean;
  createdAt: string;
  isFeatured?: boolean;
  condition?: 'جديد' | 'مستعمل بحالة ممتازة' | 'طبيعي طازج' | 'حسب الطلب';
}

export interface AdminCredentials {
  username: string;
  password: string;
}
