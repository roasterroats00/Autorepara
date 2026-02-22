'use client';

import { useFavorites } from '@/hooks/useFavorites';

interface FavoriteButtonProps {
    workshopId: string;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    locale?: string;
}

export default function FavoriteButton({
    workshopId,
    size = 'md',
    showLabel = false,
    locale = 'en'
}: FavoriteButtonProps) {
    const { isFavorite, toggleFavorite, isLoaded } = useFavorites();
    const liked = isFavorite(workshopId);

    const sizeClasses = {
        sm: 'w-8 h-8 text-lg',
        md: 'w-10 h-10 text-xl',
        lg: 'w-12 h-12 text-2xl',
    };

    const labels = {
        add: locale === 'es' ? 'Guardar' : 'Save',
        remove: locale === 'es' ? 'Guardado' : 'Saved',
    };

    if (!isLoaded) {
        return (
            <button
                disabled
                className={`${sizeClasses[size]} rounded-full bg-mf-card/80 backdrop-blur-sm flex items-center justify-center transition-all`}
            >
                <span className="material-symbols-outlined text-gray-500">favorite</span>
            </button>
        );
    }

    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(workshopId);
            }}
            className={`${showLabel ? 'px-4 py-2 rounded-lg' : `${sizeClasses[size]} rounded-full`} ${liked
                    ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                    : 'bg-mf-card/80 backdrop-blur-sm text-gray-400 hover:text-red-400 hover:bg-mf-card'
                } flex items-center justify-center gap-2 transition-all`}
            title={liked ? labels.remove : labels.add}
        >
            <span
                className={`material-symbols-outlined ${showLabel ? 'text-lg' : ''}`}
                style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}
            >
                favorite
            </span>
            {showLabel && (
                <span className="text-sm font-medium">
                    {liked ? labels.remove : labels.add}
                </span>
            )}
        </button>
    );
}
