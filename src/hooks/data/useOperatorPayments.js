import { useState, useEffect } from 'react';
import PaymentService from '../../services/PaymentService.js';

/**
 * Hook personalizado para obtener los pagos de un operador
 * @param {string} operatorId - ID del operador
 * @param {string} status - Estado del pago (opcional: PENDING, VERIFIED, REJECTED)
 * @param {number} refreshTrigger - Trigger para refrescar los datos
 * @param {number} pageSize - Tamaño de página (por defecto 10)
 * @returns {Object} Objeto con pagos, estado de carga, error y funciones de paginación
 */
export function useOperatorPayments(operatorId, status = null, refreshTrigger = 0, pageSize = 10) {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const fetchPayments = async () => {
        if (!operatorId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await PaymentService.getOperatorPayments(operatorId, {
                status,
                page,
                size: pageSize
            });

            setPayments(result.content || []);
            setTotalPages(result.totalPages || 0);
            setTotalElements(result.totalElements || 0);
        } catch (err) {
            console.error('Error obteniendo pagos del operador:', err);
            setError(err.message || 'Error al obtener los pagos');
            setPayments([]);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [operatorId, status, page, pageSize, refreshTrigger]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handlePageSizeChange = (newPageSize) => {
        setPage(0);
    };

    const refresh = () => {
        fetchPayments();
    };

    return {
        payments,
        loading,
        error,
        page,
        totalPages,
        totalElements,
        pageSize,
        handlePageChange,
        handlePageSizeChange,
        refresh
    };
}
