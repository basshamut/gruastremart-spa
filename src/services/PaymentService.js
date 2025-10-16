/**
 * Servicio para manejar operaciones relacionadas con pagos
 */
class PaymentService {
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
     * Obtiene el ID del usuario del localStorage
     * @returns {string|null} ID del usuario
     */
    getUserId() {
        try {
            const userDetail = JSON.parse(localStorage.getItem("userDetail"));
            return userDetail?.id || null;
        } catch (error) {
            console.error('Error obteniendo ID del usuario:', error);
            return null;
        }
    }

    /**
     * Registra un pago para una solicitud de grúa
     * @param {Object} paymentData - Datos del pago
     * @param {string} paymentData.demandId - ID de la solicitud de grúa
     * @param {string} paymentData.mobilePaymentReference - Referencia del pago móvil
     * @param {File} paymentData.paymentImage - Imagen del comprobante de pago
     * @returns {Promise<Object>} Respuesta del servidor
     */
    async registerPayment(paymentData) {
        const token = this.getAuthToken();
        const userId = this.getUserId();

        if (!token) {
            throw new Error('No se encontró token de autenticación');
        }

        if (!userId) {
            throw new Error('No se encontró información del usuario');
        }

        // Crear FormData para enviar la imagen
        const formData = new FormData();
        formData.append('demandId', paymentData.demandId);
        formData.append('userId', userId);
        formData.append('mobilePaymentReference', paymentData.mobilePaymentReference);
        
        if (paymentData.paymentImage) {
            formData.append('paymentImage', paymentData.paymentImage);
        }

        try {
            const response = await fetch(`${this.apiDomain}/v1/payments/register`, {
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
            console.error('Error registrando pago:', error);
            throw error;
        }
    }

    /**
     * Obtiene el historial de pagos del usuario
     * @param {Object} options - Opciones de consulta
     * @param {number} options.page - Página (por defecto 0)
     * @param {number} options.size - Tamaño de página (por defecto 10)
     * @returns {Promise<Object>} Lista de pagos
     */
    async getPaymentHistory(options = {}) {
        const token = this.getAuthToken();
        const userId = this.getUserId();

        if (!token) {
            throw new Error('No se encontró token de autenticación');
        }

        if (!userId) {
            throw new Error('No se encontró información del usuario');
        }

        const { page = 0, size = 10 } = options;
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            userId
        });

        try {
            const response = await fetch(`${this.apiDomain}/v1/payments?${params.toString()}`, {
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
            console.error('Error obteniendo historial de pagos:', error);
            throw error;
        }
    }

    /**
     * Obtiene los detalles de un pago específico
     * @param {string} paymentId - ID del pago
     * @returns {Promise<Object>} Detalles del pago
     */
    async getPaymentDetails(paymentId) {
        const token = this.getAuthToken();

        if (!token) {
            throw new Error('No se encontró token de autenticación');
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
            console.error('Error obteniendo detalles del pago:', error);
            throw error;
        }
    }
}

// Exportar una instancia del servicio
export default new PaymentService();