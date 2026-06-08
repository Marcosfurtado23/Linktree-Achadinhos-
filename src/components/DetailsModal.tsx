import React, { useEffect, useState } from 'react';
import { ProductItem, mockComments } from '../data/defaultData';
import { 
  X, 
  ExternalLink, 
  Tag, 
  Check, 
  Star, 
  MessageSquare, 
  Compass, 
  Share2, 
  Sparkles, 
  Loader2, 
  ShoppingBag,
  Bell
} from 'lucide-react';

interface DetailsModalProps {
  product: ProductItem | null;
  onClose: () => void;
  onRedirect: () => void;
  accentColor: string;
}

export function DetailsModal({ product, onClose, onRedirect, accentColor }: DetailsModalProps) {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!product) {
      setCountdown(null);
      setIsRedirecting(false);
      return;
    }
    // Setup body scroll lock
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [product]);

  const handleCopy = () => {
    if (!product?.couponCode) return;
    navigator.clipboard.writeText(product.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBuy = () => {
    setIsRedirecting(true);
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown === 0) {
      // Trigger actual redirection
      onRedirect();
      setIsRedirecting(false);
      setCountdown(null);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onRedirect]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative border border-orange-100 animate-scale-up flex flex-col max-h-[90vh]">
        
        {/* Header Visual with Custom Icon & Orange Accents */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100/60 p-5 pb-4 flex justify-between items-start border-b border-orange-100/40 relative">
          <div className="absolute top-0 right-12 w-20 h-20 bg-orange-200/20 rounded-full blur-xl pointer-events-none" />
          
          <div className="pr-4">
            <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full uppercase tracking-wider block w-fit mb-1.5 shadow-sm">
              Oferta Imperdível 🔥
            </span>
            <h3 className="font-display font-medium text-base text-slate-800 leading-snug line-clamp-2">
              {product.title}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 px-2.5 text-slate-400 hover:text-slate-600 hover:bg-white/80 rounded-full transition shadow-sm border border-slate-100 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Scroll Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
          
          {/* Main Visual Promo */}
          <div className="flex flex-col items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100 shadow-inner relative">
            <span className="absolute top-2 right-2 text-xs font-bold text-white bg-red-500 px-2.5 py-0.5 rounded-full shadow-sm animate-pulse">
              {product.discountPercentage}% Desconto
            </span>
            <div className="w-24 h-24 bg-white rounded-xl shadow-md border border-slate-100 flex items-center justify-center relative mb-4">
              <span className="text-4xl">🛍️</span>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-slate-400 line-through">Preço original de: R$ {product.originalPrice.toFixed(2)}</p>
              <div className="flex items-baseline justify-center gap-1.5 mt-0.5">
                <span className="text-xs font-bold text-emerald-600 uppercase">Preço especial:</span>
                <span className="text-2xl font-black text-slate-900">R$ {product.price.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Avaliado com {product.rating} ⭐ • {product.sales}</p>
            </div>
          </div>

          {/* How to use Coupon and Buy guide */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <Compass className="w-4.5 h-4.5 text-orange-500" />
              Como comprar com desconto máximo:
            </h4>
            <ol className="text-xs text-slate-600 space-y-2 border-l-2 border-orange-100 pl-4 ml-2">
              <li className="relative">
                <span className="absolute -left-[23px] top-0 bg-orange-500 text-white font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] shadow-sm">1</span>
                Copie o cupom de desconto exclusivo abaixo.
              </li>
              <li className="relative">
                <span className="absolute -left-[23px] top-0 bg-orange-500 text-white font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] shadow-sm">2</span>
                Clique no botão de compra abaixo para abrir o produto oficial na Shopee.
              </li>
              <li className="relative">
                <span className="absolute -left-[23px] top-0 bg-orange-500 text-white font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] shadow-sm">3</span>
                Cole o cupom no carrinho antes de finalizar a compra e aproveite!
              </li>
            </ol>
          </div>

          {/* Coupon Code Selection */}
          {product.couponCode && (
            <div className="bg-orange-50/50 p-4 rounded-2xl border border-dashed border-orange-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-xl text-orange-600 shadow-sm shrink-0 border border-orange-100">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest leading-none">Cupom da Lu</p>
                  <p className="text-sm font-mono font-bold text-slate-800 mt-1">{product.couponCode}</p>
                </div>
              </div>
              <button
                onClick={handleCopy}
                className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow ${
                  copied
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> Copiado!
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 opacity-50" /> Copiar Código
                  </>
                )}
              </button>
            </div>
          )}

          {/* Customer Reviews Simulation */}
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-xs text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              O que estão falando deste achadinho ({mockComments.length})
            </h4>
            
            <div className="space-y-2.5">
              {mockComments.map((comment) => (
                <div key={comment.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-700">{comment.user}</span>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: comment.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 italic leading-relaxed">"{comment.text}"</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer / Buy Trigger */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
          {isRedirecting ? (
            <div className="bg-orange-600 text-white rounded-2xl py-3.5 px-4 flex items-center justify-center gap-3 font-semibold text-sm shadow-lg animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Redirecionando em {countdown}s para a Shopee...</span>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleBuy}
                className="flex-1 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold py-3 px-5 rounded-2xl text-sm flex items-center justify-center gap-2 transition duration-300 shadow-md shadow-orange-100"
              >
                Ir para Loja Shopee <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className="text-[10px] text-center text-slate-400">
            Você apoia o canal comprando pelos links recomendados. Obrigado!  
          </p>
        </div>

      </div>
    </div>
  );
}
