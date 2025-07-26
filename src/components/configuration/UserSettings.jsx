import React, { useState, useEffect } from "react";
import { Users, Trash2, Search } from "lucide-react";

// Datos mock para demostración
const mockUsers = [
    { id: 1, name: "Juan Pérez", email: "juan@example.com", role: "ADMIN", status: "ACTIVE" },
    { id: 2, name: "María García", email: "maria@example.com", role: "OPERATOR", status: "ACTIVE" },
    { id: 3, name: "Carlos López", email: "carlos@example.com", role: "CUSTOMER", status: "INACTIVE" },
];

export default function UserSettings() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        // Simular carga de usuarios
        const loadUsers = () => {
            setLoading(true);
            setTimeout(() => {
                setUsers(mockUsers);
                setLoading(false);
            }, 1000);
        };
        loadUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteUser = (userId) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
            setUsers(users.filter(user => user.id !== userId));
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Gestión de Usuarios
                </h2>
            </div>

            {/* Barra de búsqueda */}
            <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Buscar usuarios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Lista de usuarios */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Cargando usuarios...</p>
                </div>
            ) : (
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
                                    <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                                    <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                                            user.role === 'OPERATOR' ? 'bg-blue-100 text-blue-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {user.role === 'ADMIN' ? 'Administrador' :
                                             user.role === 'OPERATOR' ? 'Operador' : 'Cliente'}
                                        </span>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {user.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2 text-center">
                                        <div className="flex justify-center gap-2">
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
                    {filteredUsers.length === 0 && (
                        <p className="text-center py-8 text-gray-500">
                            No se encontraron usuarios
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
