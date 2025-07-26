import React, { useState, useEffect } from "react";
import { Users, Trash2, Search, Edit, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { useUsers } from "../../hooks/data/useUsers.js";

export default function UserSettings() {
    const {
        users,
        loading,
        error,
        pagination,
        updateUser,
        deleteUser,
        searchUsers,
        changePage,
        refresh
    } = useUsers();

    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: "",
        lastName: "",
        email: "",
        role: "",
        active: true
    });

    // Efecto para realizar búsqueda cuando cambian los filtros
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            // Construir filtros activos
            const hasSearchTerm = searchTerm.trim() !== "";
            const hasRoleFilter = roleFilter !== "";
            const hasStatusFilter = statusFilter !== "";

            console.log('📊 Estado de filtros:', {
                searchTerm: searchTerm,
                roleFilter: roleFilter,
                statusFilter: statusFilter,
                hasSearchTerm,
                hasRoleFilter,
                hasStatusFilter
            });

            if (hasSearchTerm || hasRoleFilter || hasStatusFilter) {
                // Si hay cualquier filtro activo, usar el endpoint de búsqueda
                console.log('✅ Aplicando filtros');
                searchUsers(searchTerm, {
                    role: hasRoleFilter ? roleFilter : undefined,
                    active: hasStatusFilter ? statusFilter : undefined
                });
            } else {
                // Si no hay filtros activos, mostrar todos los usuarios
                console.log('🔄 Sin filtros - mostrando todos');
                refresh();
            }
        }, 500); // Debounce de 500ms

        return () => clearTimeout(timeoutId);
    }, [searchTerm, roleFilter, statusFilter, searchUsers, refresh]);

    // Ya no necesitamos filtrado local, los filtros se manejan en el backend
    const filteredUsers = users;

    const handleDeleteUser = async (userId) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
            const result = await deleteUser(userId);
            if (result.success) {
                alert("Usuario eliminado exitosamente");
            } else {
                alert(`Error al eliminar usuario: ${result.error}`);
            }
        }
    };

    const handleEditUser = (user) => {
        setEditingUser(user);
        setEditFormData({
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            active: user.active
        });
        setShowEditModal(true);
    };

    const handleCloseModal = () => {
        setShowEditModal(false);
        setEditingUser(null);
        setEditFormData({
            name: "",
            lastName: "",
            email: "",
            role: "",
            active: true
        });
    };

    const handleSaveUser = async () => {
        if (!editFormData.name || !editFormData.lastName) {
            alert("Por favor completa todos los campos obligatorios");
            return;
        }

        const result = await updateUser(editingUser.id, {
            name: editFormData.name,
            lastName: editFormData.lastName,
            role: editFormData.role,
            active: editFormData.active
        });

        if (result.success) {
            handleCloseModal();
            alert("Usuario actualizado exitosamente");
        } else {
            alert(`Error al actualizar usuario: ${result.error}`);
        }
    };

    const handleInputChange = (field, value) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Función para limpiar todos los filtros
    const clearAllFilters = () => {
        setRoleFilter("");
        setStatusFilter("");
        setSearchTerm("");
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Gestión de Usuarios
                </h2>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="mb-6 space-y-4">
                {/* Barra de búsqueda */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Buscar por email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Filtros en una sola línea */}
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center">
                        <Filter className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700 mr-3">Filtros:</span>
                    </div>
                    
                    <div className="flex items-center">
                        <label className="text-sm font-medium text-gray-700 mr-2">Rol:</label>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Todos</option>
                            <option value="ADMIN">Administrador</option>
                            <option value="OPERATOR">Operador</option>
                            <option value="CLIENT">Cliente</option>
                        </select>
                    </div>
                    
                    <div className="flex items-center">
                        <label className="text-sm font-medium text-gray-700 mr-2">Estado:</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Todos</option>
                            <option value="true">Activo</option>
                            <option value="false">Inactivo</option>
                        </select>
                    </div>
                    
                    {/* Botón para limpiar filtros */}
                    {(roleFilter || statusFilter) && (
                        <button
                            onClick={clearAllFilters}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>
            </div>

            {/* Lista de usuarios */}
            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    Error al cargar usuarios: {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Cargando usuarios...</p>
                </div>
            ) : (
                <>
                    {/* Indicador de resultados filtrados */}
                    <div className="mb-4 flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            Mostrando {filteredUsers.length} usuarios
                            {(roleFilter || statusFilter || searchTerm) && (
                                <span className="ml-2 text-blue-600">(filtrado)</span>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="border border-gray-300 px-4 py-2 text-left">Nombre</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Rol</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Estado</th>
                                    <th className="border border-gray-300 px-4 py-2 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 px-4 py-2">{user.name} {user.lastName}</td>
                                        <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                                                    user.role === 'OPERATOR' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-green-100 text-green-800'
                                                }`}>
                                                {user.role === 'ADMIN' ? 'Administrador' :
                                                    user.role === 'OPERATOR' ? 'Operador' : 'Cliente'}
                                            </span>
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            <span className={`px-2 py-1 rounded-full text-xs ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {user.active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && !loading && (
                            <p className="text-center py-8 text-gray-500">
                                No se encontraron usuarios
                            </p>
                        )}
                    </div>

                    {/* Paginación */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-gray-700">
                                Mostrando {(pagination.page * pagination.size) + 1} - {Math.min((pagination.page + 1) * pagination.size, pagination.totalElements)} de {pagination.totalElements} usuarios
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => changePage(pagination.page - 1)}
                                    disabled={pagination.first}
                                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md">
                                    {pagination.page + 1} de {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => changePage(pagination.page + 1)}
                                    disabled={pagination.last}
                                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Modal de Edición */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">Editar Usuario</h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        value={editFormData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ingresa el nombre"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Apellido *
                                    </label>
                                    <input
                                        type="text"
                                        value={editFormData.lastName}
                                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ingresa el apellido"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={editFormData.email}
                                    readOnly
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">El email no puede ser modificado</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rol
                                </label>
                                <select
                                    value={editFormData.role}
                                    onChange={(e) => handleInputChange('role', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="ADMIN">Administrador</option>
                                    <option value="OPERATOR">Operador</option>
                                    <option value="CLIENT">Cliente</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Estado
                                </label>
                                <select
                                    value={editFormData.active.toString()}
                                    onChange={(e) => handleInputChange('active', e.target.value === 'true')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="true">Activo</option>
                                    <option value="false">Inactivo</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleSaveUser}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Guardar Cambios
                            </button>
                            <button
                                onClick={handleCloseModal}
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
