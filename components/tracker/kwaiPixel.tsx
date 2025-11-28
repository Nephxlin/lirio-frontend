'use client'

import { useEffect } from 'react'
import Script from 'next/script'

interface KwaiPixelProps {
  pixelId?: string
}

// Declaração global do Kwai Analytics
declare global {
  interface Window {
    kwaiq: any
    KwaiAnalyticsObject: string
  }
}

export function KwaiPixel({ pixelId: propPixelId }: KwaiPixelProps) {
  useEffect(() => {
    // Salvar parâmetros da URL
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    const urlPixelId = params.get('kwai_pixel') || params.get('pixel_id') || params.get('kpid')
    const clickid = params.get('clickid') || params.get('kwai_clickid')
    const mmpcode = params.get('mmpcode') || params.get('kwai_mmpcode') || 'PL'

    // Salvar no sessionStorage
    if (urlPixelId) sessionStorage.setItem('kwai_pixel_id', urlPixelId)
    if (clickid) sessionStorage.setItem('kwai_clickid', clickid)
    if (mmpcode) sessionStorage.setItem('kwai_mmpcode', mmpcode)
  }, [propPixelId])

  return (
    <>
      {/* Script Loader Base do Kwai */}
      <Script
        id="kwai-pixel-loader"
        strategy="afterInteractive"
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

console.log('✅ [Kwai Pixel] Loader instalado');
          `,
        }}
      />

      {/* Script de Inicialização */}
      <Script
        id="kwai-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
(function() {
  var initialized = false;
  var attempts = 0;
  var maxAttempts = 10;
  
  function initPixel() {
    if (initialized) return;
    
    attempts++;
    
    try {
      // Obter pixel ID
      var pixelId = sessionStorage.getItem('kwai_pixel_id') || '${propPixelId || ''}';
      
      if (!pixelId) {
        var urlParams = new URLSearchParams(window.location.search);
        pixelId = urlParams.get('kwai_pixel') || urlParams.get('pixel_id') || urlParams.get('kpid');
        if (pixelId) {
          sessionStorage.setItem('kwai_pixel_id', pixelId);
        }
      }
      
      if (!pixelId) {
        console.warn('[Kwai Pixel] ⚠️ Nenhum pixel ID fornecido');
        return;
      }
      
      // Verificar se kwaiq existe
      if (!window.kwaiq || typeof window.kwaiq.load !== 'function') {
        if (attempts < maxAttempts) {
          console.log('[Kwai Pixel] 🔄 Tentativa ' + attempts + '/' + maxAttempts + ' - aguardando loader...');
          setTimeout(initPixel, 500);
        } else {
          console.error('[Kwai Pixel] ❌ Loader não disponível após ' + maxAttempts + ' tentativas');
        }
        return;
      }
      
      // Carregar o pixel
      console.log('[Kwai Pixel] 🚀 Carregando pixel ID:', pixelId);
      window.kwaiq.load(pixelId);
      
      // Aguardar SDK carregar e disparar pageview
      var pageAttempts = 0;
      var checkInterval = setInterval(function() {
        pageAttempts++;
        
        if (window.kwaiq && window.kwaiq.instance && typeof window.kwaiq.instance(pixelId).page === 'function') {
          console.log('[Kwai Pixel] ✅ SDK carregado com sucesso!');
          
          // Disparar pageview inicial
          try {
            window.kwaiq.instance(pixelId).page();
            console.log('[Kwai Pixel] 📄 Evento pageview disparado');
          } catch (e) {
            console.warn('[Kwai Pixel] ⚠️ Erro ao disparar pageview:', e);
          }
          
          clearInterval(checkInterval);
          initialized = true;
        } else if (pageAttempts >= 20) {
          console.error('[Kwai Pixel] ❌ SDK não carregou após 20 tentativas');
          clearInterval(checkInterval);
        } else {
          console.log('[Kwai Pixel] ⏳ Aguardando SDK... (' + pageAttempts + '/20)');
        }
      }, 500);
      
    } catch (error) {
      console.error('[Kwai Pixel] ❌ Erro:', error);
    }
  }
  
  // Iniciar quando página carregar
  if (document.readyState === 'complete') {
    setTimeout(initPixel, 100);
  } else {
    window.addEventListener('load', function() {
      setTimeout(initPixel, 100);
    });
  }
})();
          `,
        }}
      />
    </>
  )
}

export default KwaiPixel
