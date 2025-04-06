export default function Pagination({
                                       page,
                                       totalPages,
                                       pageSize,
                                       onPageChange,
                                       onPageSizeChange
                                   }) {

    const safePage = isNaN(page) ? 0 : page;
    const isPrevDisabled = safePage <= 0;

    let isNextDisabled = true;
    if (totalPages) {
        isNextDisabled = safePage >= totalPages - 1 || totalPages < 1;
    }

    return (
        <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-2">
            <button
                onClick={() => onPageChange(safePage - 1)}
                disabled={isPrevDisabled}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
                Anterior
            </button>
            <span>Página {safePage + 1} de {totalPages}</span>
            <button
                onClick={() => onPageChange(safePage + 1)}
                disabled={isNextDisabled}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
                Siguiente
            </button>
            <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="p-2 border rounded"
            >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
            </select>
        </div>
    );
}
