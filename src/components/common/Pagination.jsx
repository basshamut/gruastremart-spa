// components/Pagination.jsx
export default function Pagination({
    page,
    totalPages,
    pageSize,
    onPageChange,
    onPageSizeChange
}) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-2">
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
                Anterior
            </button>
            <span>Página {page + 1} de {totalPages}</span>
            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
                Siguiente
            </button>
            <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(e.target.value)}
                className="p-2 border rounded"
            >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
            </select>
        </div>
    );
}
