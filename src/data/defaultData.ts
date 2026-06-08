export interface LinkConfig {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  iconType: 'shopee' | 'whatsapp' | 'whatsapp-channel' | 'instagram';
}

export interface ProductItem {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  rating: number;
  sales: string;
  category: string;
  imageIcon: string; // Lucide icon name or type
  imageUrl?: string;
  link: string;
  discountPercentage: number;
  couponCode?: string;
}

export interface AppConfig {
  creatorName: string;
  subtitle: string;
  avatarText: string;
  footerText: string;
  links: LinkConfig[];
  primaryColor: string;
}

export const defaultConfig: AppConfig = {
  creatorName: "Achadinhos da Lu",
  subtitle: "Promoções, achadinhos e ofertas imperdíveis para você! 👜",
  avatarText: "S",
  footerText: "Shopee",
  primaryColor: "#EE4D2D",
  links: [
    {
      id: "shopee-store",
      title: "Loja na Shopee",
      subtitle: "Confira nossos produtos",
      url: "https://shopee.com.br",
      iconType: "shopee"
    },
    {
      id: "whatsapp-group",
      title: "Grupo de WhatsApp",
      subtitle: "Achadinhos da Lu",
      url: "https://chat.whatsapp.com/LuDealsGroup123",
      iconType: "whatsapp"
    },
    {
      id: "whatsapp-channel",
      title: "Canal de WhatsApp",
      subtitle: "Achadinhos da Lu",
      url: "https://whatsapp.com/channel/LuDealsChannel456",
      iconType: "whatsapp-channel"
    },
    {
      id: "instagram-profile",
      title: "Instagram",
      subtitle: "@achadinhosdaLi",
      url: "https://instagram.com/achadinhosdaLi",
      iconType: "instagram"
    }
  ]
};

export const defaultProducts: ProductItem[] = [];

export const mockComments = [
  { id: 1, user: "Mariana S.", text: "Comprei o ventilador e chegou super rápido! Muito bom msm", rating: 5, date: "Hoje" },
  { id: 2, user: "Rodrigo F.", text: "A garrafa térmica funciona direitinho, mostra a temperatura real.", rating: 5, date: "Ontem" },
  { id: 3, user: "Carla M.", text: "Amei o grupo! Todo dia pego promoção top aqui", rating: 5, date: "Há 2 dias" }
];
