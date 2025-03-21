export default function InternalActivityTable({ role }) {
    console.log("InternalActivityTable-> " + role);
    return (
        <>
            <h1 className="text-2xl font-bold text-foreground">Bienvenido de nuevo!</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-card p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-bold text-primary-foreground">Actividad Reciente</h2>
                    <div className="mt-4">
                        <p className="text-sm text-muted-foreground">No hay actividad reciente.</p>
                    </div>
                </div>
                <div className="bg-card p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-bold text-primary-foreground">Resumen Mensual</h2>
                    <div className="mt-4">
                        <p className="text-sm text-muted-foreground">No hay resumen disponible.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
