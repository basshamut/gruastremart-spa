import { usePaginatedDemands } from "../hook/usePaginatedDemands";

export default function OperatorActivity() {
    const token = localStorage.getItem('jwt');
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;

    const {
        demands,
        loading,
        error,
        page,
        totalPages,
        pageSize,
        handlePageChange,
        handlePageSizeChange
    } = usePaginatedDemands(apiDomain, token);

    return (
        <>
            <h1 className="text-2xl font-bold text-foreground">Bienvenido de nuevo!</h1>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
                <div className="bg-card p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-bold text-primary-foreground">Actividad Reciente</h2>
                    <div className="mt-4">
                        {loading ? (
                            <p className="text-sm text-muted-foreground">Cargando...</p>
                        ) : error ? (
                            <p className="text-sm text-red-500">{error}</p>
                        ) : demands.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No hay actividad reciente.</p>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse mt-2">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="p-2">ID</th>
                                            <th className="p-2">Descripción</th>
                                            <th className="p-2">Usuario</th>
                                            <th className="p-2">Fecha</th>
                                            <th className="p-2">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {demands.map(demand => (
                                            <tr key={demand.id} className="border-b">
                                                <td className="p-2">{demand.id}</td>
                                                <td className="p-2">{demand.description}</td>
                                                <td className="p-2">{demand.userId}</td>
                                                <td className="p-2">{new Date(demand.dueDate).toLocaleDateString()}</td>
                                                <td className="p-2">{demand.state}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                </div>
                                <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-2">
                                    <button
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={page === 0}
                                        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
                                        Anterior
                                    </button>
                                    <span>Página {page + 1} de {totalPages}</span>
                                    <button
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={page >= totalPages - 1}
                                        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
                                        Siguiente
                                    </button>
                                    <select value={pageSize} onChange={handlePageSizeChange} className="p-2 border rounded">
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
