import Toast from './Toast';

/**
 * Contenedor para mostrar múltiples notificaciones toast
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.toasts - Array de objetos toast
 * @param {function} props.onRemoveToast - Función para remover un toast
 */
export default function ToastContainer({ toasts = [], onRemoveToast }) {
    if (!toasts.length) return null;

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    isVisible={toast.isVisible}
                    duration={toast.duration}
                    onClose={() => onRemoveToast(toast.id)}
                />
            ))}
        </div>
    );
}
