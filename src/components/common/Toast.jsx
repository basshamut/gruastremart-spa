import { useState, useEffect } from 'react';

/**
 * Componente Toast para mostrar notificaciones elegantes
 * @param {Object} props - Propiedades del componente
 * @param {string} props.message - Mensaje a mostrar
 * @param {string} props.type - Tipo de notificación: 'success', 'error', 'warning', 'info'
 * @param {boolean} props.isVisible - Si la notificación está visible
 * @param {function} props.onClose - Función a ejecutar al cerrar
 * @param {number} props.duration - Duración en milisegundos (default: 4000)
 */
export default function Toast({ 
    message, 
    type = 'info', 
    isVisible = false, 
    onClose, 
    duration = 4000 
}) {
    const [show, setShow] = useState(isVisible);

    useEffect(() => {
        setShow(isVisible);
    }, [isVisible]);

    useEffect(() => {
        if (show && duration > 0) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [show, duration]);

    const handleClose = () => {
        setShow(false);
        setTimeout(() => {
            if (onClose) onClose();
        }, 300); // Esperar a que termine la animación
    };

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-50 border-green-200',
                    text: 'text-green-800',
                    icon: '✅',
                    iconBg: 'bg-green-100'
                };
            case 'error':
                return {
                    bg: 'bg-red-50 border-red-200',
                    text: 'text-red-800',
                    icon: '❌',
                    iconBg: 'bg-red-100'
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-50 border-yellow-200',
                    text: 'text-yellow-800',
                    icon: '⚠️',
                    iconBg: 'bg-yellow-100'
                };
            case 'info':
            default:
                return {
                    bg: 'bg-blue-50 border-blue-200',
                    text: 'text-blue-800',
                    icon: 'ℹ️',
                    iconBg: 'bg-blue-100'
                };
        }
    };

    const styles = getTypeStyles();

    if (!show) return null;

    return (
        <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out ${
            show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
            <div className={`max-w-sm w-full ${styles.bg} border rounded-lg shadow-lg p-4`}>
                <div className="flex items-start">
                    <div className={`flex-shrink-0 ${styles.iconBg} rounded-full w-8 h-8 flex items-center justify-center mr-3`}>
                        <span className="text-sm">{styles.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${styles.text}`}>
                            {message}
                        </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                        <button
                            onClick={handleClose}
                            className={`inline-flex ${styles.text} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-gray-400`}
                        >
                            <span className="sr-only">Cerrar</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
