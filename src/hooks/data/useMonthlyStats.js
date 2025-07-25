import { useEffect, useState } from "react";

export function useMonthlyStats() {
    const [stats, setStats] = useState({
        totalRequests: 0,
        activeRequests: 0,
        takenRequests: 0,
        completedRequests: 0,
        cancelledRequests: 0,
        completionRate: 0,
        dailyAverage: 0,
        monthlyTrend: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_SUPABASE_LOCAL_STORAGE_ITEM))?.access_token;
    const apiDomain = import.meta.env.VITE_API_DOMAIN_URL;

    useEffect(() => {
        const fetchMonthlyStats = async () => {
            setLoading(true);
            try {
                // Obtener fecha actual y del mes anterior
                const now = new Date();
                const currentMonth = now.getMonth() + 1;
                const currentYear = now.getFullYear();

                // Formatear fechas como YYYY-MM-DD
                const startOfMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
                const daysInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate();
                const endOfMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${daysInCurrentMonth.toString().padStart(2, '0')}`;

                // Fecha del mes anterior para comparar tendencia
                const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
                const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
                const daysInPreviousMonth = new Date(previousYear, previousMonth, 0).getDate();
                const startOfPreviousMonth = `${previousYear}-${previousMonth.toString().padStart(2, '0')}-01`;
                const endOfPreviousMonth = `${previousYear}-${previousMonth.toString().padStart(2, '0')}-${daysInPreviousMonth.toString().padStart(2, '0')}`;

                // Realizar llamadas para obtener datos del mes actual
                const [activeRes, takenRes, completedRes, cancelledRes] = await Promise.all([
                    fetch(`${apiDomain}/v1/crane-demands?state=ACTIVE&startDate=${startOfMonth}&endDate=${endOfMonth}&page=0&size=1000`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    }),
                    fetch(`${apiDomain}/v1/crane-demands?state=TAKEN&startDate=${startOfMonth}&endDate=${endOfMonth}&page=0&size=1000`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    }),
                    fetch(`${apiDomain}/v1/crane-demands?state=COMPLETED&startDate=${startOfMonth}&endDate=${endOfMonth}&page=0&size=1000`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    }),
                    fetch(`${apiDomain}/v1/crane-demands?state=CANCELLED&startDate=${startOfMonth}&endDate=${endOfMonth}&page=0&size=1000`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    })
                ]);

                const [activeData, takenData, completedData, cancelledData] = await Promise.all([
                    activeRes.json(),
                    takenRes.json(),
                    completedRes.json(),
                    cancelledRes.json()
                ]);

                // Obtener datos del mes anterior para calcular tendencia
                const previousMonthRes = await fetch(
                    `${apiDomain}/v1/crane-demands?startDate=${startOfPreviousMonth}&endDate=${endOfPreviousMonth}&page=0&size=1000`,
                    { headers: { "Authorization": `Bearer ${token}` } }
                );
                const previousMonthData = await previousMonthRes.json();

                // Calcular estadísticas
                const activeCount = activeData.page?.totalElements || 0;
                const takenCount = takenData.page?.totalElements || 0;
                const completedCount = completedData.page?.totalElements || 0;
                const cancelledCount = cancelledData.page?.totalElements || 0;
                const totalCount = activeCount + takenCount + completedCount + cancelledCount;

                const completionRate = totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(1) : 0;
                const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
                const dailyAverage = (totalCount / daysInMonth).toFixed(1);

                // Calcular tendencia comparando con el mes anterior
                const previousMonthTotal = previousMonthData.page?.totalElements || 0;
                const monthlyTrend = previousMonthTotal > 0 ?
                    (((totalCount - previousMonthTotal) / previousMonthTotal) * 100).toFixed(1) : 0;

                setStats({
                    totalRequests: totalCount,
                    activeRequests: activeCount,
                    takenRequests: takenCount,
                    completedRequests: completedCount,
                    cancelledRequests: cancelledCount,
                    completionRate: parseFloat(completionRate),
                    dailyAverage: parseFloat(dailyAverage),
                    monthlyTrend: parseFloat(monthlyTrend)
                });

            } catch (err) {
                setError("Error al obtener estadísticas mensuales");
                console.error("Error fetching monthly stats:", err);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchMonthlyStats();
        }
    }, [token, apiDomain]);

    return { stats, loading, error };
}
