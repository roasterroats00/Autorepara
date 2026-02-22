'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'autorepara_favorites';

export function useFavorites() {
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load favorites from localStorage on mount and listen for changes
    useEffect(() => {
        const loadFavorites = () => {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    setFavorites(JSON.parse(stored));
                }
            } catch (e) {
                console.error('Error loading favorites:', e);
            }
            setIsLoaded(true);
        };

        loadFavorites();

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                loadFavorites();
            }
        };

        const handleCustomEvent = () => loadFavorites();

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('favorites-updated', handleCustomEvent);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('favorites-updated', handleCustomEvent);
        };
    }, []);

    const updateAndNotify = useCallback((newFavorites: string[]) => {
        setFavorites(newFavorites);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
            window.dispatchEvent(new Event('favorites-updated'));
        } catch (e) {
            console.error('Error saving favorites:', e);
        }
    }, []);

    const addFavorite = useCallback((workshopId: string) => {
        setFavorites(prev => {
            if (prev.includes(workshopId)) return prev;
            const newVal = [...prev, workshopId];
            updateAndNotify(newVal);
            return newVal;
        });
    }, [updateAndNotify]);

    const removeFavorite = useCallback((workshopId: string) => {
        setFavorites(prev => {
            const newVal = prev.filter(id => id !== workshopId);
            updateAndNotify(newVal);
            return newVal;
        });
    }, [updateAndNotify]);

    const toggleFavorite = useCallback((workshopId: string) => {
        setFavorites(prev => {
            let newVal;
            if (prev.includes(workshopId)) {
                newVal = prev.filter(id => id !== workshopId);
            } else {
                newVal = [...prev, workshopId];
            }
            updateAndNotify(newVal);
            return newVal;
        });
    }, [updateAndNotify]);

    // Remove the useEffect that saves to localStorage since we do it in updateAndNotify
    // to avoid infinite loops with the event listener
    const isFavorite = useCallback((workshopId: string) => {
        return favorites.includes(workshopId);
    }, [favorites]);

    return {
        favorites,
        isLoaded,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
        count: favorites.length,
    };
}
