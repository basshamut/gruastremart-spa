import { useState, useEffect } from 'react';
import { useAutoRefresh } from '../hooks/data/useAutoRefresh';
import { useOperatorPayments } from '../hooks/data/useOperatorPayments';
import PaymentVerificationModal from '../components/common/PaymentVerificationModal';
import PaymentService from '../services/PaymentService.js';
import { useToast } from '../hooks/common/useToast.js';
import { getUsersWithFilters } from '../services/UserService.js';
import { Clock, CheckCircle, XCircle, AlertCircle, ClipboardCheck, Filter, ChevronDown } from 'lucide-react';

export default function OperatorPaymentsActivity() {
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [verificationModalOpen, setVerificationModalOpen] = useState(false);
    const [verificationLoading, setVerificationLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('pending');
    const [selectedOperator, setSelectedOperator] = useState(null);
    const [operators, setOperators] = useState([]);
    const [operatorsLoading, setOperatorsLoading] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const userDetail = JSON.parse(localStorage.getItem("userDetail")) || {};
    const operatorId = userDetail?.id;
    const userName = userDetail?.name;
    const userRole = userDetail?.role;
    const isAdmin = userRole === 'ADMIN';
    const { toasts, showSuccess, showError, removeToast } = useToast();

    // Cargar operadores si es admin
    useEffect(() => {
        if (isAdmin) {
            loadOperators();
        }
    }, [isAdmin]);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownOpen && !event.target.closest('#operatorFilter')) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

    const loadOperators = async () => {
        setOperatorsLoading(true);
        try {
            const result = await getUsersWithFilters({ role: 'OPERATOR', page: 0, size: 100 });
            if (result && result.content) {
                setOperators(result.content);
            }
        } catch (error) {
            console.error('Error cargando operadores:', error);
            showError('Error al cargar la lista de operadores');
        } finally {
            setOperatorsLoading(false);
        }
    };

    const { refreshTrigger } = useAutoRefresh(30);

    const {
        payments,
        loading,
        error,
        page,
        totalPages,
        totalElements,
        handlePageChange
    } = useOperatorPayments(
        isAdmin ? selectedOperator : operatorId,  // Si es admin usa el seleccionado, si no usa su propio ID
        activeTab === 'pending' ? 'PENDING' : activeTab === 'verified' ? 'VERIFIED' : 'REJECTED',
        refreshTrigger,
        10
    );

    const openVerificationModal = (payment) => {
        setSelectedPayment(payment);
        setVerificationModalOpen(true);
    };

    const closeVerificationModal = () => {
        setSelectedPayment(null);
        setVerificationModalOpen(false);
    };

    const handleVerifyPayment = async (verificationData) => {
        if (!selectedPayment) return;

        setVerificationLoading(true);

        try {
            const result = await PaymentService.verifyPayment(
                selectedPayment.id,
                verificationData
            );

            if (result.data) {
                const isVerified = verificationData.status === 'VERIFIED';
                showSuccess(
                    isVerified
                        ? 'Pago aprobado exitosamente'
                        : 'Pago rechazado exitosamente'
                );
                closeVerificationModal();
            } else {
                showError(result.message || 'Error al procesar el pago');
            }
        } catch (error) {
            console.error('Error verificando pago:', error);
            showError('Error al procesar el pago: ' + error.message);
        } finally {
            setVerificationLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            PENDING: {
                text: 'Pendiente',
                class: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                icon: <Clock className="w-4 h-4 mr-1" />
            },
            VERIFIED: {
                text: 'Aprobado',
                class: 'bg-green-100 text-green-800 border-green-300',
                icon: <CheckCircle className="w-4 h-4 mr-1" />
            },
            REJECTED: {
                text: 'Rechazado',
                class: 'bg-red-100 text-red-800 border-red-300',
                icon: <XCircle className="w-4 h-4 mr-1" />
            }
        };
        const badge = badges[status] || {
            text: status,
            class: 'bg-gray-100 text-gray-800 border-gray-300',
            icon: <AlertCircle className="w-4 h-4 mr-1" />
        };
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${badge.class}`}>
                {badge.icon}
                {badge.text}
            </span>
        );
    };

    const getTabCount = (status) => {
        // Para obtener el conteo real, necesitamos hacer otra llamada.
        // Por ahora, mostramos un indicador de carga o el número actual
        if (loading) return '...';
        return activeTab === status ? totalElements : '-';
    };

    return (
        <>
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-foreground">Gestión de Pagos</h1>
                <p className="text-gray-600 mt-1">
                    Bienvenido de nuevo, {userName}!
                    {isAdmin && selectedOperator && (() => {
                        const operator = operators.find(op => op.id === selectedOperator);
                        return operator ? ` Viendo pagos de: ${operator.name}` : '';
                    })()}
                    {isAdmin && !selectedOperator && ' Viendo todos los pagos'}
                </p>
            </div>

            {/* Filtro por operador - Solo para ADMIN */}
            {isAdmin && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Filter className="w-5 h-5 text-gray-600" />
                            <label htmlFor="operatorFilter" className="text-sm font-medium text-gray-700">
                                Filtrar por operador:
                            </label>
                        </div>
                        <div className="relative flex-1">
                            <button
                                id="operatorFilter"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left bg-white flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={operatorsLoading}
                            >
                                <span className={selectedOperator ? 'text-gray-900' : 'text-gray-500'}>
                                    {operatorsLoading ? 'Cargando operadores...' :
                                        selectedOperator ? (() => {
                                            const operator = operators.find(op => op.id === selectedOperator);
                                            return operator ? `${operator.name} (${operator.email})` : 'Seleccionar operador';
                                        })() : 'Todos los operadores'}
                                </span>
                                <ChevronDown className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" />
                            </button>

                            {/* Dropdown de opciones */}
                            {dropdownOpen && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                                    {/* Opción "Todos" */}
                                    <button
                                        onClick={() => {
                                            setSelectedOperator(null);
                                            setDropdownOpen(false);
                                        }}
                                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 ${!selectedOperator ? 'bg-blue-50' : ''}`}
                                    >
                                        <div>
                                            <div className="font-medium text-sm text-gray-900">
                                                Todos los operadores
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Ver pagos de todos los operadores
                                            </div>
                                        </div>
                                    </button>

                                    {/* Opciones de operadores individuales */}
                                    {operators.length === 0 && !operatorsLoading && (
                                        <div className="px-4 py-8 text-center text-sm text-gray-500">
                                            No hay operadores disponibles
                                        </div>
                                    )}
                                    {operators.map((operator) => (
                                        <button
                                            key={operator.id}
                                            onClick={() => {
                                                setSelectedOperator(operator.id);
                                                setDropdownOpen(false);
                                            }}
                                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-t border-gray-100 ${selectedOperator === operator.id ? 'bg-blue-50' : ''}`}
                                        >
                                            <div className="flex-1">
                                                <div className="font-medium text-sm text-gray-900">
                                                    {operator.name}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {operator.email}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Panel de estadísticas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-800 font-medium">Pagos Pendientes</p>
                            <p className="text-2xl font-bold text-yellow-900 mt-1">
                                {loading ? '...' : getTabCount('pending')}
                            </p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-500" />
                    </div>
                </div>
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-800 font-medium">Pagos Aprobados Hoy</p>
                            <p className="text-2xl font-bold text-green-900 mt-1">
                                {loading ? '...' : getTabCount('verified')}
                            </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-800 font-medium">Pagos Rechazados Hoy</p>
                            <p className="text-2xl font-bold text-red-900 mt-1">
                                {loading ? '...' : getTabCount('rejected')}
                            </p>
                        </div>
                        <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                </div>
            </div>

            {/* Panel de tabs */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-4" aria-label="Tabs">
                        <button
                            onClick={() => {
                                setActiveTab('pending');
                            }}
                            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                                activeTab === 'pending'
                                    ? 'border-yellow-500 text-yellow-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Clock className="w-4 h-4 mr-2" />
                            Pendientes
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                activeTab === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                                {loading ? '...' : totalElements}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('verified')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                                activeTab === 'verified'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aprobados
                        </button>
                        <button
                            onClick={() => setActiveTab('rejected')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                                activeTab === 'rejected'
                                    ? 'border-red-500 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rechazados
                        </button>
                    </nav>
                </div>

                {/* Lista de pagos */}
                <div className="p-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                            <p className="text-sm text-gray-500">Cargando pagos...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <p className="text-sm text-red-500 mb-2">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                                Reintentar
                            </button>
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-2">📋</div>
                            <p className="text-sm text-muted-foreground">
                                No hay pagos {activeTab === 'pending' ? 'pendientes' :
                                activeTab === 'verified' ? 'aprobados' : 'rechazados'} disponibles.
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Los nuevos pagos aparecerán aquí automáticamente.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {payments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
                                    onClick={() => openVerificationModal(payment)}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                {getStatusBadge(payment.status)}
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-600">Referencia:</span>
                                                    <p className="font-mono text-xs">{payment.mobilePaymentReference}</p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600">Monto:</span>
                                                    <p className="text-green-700 font-semibold">
                                                        ${payment.amount?.toFixed(2) || '0.00'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600">Fecha:</span>
                                                    <p className="text-gray-700">
                                                        {new Date(payment.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            {payment.demandCarType && (
                                                <div className="mt-2">
                                                    <span className="font-medium text-gray-600">Vehículo:</span>
                                                    <span className="text-gray-800 ml-1">{payment.demandCarType}</span>
                                                </div>
                                            )}
                                            {payment.verificationComments && payment.status !== 'PENDING' && (
                                                <div className={`mt-2 p-2 rounded text-xs ${
                                                    payment.status === 'VERIFIED' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                                }`}>
                                                    <span className="font-medium">Comentarios:</span> {payment.verificationComments}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2 ml-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openVerificationModal(payment);
                                                }}
                                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition-colors"
                                            >
                                                {payment.status === 'PENDING' ? 'Verificar' : 'Ver detalles'}
                                            </button>
                                            {payment.status === 'PENDING' && (
                                                <div className="text-xs text-orange-600 text-center">
                                                    ⏳ Pendiente
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center">
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 0}
                            className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-gray-600">
                            Página {page + 1} de {totalPages}
                        </span>
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page >= totalPages - 1}
                            className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>

            {/* Modal de verificación */}
            {verificationModalOpen && selectedPayment && (
                <PaymentVerificationModal
                    isOpen={verificationModalOpen}
                    onClose={closeVerificationModal}
                    onVerify={handleVerifyPayment}
                    paymentData={selectedPayment}
                    isLoading={verificationLoading}
                />
            )}
        </>
    );
}
