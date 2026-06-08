import React, { useState } from 'react';
import { AppConfig, ProductItem } from '../data/defaultData';
import { firebaseUtils, isUsingMockDb } from '../firebase';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  BarChart3, 
  Plus, 
  Trash2, 
  Link2, 
  User, 
  CheckCircle,
  HelpCircle,
  LogOut,
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';

interface AdminPanelProps {
  config: AppConfig;
  onChangeConfig: (newConfig: AppConfig) => void;
  products: ProductItem[];
  onChangeProducts: (newProducts: ProductItem[]) => void;
  clicks: Record<string, number>;
  onResetClicks: () => void;
  onResetEverything: () => void;
  onLogout: () => void;
  onBackToSite: () => void;
}

export function AdminPanel({ 
  config, 
  onChangeConfig, 
  products, 
  onChangeProducts, 
  clicks, 
  onResetClicks,
  onResetEverything,
  onLogout,
  onBackToSite
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'geral' | 'links' | 'produtos' | 'estatisticas'>('geral');
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  // Form states
  const [creatorName, setCreatorName] = useState(config.creatorName);
  const [subtitle, setSubtitle] = useState(config.subtitle);
  const [primaryColor, setPrimaryColor] = useState(config.primaryColor);
  const [shopeeLink, setShopeeLink] = useState(config.links[0]?.url || '');
  const [whatsGroup, setWhatsGroup] = useState(config.links[1]?.url || '');
  const [whatsChannel, setWhatsChannel] = useState(config.links[2]?.url || '');
  const [instagram, setInstagram] = useState(config.links[3]?.url || '');
  
  const [shopeeTitle, setShopeeTitle] = useState(config.links[0]?.title || 'Loja na Shopee');
  const [shopeeSubtitle, setShopeeSubtitle] = useState(config.links[0]?.subtitle || 'Confira nossos produtos');
  const [whatsGroupTitle, setWhatsGroupTitle] = useState(config.links[1]?.title || 'Grupo de WhatsApp');
  const [whatsGroupSubtitle, setWhatsGroupSubtitle] = useState(config.links[1]?.subtitle || 'Achadinhos da Lu');
  const [whatsChannelTitle, setWhatsChannelTitle] = useState(config.links[2]?.title || 'Canal de WhatsApp');
  const [whatsChannelSubtitle, setWhatsChannelSubtitle] = useState(config.links[2]?.subtitle || 'Achadinhos da Lu');
  const [instagramTitle, setInstagramTitle] = useState(config.links[3]?.title || 'Instagram');

  // New product form states
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newOriginalPrice, setNewOriginalPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Utilidades');
  const [newIcon, setNewIcon] = useState('Gift');
  const [newCoupon, setNewCoupon] = useState('');

  const [instagramHandle, setInstagramHandle] = useState(config.links[3]?.subtitle || '@achadinhosdaLu');

  const showToast = (msg: string) => {
    setBannerMsg(msg);
    setTimeout(() => setBannerMsg(null), 3000);
  };

  const saveGeneral = () => {
    const updatedLinks = [...config.links];
    // Loja
    if (updatedLinks[0]) {
      updatedLinks[0].url = shopeeLink;
      updatedLinks[0].title = shopeeTitle;
      updatedLinks[0].subtitle = shopeeSubtitle;
    }
    // Whatsapp Group
    if (updatedLinks[1]) {
      updatedLinks[1].url = whatsGroup;
      updatedLinks[1].title = whatsGroupTitle;
      updatedLinks[1].subtitle = whatsGroupSubtitle;
    }
    // Whatsapp Channel
    if (updatedLinks[2]) {
      updatedLinks[2].url = whatsChannel;
      updatedLinks[2].title = whatsChannelTitle;
      updatedLinks[2].subtitle = whatsChannelSubtitle;
    }
    // Instagram
    if (updatedLinks[3]) {
      updatedLinks[3].url = instagram;
      updatedLinks[3].title = instagramTitle;
      updatedLinks[3].subtitle = instagramHandle;
    }

    onChangeConfig({
      ...config,
      creatorName,
      subtitle,
      primaryColor,
      links: updatedLinks
    });
    showToast("Configurações atualizadas com sucesso! ✔️");
  };

  const handleAddProduct = () => {
    if (!newTitle || !newPrice) {
      alert("Por favor insira um título e preço válido!");
      return;
    }
    const priceNum = parseFloat(newPrice);
    const origPriceNum = parseFloat(newOriginalPrice) || (priceNum * 2.5);
    const discount = Math.round(((origPriceNum - priceNum) / origPriceNum) * 100);

    const newProd: ProductItem = {
      id: `prod-custom-${Date.now()}`,
      title: newTitle,
      price: priceNum,
      originalPrice: origPriceNum,
      rating: 4.8 + Math.random() * 0.2,
      sales: `${(1 + Math.floor(Math.random() * 10))}k+ vendidos`,
      category: newCategory,
      imageIcon: newIcon,
      link: shopeeLink || "https://shopee.com.br",
      discountPercentage: discount > 0 ? discount : 50,
      couponCode: newCoupon.toUpperCase() || undefined
    };

    onChangeProducts([newProd, ...products]);
    setNewTitle('');
    setNewPrice('');
    setNewOriginalPrice('');
    setNewCoupon('');
    showToast("Produto adicionado com sucesso! 🛒");
  };

  const handleDeleteProduct = (id: string) => {
    onChangeProducts(products.filter(p => p.id !== id));
    showToast("Produto removido! 🗑️");
  };

  return (
    <div className="min-h-screen bg-[#FFF5F0] pb-24">
      {/* Upper Navigation and Header Area */}
      <div className="bg-white border-b border-orange-100 shadow-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#EE4D2D] text-white rounded-2xl shadow-md">
              <Settings className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-xl text-slate-800 flex items-center gap-1.5 leading-none">
                Painel Administrativo da Lu
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Controle total de produtos e canais de tráfego</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={onBackToSite}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver Site Final</span>
            </button>
            <button 
              onClick={onLogout}
              className="px-4 py-2 bg-orange-100 hover:bg-[#EE4D2D]/15 text-[#EE4D2D] font-bold rounded-xl text-xs sm:text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair do ADM</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Form Dashboard Body */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        
        {/* Firestore connection notification */}
        <div className="mb-6 bg-gradient-to-r from-orange-500 to-[#EE4D2D] text-white p-4 rounded-3xl shadow-md border border-orange-400/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-4 text-white/5 pointer-events-none scale-150">
            <Database className="w-32 h-32" />
          </div>
          <div className="flex items-start gap-3 z-10">
            <Database className="w-5 h-5 shrink-0 mt-0.5 text-orange-200" />
            <div className="text-xs">
              <span className="font-bold block text-sm">Base de dados ativa ({isUsingMockDb ? 'Local Sandbox' : 'Firebase Firestore'})</span>
              {isUsingMockDb 
                ? 'Seus dados estão sendo guardados no persistente local. Conecte as chaves de API caso precise sincronizar com o Cloud Firestore.' 
                : 'Você está conectado de forma segura com o Firestore do Firebase.'}
            </div>
          </div>
          <div className="z-10 shrink-0 text-right">
            <span className="inline-block px-3 py-1 bg-white/20 rounded-full font-mono text-[10px] uppercase tracking-wide font-bold">
              {isUsingMockDb ? 'Offline persistent-mode' : 'Production firebase-db'}
            </span>
          </div>
        </div>

        {/* Live Notification Messages inside tab dashboard */}
        {bannerMsg && (
          <div className="mb-6 bg-emerald-50 text-emerald-800 px-5 py-3 rounded-2xl border border-emerald-100 flex items-center gap-2 text-xs font-bold animate-fade-in">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
            {bannerMsg}
          </div>
        )}

        {/* Layout with Side Tabs and form content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          
          {/* Navigation Tab column */}
          <div className="bg-white rounded-3xl border border-orange-100 p-2.5 space-y-1.5 shadow-sm">
            {[
              { id: 'geral', label: 'Início & Perfil', icon: <User className="w-4 h-4" /> },
              { id: 'links', label: 'Links Sociais', icon: <Link2 className="w-4 h-4" /> },
              { id: 'produtos', label: 'Meus Achadinhos', icon: <Plus className="w-4 h-4" /> },
              { id: 'estatisticas', label: 'Estatísticas de Cliques', icon: <BarChart3 className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${
                  activeTab === tab.id 
                    ? 'bg-[#EE4D2D] text-white shadow-md' 
                    : 'text-slate-600 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            ))}
          </div>

          {/* Form container section */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-3xl border border-orange-100 p-6 shadow-sm md:p-8 min-h-[460px]">
              
              {/* TAB: GERAL */}
              {activeTab === 'geral' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display font-extrabold text-xl text-slate-800">Layout da Página principal</h2>
                    <p className="text-xs text-slate-500 mt-1">Configure o título de boas vindas, descrição de perfil e cores do feed.</p>
                  </div>

                  <div className="space-y-4 border-t border-dashed border-slate-100 pt-5">
                    <div className="space-y-1.5 animate-fade-in">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nome da Criadora / Loja</label>
                      <input 
                        type="text" 
                        value={creatorName} 
                        onChange={(e) => setCreatorName(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm border-2 border-orange-50/60 rounded-xl focus:outline-none focus:border-[#EE4D2D] font-semibold"
                        placeholder="Ex: Achadinhos da Lu"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Subtítulo / Mensagem de cabeçalho</label>
                      <textarea 
                        value={subtitle} 
                        onChange={(e) => setSubtitle(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm border-2 border-orange-50/60 rounded-xl focus:outline-none focus:border-[#EE4D2D] font-semibold min-h-[80px]"
                        placeholder="Ex: Promoções e achadinhos imperdíveis!"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center justify-between">
                        <span>Paleta de Cores (Hexadecimal)</span>
                        <span className="w-5 h-5 rounded-full border shadow-sm inline-block" style={{ backgroundColor: primaryColor }} />
                      </label>
                      <input 
                        type="text" 
                        value={primaryColor} 
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm border-2 border-orange-50/60 rounded-xl focus:outline-none focus:border-[#EE4D2D] font-mono font-bold text-indigo-950"
                        placeholder="Ex: #EE4D2D"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <button 
                      onClick={saveGeneral}
                      className="flex-1 bg-[#EE4D2D] hover:bg-[#E33E1D] text-white font-bold py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-md cursor-pointer"
                    >
                      <Save className="w-4.5 h-4.5" /> Salvar Perfil Geral
                    </button>
                    <button 
                      onClick={onResetEverything}
                      className="px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Resetar tudo para o padrão"
                    >
                      <RotateCcw className="w-4 h-4" /> Resetar
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: LINKS SOCIAIS */}
              {activeTab === 'links' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display font-extrabold text-xl text-slate-800">Canais e Links Diretos</h2>
                    <p className="text-xs text-slate-500 mt-1">Insira os links e subtítulos para canal do WhatsApp, perfil do Instagram ou canais de afiliados.</p>
                  </div>

                  <div className="space-y-6 border-t border-dashed border-slate-100 pt-5">
                    {/* Botão 1 - Shopee */}
                    <div className="space-y-3 p-4 bg-orange-50/30 rounded-2xl border border-orange-100/60">
                      <h3 className="font-bold text-xs text-orange-850 uppercase tracking-wider flex items-center gap-1.5 border-b border-orange-100/60 pb-1.5">
                        <span>🛍️ Botão 1: Loja na Shopee</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-500 uppercase">Texto do Botão (Título)</label>
                          <input 
                            type="text" 
                            value={shopeeTitle} 
                            onChange={(e) => setShopeeTitle(e.target.value)}
                            className="w-full px-3 py-2 text-xs border-2 border-orange-50/60 rounded-xl bg-white focus:outline-none focus:border-[#EE4D2D] font-semibold"
                            placeholder="Loja na Shopee"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-500 uppercase">Texto de Apoio (Subtítulo)</label>
                          <input 
                            type="text" 
                            value={shopeeSubtitle} 
                            onChange={(e) => setShopeeSubtitle(e.target.value)}
                            className="w-full px-3 py-2 text-xs border-2 border-orange-50/60 rounded-xl bg-white focus:outline-none focus:border-[#EE4D2D] font-semibold"
                            placeholder="Confira nossos produtos"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Link de Destino (URL)</label>
                        <input 
                          type="url" 
                          value={shopeeLink} 
                          onChange={(e) => setShopeeLink(e.target.value)}
                          className="w-full px-3 py-2 text-xs border-2 border-orange-50/60 rounded-xl bg-white focus:outline-none focus:border-[#EE4D2D] font-semibold"
                          placeholder="https://shopee.com.br..."
                        />
                      </div>
                    </div>

                    {/* Botão 2 - Grupo Whatsapp */}
                    <div className="space-y-3 p-4 bg-orange-50/30 rounded-2xl border border-orange-100/60">
                      <h3 className="font-bold text-xs text-orange-850 uppercase tracking-wider flex items-center gap-1.5 border-b border-orange-100/60 pb-1.5">
                        <span>💬 Botão 2: Grupo de WhatsApp</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-500 uppercase">Texto do Botão (Título)</label>
                          <input 
                            type="text" 
                            value={whatsGroupTitle} 
                            onChange={(e) => setWhatsGroupTitle(e.target.value)}
                            className="w-full px-3 py-2 text-xs border-2 border-orange-50/60 rounded-xl bg-white focus:outline-none focus:border-[#EE4D2D] font-semibold"
                            placeholder="Grupo de WhatsApp"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-500 uppercase">Texto de Apoio (Subtítulo)</label>
                          <input 
                            type="text" 
                            value={whatsGroupSubtitle} 
                            onChange={(e) => setWhatsGroupSubtitle(e.target.value)}
                            className="w-full px-3 py-2 text-xs border-2 border-orange-50/60 rounded-xl bg-white focus:outline-none focus:border-[#EE4D2D] font-semibold"
                            placeholder="Achadinhos da Lu"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Link de Destino (URL)</label>
                        <input 
                          type="url" 
                          value={whatsGroup} 
                          onChange={(e) => setWhatsGroup(e.target.value)}
                          className="w-full px-3 py-2 text-xs border-2 border-orange-50/60 rounded-xl bg-white focus:outline-none focus:border-[#EE4D2D] font-semibold"
                          placeholder="https://chat.whatsapp.com/..."
                        />
                      </div>
                    </div>

                    {/* Botão 3 - Canal Whatsapp */}
                    <div className="space-y-3 p-4 bg-orange-50/30 rounded-2xl border border-orange-100/60">
                      <h3 className="font-bold text-xs text-orange-850 uppercase tracking-wider flex items-center gap-1.5 border-b border-orange-100/60 pb-1.5">
                        <span>📢 Botão 3: Canal Oficial WhatsApp</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-500 uppercase">Texto do Botão (Título)</label>
                          <input 
                            type="text" 
                            value={whatsChannelTitle} 
                            onChange={(e) => setWhatsChannelTitle(e.target.value)}
                            className="w-full px-3 py-2 text-xs border-2 border-orange-50/60 rounded-xl bg-white focus:outline-none focus:border-[#EE4D2D] font-semibold"
                            placeholder="Canal de WhatsApp"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-500 uppercase">Texto de Apoio (Subtítulo)</label>
                          <input 
                            type="text" 
                            value={whatsChannelSubtitle} 
                            onChange={(e) => setWhatsChannelSubtitle(e.target.value)}
                            className="w-full px-3 py-2 text-xs border-2 border-orange-50/60 rounded-xl bg-white focus:outline-none focus:border-[#EE4D2D] font-semibold"
                            placeholder="Achadinhos da Lu"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Link de Destino (URL)</label>
                        <input 
                          type="url" 
                          value={whatsChannel} 
                          onChange={(e) => setWhatsChannel(e.target.value)}
                          className="w-full px-3 py-2 text-xs border-2 border-orange-50/60 rounded-xl bg-white focus:outline-none focus:border-[#EE4D2D] font-semibold"
                          placeholder="https://whatsapp.com/channel/..."
                        />
                      </div>
                    </div>

                    {/* Botão 4 - Instagram */}
                    <div className="space-y-3 p-4 bg-orange-50/30 rounded-2xl border border-orange-100/60">
                      <h3 className="font-bold text-xs text-orange-850 uppercase tracking-wider flex items-center gap-1.5 border-b border-orange-100/60 pb-1.5">
                        <span>📸 Botão 4: Instagram</span>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-500 uppercase">Texto do Botão (Título)</label>
                          <input 
                            type="text" 
                            value={instagramTitle} 
                            onChange={(e) => setInstagramTitle(e.target.value)}
                            className="w-full px-3 py-2 text-xs border-2 border-orange-50/60 rounded-xl bg-white focus:outline-none focus:border-[#EE4D2D] font-semibold"
                            placeholder="Instagram"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-500 uppercase">Texto de Apoio (Subtítulo)</label>
                          <input 
                            type="text" 
                            value={instagramHandle} 
                            onChange={(e) => setInstagramHandle(e.target.value)}
                            className="w-full px-3 py-2 text-xs border-2 border-orange-50/60 rounded-xl bg-white focus:outline-none focus:border-[#EE4D2D] font-semibold"
                            placeholder="@achadinhosdaLu"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-500 uppercase">Link de Destino (URL)</label>
                        <input 
                          type="url" 
                          value={instagram} 
                          onChange={(e) => setInstagram(e.target.value)}
                          className="w-full px-3 py-2 text-xs border-2 border-orange-50/60 rounded-xl bg-white focus:outline-none focus:border-[#EE4D2D] font-semibold"
                          placeholder="https://instagram.com/..."
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={saveGeneral}
                    className="w-full bg-[#EE4D2D] hover:bg-[#E33E1D] text-white font-bold py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Save className="w-4.5 h-4.5" /> Salvar Configurações de Links
                  </button>
                </div>
              )}

              {/* TAB: PRODUTOS */}
              {activeTab === 'produtos' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display font-extrabold text-xl text-slate-800">Catálogo de Produtos e Ofertas</h2>
                    <p className="text-xs text-slate-500 mt-1">Adicione ou remova as ofertas da Shopee exibidas no mural em tempo real.</p>
                  </div>

                  {/* Add Product Mini-Form */}
                  <div className="bg-orange-50/30 p-5 rounded-3xl border border-orange-100/60 space-y-4">
                    <h3 className="font-bold text-sm text-orange-900 flex items-center gap-1.5 border-b border-orange-100 pb-2">
                      <Plus className="w-4.5 h-4.5 text-[#EE4D2D] stroke-[3]" />
                      Adicionar Nova Oferta (Achadinho)
                    </h3>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">Nome do Produto</label>
                      <input 
                        type="text" 
                        value={newTitle} 
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 bg-white"
                        placeholder="Ex: Luminária de Mesa USB Flexível"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">Preço Oferecido (R$)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          value={newPrice} 
                          onChange={(e) => setNewPrice(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 bg-white"
                          placeholder="Ex: 24.90"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">Preço Original (R$)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          value={newOriginalPrice} 
                          onChange={(e) => setNewOriginalPrice(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 bg-white"
                          placeholder="Ex: 69.90"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">Categoria</label>
                        <select 
                          value={newCategory} 
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 bg-white"
                        >
                          <option value="Utilidades">Utilidades</option>
                          <option value="Beleza">Beleza</option>
                          <option value="Cozinha">Cozinha</option>
                          <option value="Organização">Organização</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500">Ícone Redondo</label>
                        <select 
                          value={newIcon} 
                          onChange={(e) => setNewIcon(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 bg-white"
                        >
                          <option value="Fan">Ventilador</option>
                          <option value="Sparkles">Estrela / Geral</option>
                          <option value="CupSoda">Garrafa Térmica</option>
                          <option value="FlameTheme">Iluminação</option>
                          <option value="Smartphone">Smartphone / Tech</option>
                          <option value="Gift">Presente / Casa</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">Cupom de Desconto Shopee (Opcional)</label>
                      <input 
                        type="text" 
                        value={newCoupon} 
                        onChange={(e) => setNewCoupon(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 font-mono font-bold bg-white"
                        placeholder="Ex: COCO25OFF"
                      />
                    </div>

                    <button 
                      onClick={handleAddProduct}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow"
                    >
                      <Plus className="w-4 h-4" /> Adicionar e Publicar no Mural
                    </button>
                  </div>

                  {/* List of current products available */}
                  <div className="space-y-3 pt-4 border-t border-dashed border-slate-100">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
                        Ofertas Cadastradas ({products.length})
                      </label>
                      {products.length > 0 && (
                        <button
                          onClick={() => {
                            if (window.confirm("Deseja realmente remover TODOS os produtos do mural?")) {
                              onChangeProducts([]);
                              showToast("Mural de ofertas limpo com sucesso! 🗑️");
                            }
                          }}
                          className="text-[11px] bg-red-50 hover:bg-red-100 text-[#EE4D2D] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Limpar Tudo
                        </button>
                      )}
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {products.map(p => (
                        <div key={p.id} className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm text-xs md:text-sm">
                          <div className="min-w-0 flex-1 pr-4">
                            <p className="font-extrabold text-slate-700 truncate">{p.title}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">R$ {p.price.toFixed(2)} • {p.category} {p.couponCode ? `• Cupom: ${p.couponCode}` : ''}</p>
                          </div>
                          <button 
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 text-[#EE4D2D] hover:text-white hover:bg-[#EE4D2D] rounded-xl transition cursor-pointer"
                            title="Excluir item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB: ESTATÍSTICAS */}
              {activeTab === 'estatisticas' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display font-extrabold text-xl text-slate-800">Estatísticas de Tráfego</h2>
                      <p className="text-xs text-slate-500 mt-1">Visualize quantos cliques foram dados em cada botão.</p>
                    </div>
                    <button 
                      onClick={onResetClicks}
                      className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Limpar Contagens
                    </button>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-dashed border-slate-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-medium">
                      
                      <div className="bg-orange-50/20 p-4 border border-orange-100/60 rounded-2xl">
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Loja Shopee principal</span>
                        <div className="text-2xl font-black text-orange-600 mt-1">{clicks['shopee-store'] || 0} clicks</div>
                      </div>

                      <div className="bg-[#EE4D2D]/5 p-4 border border-orange-100/60 rounded-2xl">
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Grupo de WhatsApp</span>
                        <div className="text-2xl font-black text-emerald-600 mt-1">{clicks['whatsapp-group'] || 0} clicks</div>
                      </div>

                      <div className="bg-[#EE4D2D]/5 p-4 border border-orange-100/60 rounded-2xl">
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Canal Oficial WhatsApp</span>
                        <div className="text-2xl font-black text-rose-600 mt-1">{clicks['whatsapp-channel'] || 0} clicks</div>
                      </div>

                      <div className="bg-[#EE4D2D]/5 p-4 border border-orange-100/60 rounded-2xl">
                        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Instagram</span>
                        <div className="text-2xl font-black text-[#EE4D2D] mt-1">{clicks['instagram-profile'] || 0} clicks</div>
                      </div>

                    </div>

                    {/* Progress bars matching previous sections */}
                    <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4 space-y-3">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">Adesão de visualização</h3>
                      
                      <div className="space-y-2">
                        {[
                          { label: 'Loja na Shopee', key: 'shopee-store', colorBg: 'bg-orange-500' },
                          { label: 'Grupo de WhatsApp', key: 'whatsapp-group', colorBg: 'bg-green-500' },
                          { label: 'Canal do WhatsApp', key: 'whatsapp-channel', colorBg: 'bg-emerald-500' },
                          { label: 'Perfil Instagram', key: 'instagram-profile', colorBg: 'bg-pink-500' },
                          { label: 'Notificação Ativa', key: 'notifications', colorBg: 'bg-amber-500' }
                        ].map((source) => {
                          const value = clicks[source.key] || 0;
                          return (
                            <div key={source.key} className="flex justify-between items-center text-xs text-slate-600 bg-white p-2 rounded-xl border border-slate-100">
                              <span className="font-semibold shrink-0">{source.label}:</span>
                              <div className="flex-1 bg-slate-100 h-2 rounded-full mx-3 overflow-hidden">
                                <div className={`${source.colorBg} h-full`} style={{ width: `${Math.min(value * 6, 100)}%` }}></div>
                              </div>
                              <span className="font-bold text-slate-800">{value}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Product specific clicks */}
                    <div className="space-y-2 pt-2">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Visualização por Achadinho individual</h4>
                      <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                        {products.map(p => {
                          const count = clicks[`prod-${p.id}`] || 0;
                          return (
                            <div key={p.id} className="flex justify-between items-center text-xs text-slate-600 bg-white p-2 rounded-2xl border border-slate-100">
                              <span className="font-semibold text-slate-800 truncate pr-2 flex-1">{p.title}</span>
                              <span className="font-bold text-orange-600 bg-orange-50 px-3 py-0.5 rounded-full text-[10px] shrink-0">
                                {count} cliques
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
