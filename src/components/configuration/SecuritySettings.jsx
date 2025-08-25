import React, { useState } from "react";
import { Shield, Key, Eye, EyeOff, AlertTriangle, CheckCircle } from "lucide-react";
import { changePassword } from "../../services/UserService";

export default function SecuritySettings() {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });



    const handlePasswordChange = (field, value) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleChangePassword = async () => {
        setMessage({ type: '', text: '' });
        
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Por favor, completa todos los campos' });
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 6 caracteres' });
            return;
        }

        setLoading(true);

        try {
            await changePassword(null, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            
            setMessage({ type: 'success', text: 'Contraseña cambiada exitosamente' });
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Error al cambiar la contraseña' });
        } finally {
            setLoading(false);
        }
    };

    const PasswordStrengthIndicator = ({ password }) => {
        const getStrength = (pwd) => {
            let score = 0;
            if (pwd.length >= 8) score++;
            if (/[a-z]/.test(pwd)) score++;
            if (/[A-Z]/.test(pwd)) score++;
            if (/[0-9]/.test(pwd)) score++;
            if (/[^A-Za-z0-9]/.test(pwd)) score++;
            return score;
        };

        const strength = getStrength(password);
        const getColor = () => {
            if (strength <= 2) return "bg-red-500";
            if (strength <= 3) return "bg-yellow-500";
            return "bg-green-500";
        };

        const getLabel = () => {
            if (strength <= 2) return "Débil";
            if (strength <= 3) return "Media";
            return "Fuerte";
        };

        return password ? (
            <div className="mt-1">
                <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all ${getColor()}`}
                            style={{ width: `${(strength / 5) * 100}%` }}
                        ></div>
                    </div>
                    <span className="text-xs text-gray-600">{getLabel()}</span>
                </div>
            </div>
        ) : null;
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Configuraciones de Seguridad
                </h2>
            </div>

            <div className="space-y-6">
                {/* Cambio de Contraseña */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                        <Key className="w-5 h-5 mr-2" />
                        Cambiar Contraseña
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contraseña Actual
                            </label>
                            <div className="relative">
                                <input
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={passwordData.currentPassword}
                                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showCurrentPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nueva Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    value={passwordData.newPassword}
                                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showNewPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                            <PasswordStrengthIndicator password={passwordData.newPassword} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirmar Nueva Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>
                        {message.text && (
                            <div className={`p-3 rounded-lg mb-4 ${
                                message.type === 'success' 
                                    ? 'bg-green-50 text-green-700 border border-green-200' 
                                    : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                                <div className="flex items-center gap-2">
                                    {message.type === 'success' ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <AlertTriangle className="w-4 h-4" />
                                    )}
                                    <span className="text-sm">{message.text}</span>
                                </div>
                            </div>
                        )}
                        
                        <button
                            onClick={handleChangePassword}
                            disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? "Cambiando..." : "Cambiar Contraseña"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
