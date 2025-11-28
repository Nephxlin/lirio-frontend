'use client'

import { useEffect } from 'react'
import Script from 'next/script'

/**
 * Loader base do Kwai Pixel - Sempre presente no <head>
 * Inicializa o SDK e aguarda o Pixel ID ser definido
 */
export function KwaiPixelLoader() {
  return (
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
  
  // Flag para indicar que loader está pronto
  e[s]._loaderReady = true;
  console.log('✅ [Kwai Pixel] Loader instalado (beforeInteractive)');
})(window,document,"script",0,"kwaiq");
`,
      }}
    />
  )
}

/**
 * Inicializador do Kwai Pixel
 * Busca o Pixel ID da API e inicializa o SDK
 */
export function KwaiPixelInit() {
  useEffect(() => {
    // Função para buscar pixel ID da API
    const fetchAndInitPixel = async () => {
      try {
        // 1. Verificar se tem na URL (prioridade para testes)
        const urlParams = new URLSearchParams(window.location.search)
        const urlPixelId = urlParams.get('kpid') || urlParams.get('kwai_pixel') || urlParams.get('pixel_id')
        
        if (urlPixelId) {
          console.log('[Kwai Pixel] 🎯 Usando Pixel ID da URL:', urlPixelId)
          initializePixel(urlPixelId)
          return
        }

        // 2. Verificar se tem no sessionStorage (cache)
        const cachedPixelId = sessionStorage.getItem('kwai_pixel_id')
        if (cachedPixelId) {
          console.log('[Kwai Pixel] 📦 Usando Pixel ID do cache:', cachedPixelId)
          initializePixel(cachedPixelId)
          return
        }

        // 3. Buscar da API
        console.log('[Kwai Pixel] 🔄 Buscando Pixel ID da API...')
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'
        const response = await fetch(`${apiUrl}/api/settings/kwai-pixels`)
        const data = await response.json()

        if (data.status && data.data && data.data.length > 0) {
          const pixel = data.data[0]
          const pixelId = pixel.pixelId
          
          console.log('[Kwai Pixel] ✅ Pixel ID da API:', pixelId)
          
          // Salvar no cache
          sessionStorage.setItem('kwai_pixel_id', pixelId)
          
          // Inicializar
          initializePixel(pixelId)
        } else {
          console.warn('[Kwai Pixel] ⚠️ Nenhum pixel configurado na API')
          console.warn('[Kwai Pixel] 💡 Configure em: /dashboard/kwai-pixels')
        }
      } catch (error) {
        console.error('[Kwai Pixel] ❌ Erro ao buscar Pixel ID:', error)
        
        // Tentar usar cache como fallback
        const cachedPixelId = sessionStorage.getItem('kwai_pixel_id')
        if (cachedPixelId) {
          console.log('[Kwai Pixel] 📦 Usando cache após erro:', cachedPixelId)
          initializePixel(cachedPixelId)
        }
      }
    }

    // Função para inicializar o pixel
    const initializePixel = (pixelId: string) => {
      let attempts = 0
      const maxAttempts = 30
      
      const tryInit = () => {
        attempts++
        
        if (typeof window.kwaiq === 'undefined') {
          if (attempts < maxAttempts) {
            setTimeout(tryInit, 200)
          } else {
            console.error('[Kwai Pixel] ❌ SDK não carregou após', maxAttempts, 'tentativas')
          }
          return
        }

        if (typeof window.kwaiq.load !== 'function') {
          if (attempts < maxAttempts) {
            setTimeout(tryInit, 200)
          }
          return
        }

        // Carregar o pixel
        console.log('[Kwai Pixel] 🚀 Carregando pixel ID:', pixelId)
        window.kwaiq.load(pixelId)

        // Aguardar SDK carregar e disparar pageview
        let pageAttempts = 0
        const checkInterval = setInterval(() => {
          pageAttempts++
          
          try {
            if (window.kwaiq && window.kwaiq.instance && typeof window.kwaiq.instance(pixelId).page === 'function') {
              console.log('[Kwai Pixel] ✅ SDK carregado com sucesso!')
              
              window.kwaiq.instance(pixelId).page()
              console.log('[Kwai Pixel] 📄 Evento pageview disparado')
              
              clearInterval(checkInterval)
            } else if (pageAttempts >= 40) {
              console.error('[Kwai Pixel] ❌ SDK instance não disponível após 40 tentativas')
              clearInterval(checkInterval)
            }
          } catch (error) {
            console.error('[Kwai Pixel] ❌ Erro ao disparar pageview:', error)
            clearInterval(checkInterval)
          }
        }, 200)
      }

      tryInit()
    }

    // Buscar e inicializar
    fetchAndInitPixel()

    // Salvar clickid e mmpcode da URL
    const urlParams = new URLSearchParams(window.location.search)
    const clickid = urlParams.get('clickid') || urlParams.get('kwai_clickid')
    const mmpcode = urlParams.get('mmpcode') || urlParams.get('kwai_mmpcode') || 'PL'

    if (clickid) sessionStorage.setItem('kwai_clickid', clickid)
    if (mmpcode) sessionStorage.setItem('kwai_mmpcode', mmpcode)
  }, [])

  return null
}

