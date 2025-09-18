import { useState, useCallback } from 'react';

/**
 * Hook personalizado para manejar notificaciones toast
 * @returns {Object} Objeto con funciones y estado para manejar toasts
 */
export function useToast() {
    const [toasts, setToasts] = useState([]);

    /**
     * Mostrar una notificación toast
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duración en milisegundos (default: 4000)
     */
    const showToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        const newToast = {
            id,
            message,
            type,
            duration,
            isVisible: true
        };

        setToasts(prev => [...prev, newToast]);

        // Auto-remove después de la duración + tiempo de animación
        setTimeout(() => {
            removeToast(id);
        }, duration + 500);
    }, []);

    /**
     * Remover un toast específico
     * @param {number} id - ID del toast a remover
     */
    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    /**
     * Limpiar todos los toasts
     */
    const clearToasts = useCallback(() => {
        setToasts([]);
    }, []);

    /**
     * Funciones de conveniencia para diferentes tipos
     */
    const showSuccess = useCallback((message, duration) => {
        showToast(message, 'success', duration);
    }, [showToast]);

    const showError = useCallback((message, duration) => {
        showToast(message, 'error', duration);
    }, [showToast]);

    const showWarning = useCallback((message, duration) => {
        showToast(message, 'warning', duration);
    }, [showToast]);

    const showInfo = useCallback((message, duration) => {
        showToast(message, 'info', duration);
    }, [showToast]);

    return {
        toasts,
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeToast,
        clearToasts
    };
}
