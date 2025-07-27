import { useState, useEffect, useCallback, useRef } from 'react';
import { getUsersWithFilters, updateUser, deleteUser } from '../../services/UserService.js';

export function useUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true
    });
    
    // Usar useRef para evitar dependencias circulares
    const currentFiltersRef = useRef({});

    // Función principal para cargar usuarios
    const loadUsers = async (filters = {}, page = 0, size = 10) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await getUsersWithFilters({
                page,
                size,
                ...filters
            });
            
            setUsers(response.content || []);
            setPagination({
                page: response.number || 0,
                size: response.size || 10,
                totalElements: response.totalElements || 0,
                totalPages: response.totalPages || 0,
                first: response.first || true,
                last: response.last || true
            });
            
            currentFiltersRef.current = filters;
        } catch (err) {
            setError(err.message);
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    // Función para cambiar de página
    const changePage = useCallback((newPage) => {
        loadUsers(currentFiltersRef.current, newPage, pagination.size);
    }, [pagination.size]);

    // Función para cambiar el tamaño de página
    const changePageSize = useCallback((newSize) => {
        loadUsers(currentFiltersRef.current, 0, newSize);
    }, []);

    // Función para actualizar un usuario
    const handleUpdateUser = useCallback(async (userId, userData) => {
        try {
            setLoading(true);
            setError(null);
            
            await updateUser(userId, userData);
            
            // Actualizar la lista local
            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user.id === userId ? { ...user, ...userData } : user
                )
            );
            
            return { success: true };
        } catch (err) {
            setError(err.message);
            console.error('Error updating user:', err);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    // Función para eliminar un usuario
    const handleDeleteUser = useCallback(async (userId) => {
        try {
            setLoading(true);
            setError(null);
            
            await deleteUser(userId);
            
            // Actualizar la lista local
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            
            return { success: true };
        } catch (err) {
            setError(err.message);
            console.error('Error deleting user:', err);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    // Función para buscar usuarios con filtros múltiples
    const searchUsers = useCallback((searchTerm, additionalFilters = {}) => {
        const filters = {};
        
        // Solo agregar filtros que tengan valor
        if (searchTerm && searchTerm.trim()) {
            filters.email = searchTerm.trim();
        }
        if (additionalFilters.role && additionalFilters.role !== "") {
            filters.role = additionalFilters.role;
        }
        if (additionalFilters.active !== undefined && additionalFilters.active !== "") {
            filters.active = additionalFilters.active === "true";
        }
        
        loadUsers(filters, 0, pagination.size);
    }, [pagination.size]);

    // Función para filtrar por rol
    const filterByRole = useCallback((role) => {
        const filters = role ? { role } : {};
        loadUsers(filters, 0, pagination.size);
    }, [pagination.size]);

    // Función para refrescar sin filtros (todos los usuarios)  
    const refresh = useCallback(() => {
        loadUsers({}, 0, pagination.size);
    }, [pagination.size]);

    // Cargar usuarios inicialmente
    useEffect(() => {
        loadUsers({}, 0, 10);
    }, []); // Solo se ejecuta una vez al montar

    return {
        users,
        loading,
        error,
        pagination,
        fetchUsers: loadUsers,
        changePage,
        changePageSize,
        updateUser: handleUpdateUser,
        deleteUser: handleDeleteUser,
        searchUsers,
        filterByRole,
        refresh
    };
}