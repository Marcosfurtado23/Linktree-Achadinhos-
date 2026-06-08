import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  Bell, 
  X, 
  Heart, 
  Check, 
  MessageCircle, 
  Instagram, 
  Sparkles, 
  Share2, 
  Copy,
  AlertCircle,
  ExternalLink,
  Lock
} from 'lucide-react';
import { 
  defaultConfig, 
  defaultProducts, 
  AppConfig, 
  ProductItem 
} from './data/defaultData';
import { DetailsModal } from './components/DetailsModal';
import { AdminPanel } from './components/AdminPanel';
import { AdminLogin } from './components/AdminLogin';
import { 
  firebaseUtils, 
  isUsingMockDb, 
  db, 
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  getDocs 
} from 'firebase/firestore';

export default function App() {
  // Path Router detecting both structural slash path "/ADM" or sandbox hash "#/ADM"
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const isAdmHash = window.location.hash.toUpperCase() === '#/ADM' || window.location.hash.toUpperCase() === '#ADM';
    const isAdmPath = window.location.pathname.toUpperCase() === '/ADM' || window.location.pathname.toUpperCase() === '/ADM/';
    return (isAdmHash || isAdmPath) ? '/ADM' : '/';
  });

  // Admin user sessions
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // Layout states synced dynamically with Firebase Firestore / localStorage fallback
  const [configs, setConfigs] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('achadinhos_config');
    return saved ? JSON.parse(saved) : defaultConfig;
  });

  const [products, setProducts] = useState<ProductItem[]>(() => {
    const saved = localStorage.getItem('achadinhos_products');
    return saved ? JSON.parse(saved) : defaultProducts;
  });

  const [clicks, setClicks] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('achadinhos_clicks');
    return saved ? JSON.parse(saved) : {
      'shopee-store': 124,
      'whatsapp-group': 98,
      'whatsapp-channel': 75,
      'instagram-profile': 112,
      'notifications': 42
    };
  });

  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [notificationActive, setNotificationActive] = useState<boolean>(() => {
    return localStorage.getItem('achadinhos_noti_active') === 'true';
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronizers and Listeners
  useEffect(() => {
    // 1. Observe Authentication status
    const unsubscribe = firebaseUtils.onAuthStatusChange((user) => {
      setCurrentUser(user);
    });

    // 2. Load latest Config & Products dynamically from Firebase Firestore when online
    const fetchCloudData = async () => {
      if (isUsingMockDb) return;
      try {
        // Fetch configs/default
        const configRef = doc(db, 'configs', 'default');
        const configSnap = await getDoc(configRef);
        if (configSnap.exists()) {
          setConfigs(configSnap.data() as AppConfig);
        } else {
          // Initialize/Seed Firestore config
          await setDoc(configRef, defaultConfig);
        }

        // Fetch products col
        const prodSnap = await getDocs(collection(db, 'products'));
        if (!prodSnap.empty) {
          const cloudProds: ProductItem[] = [];
          prodSnap.forEach((docRef) => {
            cloudProds.push(docRef.data() as ProductItem);
          });
          // Sort by timestamp or reverse order if added
          setProducts(cloudProds);
        } else {
          // Seed products
          for (const prod of defaultProducts) {
            await setDoc(doc(db, 'products', prod.id), prod);
          }
        }
      } catch (err) {
        console.warn("Could not synchronize with cloud yet: ", err);
      }
    };

    fetchCloudData();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Poll window location changes to switch paths fluidly
  useEffect(() => {
    const handleLocationChange = () => {
      const isAdmHash = window.location.hash.toUpperCase() === '#/ADM' || window.location.hash.toUpperCase() === '#ADM';
      const isAdmPath = window.location.pathname.toUpperCase() === '/ADM' || window.location.pathname.toUpperCase() === '/ADM/';
      setCurrentPath((isAdmHash || isAdmPath) ? '/ADM' : '/');
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    const interval = setInterval(handleLocationChange, 600);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
      clearInterval(interval);
    };
  }, []);

  // Local Storage Mirror saving as safety/fallback
  useEffect(() => {
    localStorage.setItem('achadinhos_config', JSON.stringify(configs));
  }, [configs]);

  useEffect(() => {
    localStorage.setItem('achadinhos_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('achadinhos_clicks', JSON.stringify(clicks));
  }, [clicks]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // State update dispatchers syncing with Firebase Firestore
  const handleUpdateConfig = async (newConfig: AppConfig) => {
    setConfigs(newConfig);
    if (!isUsingMockDb) {
      try {
        await setDoc(doc(db, 'configs', 'default'), newConfig);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, 'configs/default');
      }
    }
  };

  const handleUpdateProducts = async (newProducts: ProductItem[]) => {
    // Identify additions/deletions for precision writes
    const deleted = products.filter(p => !newProducts.some(np => np.id === p.id));
    const addedOrUpdated = newProducts.filter(np => !products.some(p => p.id === np.id && JSON.stringify(p) === JSON.stringify(np)));

    setProducts(newProducts);

    if (!isUsingMockDb) {
      try {
        for (const item of deleted) {
          await deleteDoc(doc(db, 'products', item.id));
        }
        for (const item of addedOrUpdated) {
          await setDoc(doc(db, 'products', item.id), item);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'products');
      }
    }
  };

  // Click tracking and redirection
  const handleLinkClick = (id: string, url: string, e: React.MouseEvent) => {
    e.preventDefault();
    
    setClicks(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));

    showToast(`Redirecionando em instantes... 🚀`);
    
    setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer');
    }, 800);
  };

  const handleProductItemClick = (productId: string) => {
    const found = products.find(p => p.id === productId);
    if (found) {
      setClicks(prev => ({
        ...prev,
        [`prod-${productId}`]: (prev[`prod-${productId}`] || 0) + 1
      }));
      setSelectedProduct(found);
    }
  };

  const handleProductRedirect = () => {
    if (selectedProduct) {
      window.open(selectedProduct.link, '_blank', 'noopener,noreferrer');
      setSelectedProduct(null);
    }
  };

  const handleNotificationToggle = () => {
    const nextState = !notificationActive;
    setNotificationActive(nextState);
    localStorage.setItem('achadinhos_noti_active', String(nextState));

    setClicks(prev => ({
      ...prev,
      'notifications': (prev['notifications'] || 0) + 1
    }));

    if (nextState) {
      showToast("🔔 Notificações Ativadas! Você receberá ofertas quentes.");
    } else {
      showToast("🔕 Notificações desativadas.");
    }
  };

  const handleResetClicks = () => {
    setClicks({
      'shopee-store': 0,
      'whatsapp-group': 0,
      'whatsapp-channel': 0,
      'instagram-profile': 0,
      'notifications': 0
    });
    showToast("Estatísticas limpas com sucesso.");
  };

  const handleResetEverything = async () => {
    if (window.confirm("Deseja realmente resetar todas as customizações para o padrão original?")) {
      setConfigs(defaultConfig);
      setProducts(defaultProducts);
      setClicks({
        'shopee-store': 124,
        'whatsapp-group': 98,
        'whatsapp-channel': 75,
        'instagram-profile': 112,
        'notifications': 42
      });
      setNotificationActive(false);

      if (!isUsingMockDb) {
        try {
          await setDoc(doc(db, 'configs', 'default'), defaultConfig);
          // Delete custom prods and write defaults
          const prodSnap = await getDocs(collection(db, 'products'));
          for (const docRef of prodSnap.docs) {
            await deleteDoc(doc(db, 'products', docRef.id));
          }
          for (const prod of defaultProducts) {
            await setDoc(doc(db, 'products', prod.id), prod);
          }
        } catch (err) {
          console.warn("Reset cloud failed: ", err);
        }
      }

      showToast("Tudo foi restaurado para o padrão original!");
    }
  };

  const sharePage = () => {
    const pageUrl = window.location.origin + window.location.pathname;
    navigator.clipboard.writeText(pageUrl);
    showToast("🔗 Link da página copiado para a área de transferência!");
  };

  const navigateToAdm = () => {
    window.location.hash = '#/ADM';
    setCurrentPath('/ADM');
  };

  const navigateToHome = () => {
    window.location.hash = '';
    // Optional clean pathname push
    try {
      window.history.pushState({}, '', window.location.pathname);
    } catch (e) {}
    setCurrentPath('/');
  };

  // ROUTE BRANCHING
  if (currentPath === '/ADM') {
    if (!currentUser) {
      // If unauthenticated, render the gorgeous Orange Login form ("todo laranja")
      return (
        <AdminLogin 
          onSuccess={(user) => setCurrentUser(user)}
          onBackToSite={navigateToHome}
        />
      );
    }

    // Authenticated Administration dashboard
    return (
      <AdminPanel 
        config={configs}
        onChangeConfig={handleUpdateConfig}
        products={products}
        onChangeProducts={handleUpdateProducts}
        clicks={clicks}
        onResetClicks={handleResetClicks}
        onResetEverything={handleResetEverything}
        onLogout={async () => {
          await firebaseUtils.logOutUser();
          setCurrentUser(null);
        }}
        onBackToSite={navigateToHome}
      />
    );
  }

  // STANDARD PUBLIC VISUAL CONTAINER - NO EDITING OR FLOATING BUTTONS
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#FFF6F0] via-[#FFFBF9] to-[#FFEFE5] text-[#2c3e50] overflow-x-hidden selection:bg-orange-500 selection:text-white pb-32">
      
      {/* Decorative stars and background circles matching Shopee mood */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-orange-200/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] left-[10%] w-[350px] h-[350px] bg-gradient-to-br from-amber-100/30 to-transparent rounded-full blur-2xl" />

        {/* Floating Shopping Bag Left */}
        <motion.div 
          className="absolute top-[8%] left-[4%] w-24 h-24 md:w-32 md:h-32 text-orange-500/90 drop-shadow-md hidden sm:block"
          animate={{ y: [0, -10, 0], rotate: [0, 4, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 100 100" fill="currentColor">
            <path d="M50,15 C42,15 36,21 36,29 L36,32 L64,32 L64,29 C64,21 58,15 50,15 Z" fill="none" stroke="#E34E31" strokeWidth="4" />
            <rect x="22" y="32" width="56" height="48" rx="8" fill="#EE4D2D" />
            <text x="50" y="65" fill="white" fontSize="26" fontWeight="extrabold" textAnchor="middle" fontFamily="Outfit">S</text>
          </svg>
        </motion.div>

        {/* Floating Tag */}
        <motion.div 
          className="absolute bottom-[12%] left-[3%] w-20 h-20 text-orange-400 opacity-90 hidden md:block"
          animate={{ y: [0, 8, 0], rotate: [0, -6, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <svg viewBox="0 0 100 100" fill="currentColor" className="drop-shadow-md">
            <path d="M20,20 L60,20 L90,50 L50,90 L20,50 Z" fill="#EE4D2D" />
            <circle cx="35" cy="35" r="6" fill="#FFF6F0" />
            <text x="58" y="72" fill="white" fontSize="26" fontWeight="black" textAnchor="middle" fontFamily="Outfit" transform="rotate(-15 58 72)">%</text>
          </svg>
        </motion.div>

        {/* Floating Shopping Bag Right */}
        <motion.div 
          className="absolute top-[18%] right-[4%] w-24 h-24 md:w-32 md:h-32 text-orange-500/90 drop-shadow-md hidden sm:block"
          animate={{ y: [0, -12, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <svg viewBox="0 0 100 100" fill="currentColor">
            <path d="M50,15 C42,15 36,21 36,29 L36,32 L64,32 L64,29 C64,21 58,15 50,15 Z" fill="none" stroke="#E34E31" strokeWidth="4" />
            <rect x="22" y="32" width="56" height="48" rx="8" fill="#FF693B" />
            <text x="50" y="64" fill="white" fontSize="28" fontWeight="black" textAnchor="middle" fontFamily="Outfit">%</text>
          </svg>
        </motion.div>

        <div className="absolute top-[5%] left-[30%] text-amber-400/60 animate-pulse"><Sparkles className="w-5 h-5 fill-amber-300" /></div>
        <div className="absolute top-[25%] left-[65%] text-amber-400/80"><Sparkles className="w-4 h-4 fill-amber-300 animate-bounce" /></div>
      </div>

      <div className="relative max-w-xl mx-auto px-4 pt-10 z-10 space-y-8">
        
        {/* Floating Copy / Share Hub */}
        <button 
          onClick={sharePage}
          className="absolute top-4 left-4 z-40 bg-white/80 hover:bg-white text-slate-600 hover:text-orange-600 p-2.5 rounded-full shadow-lg border border-slate-100 hover:border-orange-100 backdrop-blur-sm transition-all cursor-pointer"
          title="Compartilhar Canal"
          id="btn-share-page"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* HEADER SECTION */}
        <div className="flex flex-col items-center text-center pt-2 relative">
          <div className="relative mb-4 flex items-center justify-center">
            <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-2xl animate-pulse scale-125" />
            
            <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex gap-1 z-10 text-orange-500 font-extrabold text-sm opacity-90">
              <span className="inline-block transform -rotate-12 translate-y-1 leading-none text-xl">/ /</span>
            </div>
            <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex gap-1 z-10 text-orange-500 font-extrabold text-sm opacity-90">
              <span className="inline-block transform rotate-12 translate-y-1 leading-none text-xl">\ \</span>
            </div>

            <div className="w-32 h-32 md:w-36 md:h-36 bg-white rounded-full border-4 border-orange-500 p-4 shadow-xl flex flex-col items-center justify-center relative hover:scale-105 transition-transform duration-300">
              <svg viewBox="0 0 100 100" className="w-14 h-14 text-orange-500 shrink-0">
                <path d="M50,15 C42,15 36,21 36,29 L36,32 L64,32 L64,29 C64,21 58,15 50,15 Z" fill="none" stroke="#EE4D2D" strokeWidth="6" />
                <rect x="18" y="32" width="64" height="54" rx="10" fill="#EE4D2D" />
                <text x="50" y="73" fill="white" fontSize="38" fontWeight="black" textAnchor="middle" fontFamily="Outfit">S</text>
              </svg>
              <span className="font-display font-medium text-base md:text-lg text-orange-600 mt-2 tracking-wide leading-none uppercase">
                Shopee
              </span>
            </div>
          </div>

          <h1 className="font-display font-extrabold text-3xl md:text-4xl text-[#1e293b] leading-tight flex items-center gap-2">
            {configs.creatorName}
            <span className="text-red-500 animate-pulse">❤️</span>
          </h1>
          
          <p className="text-slate-600 text-sm md:text-base mt-2 max-w-sm leading-relaxed px-4">
            {configs.subtitle}
          </p>
        </div>

        {/* SOCIAL LINKS TREE */}
        <div className="space-y-4">
          {configs.links.map((link) => {
            let iconElement;
            let themeClass = "bg-orange-600 text-white shadow-orange-100 hover:shadow-orange-200/60";
            
            if (link.iconType === 'shopee') {
              iconElement = (
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md">
                  <svg viewBox="0 0 100 100" className="w-6 h-6 text-orange-600 font-extrabold">
                    <path d="M50,15 C42,15 36,21 36,29 L36,32 L64,32 L64,29 C64,21 58,15 50,15 Z" fill="none" stroke="#EE4D2D" strokeWidth="6" />
                    <rect x="18" y="32" width="64" height="54" rx="10" fill="#EE4D2D" />
                    <text x="50" y="73" fill="white" fontSize="38" fontWeight="black" textAnchor="middle" fontFamily="Outfit">S</text>
                  </svg>
                </div>
              );
              themeClass = "bg-[#EE4D2D] hover:bg-[#E33E1D] text-white shadow-[#EE4D2D]/20";
            } else if (link.iconType === 'whatsapp') {
              iconElement = (
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md text-emerald-600">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.059 5.348 5.399.01 12.008 0c3.202.001 6.212 1.244 8.477 3.511 2.263 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.458L0 24zm6.135-4.173l.361.215c1.61.957 3.397 1.463 5.229 1.464 5.485 0 9.947-4.465 9.95-9.95.002-2.657-1.031-5.155-2.909-7.03C16.942 2.65 14.441 1.616 11.78 1.617c-5.483 0-9.945 4.466-9.948 9.95-.001 1.887.493 3.732 1.431 5.349l.235.402-1.037 3.791 3.882-1.018a9.882 9.882 0 0 0 4.85 1.267h.004zM16.517 13.5c-.248-.124-1.465-.722-1.692-.805-.226-.083-.391-.124-.555.124-.166.248-.64.805-.784.966-.144.161-.289.181-.537.057-1.442-.721-2.385-1.2-3.334-2.827-.249-.427.249-.397.712-1.32.077-.161.038-.302-.019-.426-.057-.124-.555-1.337-.76-1.831-.199-.481-.403-.414-.554-.422-.143-.007-.308-.008-.473-.008a.916.916 0 0 0-.661.309c-.227.248-.867.847-.867 2.062 0 1.214.883 2.392 1.007 2.557.124.165 1.737 2.653 4.207 3.717.588.254 1.047.406 1.406.519.59.187 1.127.161 1.551.098.473-.07 1.465-.598 1.67-.1.206-.481.206-.893 0-1.018l-.206-.403c-.124-.124-.37-.184-.619-.307z"/>
                  </svg>
                </div>
              );
              themeClass = "bg-[#EE4D2D] hover:bg-[#E33E1D] text-white shadow-[#EE4D2D]/20";
            } else if (link.iconType === 'whatsapp-channel') {
              iconElement = (
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md text-orange-600 font-extrabold">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-orange-600">
                    <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12s4.477-10 10-10z" />
                    <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" strokeWidth="2" />
                    <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor" />
                    <path d="M16 12h3M5 12h3" strokeWidth="2" />
                  </svg>
                </div>
              );
              themeClass = "bg-[#EE4D2D] hover:bg-[#E33E1D] text-white shadow-orange-500/20";
            } else if (link.iconType === 'instagram') {
              iconElement = (
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md">
                  <Instagram className="w-6 h-6 text-orange-500" />
                </div>
              );
              themeClass = "bg-[#EE4D2D] hover:bg-[#E33E1D] text-white shadow-[#EE4D2D]/20";
            }

            return (
              <motion.a
                key={link.id}
                href={link.url}
                onClick={(e) => handleLinkClick(link.id, link.url, e)}
                className={`flex items-center justify-between p-3.5 pr-6 ${themeClass} rounded-[28px] shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:scale-98 cursor-pointer`}
                whileHover={{ scale: 1.01 }}
                style={{ backgroundColor: configs.primaryColor }}
              >
                <div className="flex items-center gap-4">
                  {iconElement}
                  <div className="text-left">
                    <h3 className="font-display font-bold text-base tracking-wide leading-tight text-white m-0">
                      {link.title}
                    </h3>
                    <p className="text-xs text-orange-100 font-medium m-0 opacity-90 mt-0.5">
                      {link.subtitle}
                    </p>
                  </div>
                </div>

                <span className="text-white bg-white/20 p-1.5 rounded-full hover:bg-white/30 transition-colors">
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </span>
              </motion.a>
            );
          })}

          {/* NOTIFICATION CARD */}
          <motion.div 
            onClick={handleNotificationToggle}
            className={`cursor-pointer p-4 rounded-3xl bg-white/95 border border-orange-100 flex items-center justify-between gap-4 transition-all duration-300 hover:shadow-lg hover:bg-white relative ${
              notificationActive ? 'ring-2 ring-orange-500/30' : ''
            }`}
            whileHover={{ scale: 1.005 }}
          >
            <div className="absolute -top-3 -right-3 pointer-events-none text-orange-400">
              <Sparkles className="w-6 h-6 fill-orange-200/50 opacity-60" />
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100 flex-col relative shadow-sm">
                <svg viewBox="0 0 100 100" className="w-6 h-6 text-[#EE4D2D] font-extrabold pb-0.5">
                  <path d="M50,15 C42,15 36,21 36,29 L36,32 L64,32 L64,29 C64,21 58,15 50,15 Z" fill="none" stroke="#EE4D2D" strokeWidth="6" />
                  <rect x="18" y="32" width="64" height="54" rx="10" fill="#EE4D2D" />
                  <text x="50" y="73" fill="white" fontSize="38" fontWeight="black" textAnchor="middle" fontFamily="Outfit">S</text>
                </svg>
              </div>

              <div className="text-left">
                <h4 className="font-display font-extrabold text-sm text-[#1e293b] flex items-center gap-1.5">
                  Ofertas todos os dias!
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-normal max-w-[280px]">
                  Siga e ative as notificações para não perder nenhuma novidade!
                </p>
              </div>
            </div>

            <div className="relative">
              <motion.div
                animate={notificationActive ? { rotate: [0, 15, -15, 10, -10, 0] } : {}}
                transition={{ repeat: Infinity, duration: 1.5, repeatType: "mirror" }}
                className={`p-2.5 rounded-full flex items-center justify-center ${
                  notificationActive 
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-100' 
                    : 'bg-orange-50 text-orange-600 border border-orange-100'
                }`}
              >
                <Bell className={`w-5 h-5 ${notificationActive ? 'fill-white' : ''}`} />
              </motion.div>
              {notificationActive && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full animate-ping" />
              )}
            </div>
          </motion.div>

        </div>

      </div>

      {/* FOOTER WAVE BACKGROUND (Slightly taller to overlay lock icon button cleanly) */}
      <div className="fixed bottom-0 left-0 right-0 overflow-hidden pointer-events-none z-10 h-28 select-none">
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 left-0 right-0 w-full h-full text-[#EE4D2D] preserve-3d" preserveAspectRatio="none">
          <path 
            fill="currentColor" 
            d="M0,192 C144,149.3,288,106.7,432,128 C576,149.3,720,234.7,864,245.3 C1008,256,1152,192,1296,160 C1440,128,1584,128,1728,128 L1728,320 L0,320 Z"
            className="filter drop-shadow-lg"
          />
        </svg>

        <div className="absolute inset-x-0 bottom-4 px-6 md:px-12 flex justify-between items-center text-white pointer-events-auto">
          {/* Shopee Bag Text Logo Bottom Left */}
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 100 100" className="w-5 h-5 text-white">
              <path d="M50,15 C42,15 36,21 36,29 L36,32 L64,32 L64,29 C64,21 58,15 50,15 Z" fill="none" stroke="white" strokeWidth="6" />
              <rect x="18" y="32" width="64" height="54" rx="10" fill="white" />
              <text x="50" y="73" fill="#EE4D2D" fontSize="38" fontWeight="black" textAnchor="middle" fontFamily="Outfit">S</text>
            </svg>
            <span className="font-display font-extrabold text-sm md:text-lg tracking-wide uppercase">
              {configs.footerText}
            </span>
          </div>

          {/* Quick links to navigate to admin section and aesthetic heart details */}
          <div className="flex items-center gap-4">
            <button 
              onClick={navigateToAdm}
              className="text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full flex items-center gap-1 border border-white/10 transition cursor-pointer"
              title="Acessar ADM"
            >
              <Lock className="w-3 h-3 text-white" />
              <span className="hidden sm:inline">ADM</span>
            </button>

            <motion.div 
              className="text-white flex items-center justify-center p-1.5"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart className="w-5 h-5 fill-white text-[#EE4D2D] h-auto" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE DETAILS AND REDIRECTION MODAL */}
      <DetailsModal 
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onRedirect={handleProductRedirect}
        accentColor={configs.primaryColor}
      />

      {/* GLOBALLY POPPING TOAST MESSAGES */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white text-xs sm:text-sm font-semibold py-3 px-5 rounded-full shadow-2xl flex items-center gap-2 border border-slate-700/50 backdrop-blur animate-fade-in"
          >
            <Check className="w-4 h-4 text-orange-400 stroke-[3]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
