/**
 * Servicio para manejar pagos pre-servicio (pago antes de crear la solicitud)
 */
class PreServicePaymentService {
    constructor() {
        this.apiDomain = import.meta.env.VITE_API_DOMAIN_URL;
    }

    /**
     * Obtiene el token de autenticación del localStorage
     * @returns {string|null} Token de autenticación
     */
    getAuthToken() {
        try {
            const authData = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM));
            return authData?.access_token || null;
        } catch (error) {
            console.error('Error obteniendo token de autenticación:', error);
            return null;
        }
    }

    /**
     * Envía un pago pre-servicio con los datos de la solicitud
     * @param {string} userId - ID del usuario
     * @param {Object} paymentData - Datos del pago
     * @param {string} paymentData.reference - Referencia de Pago Móvil
     * @param {number} paymentData.amount - Monto pagado
     * @param {File} paymentData.image - Imagen del comprobante
     * @param {Object} demandData - Datos completos de la solicitud de grúa
     * @returns {Promise<Object>} Respuesta del servidor con el pago creado
     */
    async submitPreServicePayment(userId, paymentData, demandData) {
        const token = this.getAuthToken();

        if (!token) {
            throw new Error('No se encontró token de autenticación');
        }

        if (!userId) {
            throw new Error('El ID de usuario es requerido');
        }

        if (!paymentData || !paymentData.reference || !paymentData.image || !paymentData.amount) {
            throw new Error('Datos de pago incompletos');
        }

        if (!demandData) {
            throw new Error('Datos de la solicitud son requeridos');
        }

        // Crear FormData para enviar la imagen y datos
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('mobilePaymentReference', paymentData.reference);
        formData.append('amount', paymentData.amount.toString());
        formData.append('paymentImage', paymentData.image);

        // Serializar demandData como JSON
        formData.append('demandData', JSON.stringify(demandData));

        try {
            const response = await fetch(`${this.apiDomain}/v1/payments/submit-pre-service`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // No establecer Content-Type para FormData, el navegador lo hará automáticamente
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error enviando pago pre-servicio:', error);
            throw error;
        }
    }

    /**
     * Obtiene el estado de un pago
     * @param {string} paymentId - ID del pago
     * @returns {Promise<Object>} Detalles del pago
     */
    async getPaymentStatus(paymentId) {
        const token = this.getAuthToken();

        if (!token) {
            throw new Error('No se encontró token de autenticación');
        }

        if (!paymentId) {
            throw new Error('El ID del pago es requerido');
        }

        try {
            const response = await fetch(`${this.apiDomain}/v1/payments/${paymentId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error obteniendo estado del pago:', error);
            throw error;
        }
    }
}

// Exportar una instancia del servicio
export default new PreServicePaymentService();
