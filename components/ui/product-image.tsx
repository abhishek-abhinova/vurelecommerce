"use client"

import Image from "next/image"

interface ProductImageProps {
    src: string
    alt: string
    fill?: boolean
    width?: number
    height?: number
    className?: string
    priority?: boolean
}

export function ProductImage({ src, alt, fill, width, height, className = "", priority = false }: ProductImageProps) {
    return (
        <div className={`relative ${fill ? 'w-full h-full' : ''}`}>
            <Image
                src={src || "/placeholder.svg"}
                alt={alt}
                fill={fill}
                width={!fill ? width : undefined}
                height={!fill ? height : undefined}
                className={className}
                priority={priority}
            />
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-white/20 text-xs sm:text-sm font-bold tracking-widest uppercase select-none"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                    Vurel
                </span>
            </div>
        </div>
    )
}
