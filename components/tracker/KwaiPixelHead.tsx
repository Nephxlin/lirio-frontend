'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { useSearchParams } from 'next/navigation'

interface KwaiPixelHeadProps {
  pixelId: string
}

/**
 * Componente Kwai Pixel para o <head>
 * Carrega o SDK o mais cedo possível para evitar perda de dados
 */
export function KwaiPixelHead({ pixelId }: KwaiPixelHeadProps) {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    if (typeof window === 'undefined' || !pixelId) return

    // Salvar parâmetros da URL
    const clickid = searchParams.get('clickid') || searchParams.get('kwai_clickid')
    const mmpcode = searchParams.get('mmpcode') || searchParams.get('kwai_mmpcode') || 'PL'

    if (clickid) sessionStorage.setItem('kwai_clickid', clickid)
    if (mmpcode) sessionStorage.setItem('kwai_mmpcode', mmpcode)
    if (pixelId) sessionStorage.setItem('kwai_pixel_id', pixelId)
  }, [pixelId, searchParams])

  if (!pixelId) return null

  return (
    <>
      {/* Kwai Pixel Loader - Prioridade Máxima */}
      <Script
        id="kwai-pixel-loader"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
(function(e,t,n,a,s,c,i,o){
  e.KwaiAnalyticsObject=s;
  e[s]=e[s]||[];
  e[s].methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
  var r=function(e,t){
    e[t]=function(){
      for(var n=[],a=0;a<arguments.length;a++)n[a]=arguments[a];
      var s=[t].concat(n);
      e.push(s);
    }
  };
  e[s].methods.forEach(function(t){r(e[s],t)});
  e[s].instance=function(t){
    var n=e[s]._i||{};
    if(!n[t]){
      n[t]=[];
      e[s].methods.forEach(function(e){r(n[t],e)});
    }
    return n[t];
  };
  e[s].load=function(n,a){
    e[s]._i=e[s]._i||{};
    e[s]._i[n]=[];
    e[s]._t=e[s]._t||{};
    e[s]._t[n]=+new Date;
    e[s]._o=e[s]._o||{};
    e[s]._o[n]=a||{};
    var r="https://s21-def.ap4r.com/kos/s101/nlav112572/pixel/events.js?sdkid="+n+"&lib="+s;
    var c=t.createElement("script");
    c.type="text/javascript";
    c.async=!0;
    c.src=r;
    var i=t.getElementsByTagName("script")[0];
    i.parentNode.insertBefore(c,i);
  };
})(window,document,"script",0,"kwaiq");

console.log('✅ [Kwai Pixel] Loader instalado (beforeInteractive)');
`,
        }}
      />

      {/* Kwai Pixel Init - Imediato após loader */}
      <Script
        id="kwai-pixel-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
(function() {
  var pixelId = '${pixelId}';
  var initialized = false;
  var attempts = 0;
  var maxAttempts = 20;
  
  function initPixel() {
    if (initialized) return;
    attempts++;
    
    try {
      if (!window.kwaiq || typeof window.kwaiq.load !== 'function') {
        if (attempts < maxAttempts) {
          setTimeout(initPixel, 200);
        } else {
          console.error('[Kwai Pixel] ❌ Loader não disponível após ' + maxAttempts + ' tentativas');
        }
        return;
      }
      
      console.log('[Kwai Pixel] 🚀 Carregando pixel ID:', pixelId);
      window.kwaiq.load(pixelId);
      
      // Aguardar SDK carregar e disparar pageview
      var pageAttempts = 0;
      var checkInterval = setInterval(function() {
        pageAttempts++;
        
        if (window.kwaiq && window.kwaiq.instance && typeof window.kwaiq.instance(pixelId).page === 'function') {
          console.log('[Kwai Pixel] ✅ SDK carregado com sucesso!');
          
          try {
            window.kwaiq.instance(pixelId).page();
            console.log('[Kwai Pixel] 📄 Evento pageview disparado');
          } catch (e) {
            console.warn('[Kwai Pixel] ⚠️ Erro ao disparar pageview:', e);
          }
          
          clearInterval(checkInterval);
          initialized = true;
        } else if (pageAttempts >= 30) {
          console.error('[Kwai Pixel] ❌ SDK não carregou após 30 tentativas');
          clearInterval(checkInterval);
        }
      }, 200);
      
    } catch (error) {
      console.error('[Kwai Pixel] ❌ Erro:', error);
    }
  }
  
  // Iniciar imediatamente
  initPixel();
})();
`,
        }}
      />
    </>
  )
}

