import React, { useState } from 'react';
import { ProductItem } from '../data/defaultData';
import { 
  Search, 
  Tag, 
  ExternalLink, 
  Copy, 
  Check, 
  Flame, 
  Sparkles, 
  CupSoda, 
  Fan, 
  Gift, 
  ArrowUpDown,
  Smartphone,
  Eye
} from 'lucide-react';

interface DealsSectionProps {
  products: ProductItem[];
  onProductClick: (productId: string) => void;
  accentColor: string;
}

export function DealsSection({ products, onProductClick, accentColor }: DealsSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'discount'>('default');

  // Dynamically extract categories
  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))];

  // Map icon strings to Lucide elements
  const renderProductIcon = (iconName: string) => {
    switch (iconName) {
      case 'Fan':
        return <Fan className="w-10 h-10 text-orange-500 animate-spin-slow" />;
      case 'Sparkles':
        return <Sparkles className="w-10 h-10 text-pink-500" />;
      case 'CupSoda':
        return <CupSoda className="w-10 h-10 text-blue-500" />;
      case 'FlameTheme':
        return <Flame className="w-10 h-10 text-red-500 animate-pulse" />;
      case 'Smartphone':
        return <Smartphone className="w-10 h-10 text-teal-500" />;
      default:
        return <Gift className="w-10 h-10 text-orange-500" />;
    }
  };

  const handleCopyCoupon = (code: string | undefined, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter and sort products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.couponCode && p.couponCode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'discount') return b.discountPercentage - a.discountPercentage;
    return 0; // default
  });

  return (
    <div className="bg-white/95 rounded-[32px] p-6 shadow-xl border border-orange-100/50 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-xl text-slate-800 flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-600 fill-orange-500 animate-bounce" />
          Mural de Achadinhos 🛍️
        </h3>
        <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-3 py-1 rounded-full animate-pulse">
          {products.length} ofertas hoje
        </span>
      </div>

      <p className="text-xs text-slate-500 mb-5 leading-relaxed">
        Clique para ver mais detalhes. Copie o cupom exclusivo e aproveite o desconto direto na Shopee!
      </p>

      {/* Search and Category Filter */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar achadinho ou cupom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 transition text-sm bg-slate-50/50"
          />
        </div>

        {/* Scrollable Categories & Sort */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === cat 
                    ? 'shadow-sm text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                style={{
                  backgroundColor: selectedCategory === cat ? accentColor : undefined,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Ordenar por:
            </span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="text-xs text-slate-600 bg-transparent font-medium border-0 focus:outline-none focus:ring-0 cursor-pointer pr-5 py-0"
            >
              <option value="default">Recomendados</option>
              <option value="price-asc">Menor Preço</option>
              <option value="price-desc">Maior Preço</option>
              <option value="discount">Maior Desconto</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-10 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <Gift className="w-10 h-10 text-slate-300 mx-auto mb-2 animate-bounce" />
          <p className="text-sm font-medium text-slate-500">Nenhum produto encontrado</p>
          <p className="text-xs text-slate-400">Tente buscar por outro termo ou categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sortedProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => onProductClick(p.id)}
              className="group relative flex gap-4 bg-slate-50/60 p-3 rounded-2xl border border-slate-100/80 hover:border-orange-200 transition-all duration-300 hover:shadow-md cursor-pointer hover:bg-white"
            >
              {/* Product Badge */}
              <span 
                className="absolute top-2.5 left-2.5 text-[10px] font-bold text-white px-2 py-0.5 rounded-full z-10 shadow-sm"
                style={{ backgroundColor: accentColor }}
              >
                {p.discountPercentage}% OFF
              </span>

              {/* Product Image / Icon placeholder */}
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-xl border border-slate-100 flex items-center justify-center relative shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-300">
                {renderProductIcon(p.imageIcon)}
                {/* Visual grid accent inside bag */}
                <span className="absolute bottom-1 right-1 px-1 bg-slate-100/80 text-[8px] font-mono rounded text-slate-500">
                  {p.sales.split(' ')[0]}
                </span>
              </div>

              {/* Product Info */}
              <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                <div>
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block mb-0.5">
                    {p.category}
                  </span>
                  <h4 className="font-sans font-semibold text-xs md:text-sm text-slate-800 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
                    {p.title}
                  </h4>
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400 line-through">
                      R$ {p.originalPrice.toFixed(2)}
                    </span>
                    <span className="text-sm font-bold text-slate-900 md:text-base">
                      R$ {p.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Coupon & Shopee Action */}
                  <div className="flex items-center gap-1.5 mt-1" onClick={(e) => e.stopPropagation()}>
                    {p.couponCode && (
                      <button
                        onClick={(e) => handleCopyCoupon(p.couponCode, p.id, e)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono font-bold transition-all border ${
                          copiedId === p.id
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                        }`}
                        title="Copiar Cupom"
                      >
                        {copiedId === p.id ? <Check className="w-3 h-3" /> : <Tag className="w-3 h-3 text-orange-600" />}
                        {copiedId === p.id ? 'Copiado!' : p.couponCode}
                      </button>
                    )}

                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onProductClick(p.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold text-white bg-slate-800 hover:bg-slate-900 transition-colors ml-auto shadow-sm"
                    >
                      Ver <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
