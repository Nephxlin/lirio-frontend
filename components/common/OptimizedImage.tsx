'use client'

import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  className?: string
  priority?: boolean
  quality?: number
  onError?: () => void
}

/**
 * Componente otimizado de imagem que gerencia automaticamente
 * imagens locais vs externas (backend)
 */
export default function OptimizedImage({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  className = '',
  priority = false,
  quality = 85,
  onError,
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false)
  
  // Detectar se é imagem externa (do backend ou URL completa)
  const isExternalImage = src?.startsWith('http://') || 
                          src?.startsWith('https://') ||
                          src?.includes('/uploads/')

  // Placeholder padrão
  const placeholderSrc = '/placeholder-game.png'

  const handleError = () => {
    setImageError(true)
    onError?.()
  }

  // Se houver erro, mostrar placeholder
  if (imageError) {
    return (
      <Image
        src={placeholderSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        className={className}
        loading={priority ? undefined : 'lazy'}
        quality={quality}
      />
    )
  }

  // Para imagens externas do backend, usar unoptimized
  // Isso mantém lazy loading mas evita otimização que causa erro
  if (isExternalImage) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        className={className}
        loading={priority ? undefined : 'lazy'}
        unoptimized // Desabilita otimização apenas para imagens externas
        onError={handleError}
        quality={quality}
      />
    )
  }

  // Para imagens locais (em /public), usar otimização completa
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      sizes={sizes}
      className={className}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      quality={quality}
      onError={handleError}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCgAAAA/9k="
    />
  )
}

