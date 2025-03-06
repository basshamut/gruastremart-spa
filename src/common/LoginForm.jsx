"use client"

import { useState } from "react"

function LoginForm() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({
            ...formData,
            [name]: value,
        })
    }

    const validate = () => {
        const newErrors = {}
        if (!formData.email) {
            newErrors.email = "El email es requerido"
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "El email no es válido"
        }
        if (!formData.password) {
            newErrors.password = "La contraseña es requerida"
        } else if (formData.password.length < 6) {
            newErrors.password = "La contraseña debe tener al menos 6 caracteres"
        }
        return newErrors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const newErrors = validate()

        if (Object.keys(newErrors).length === 0) {
            setIsLoading(true)
            try {
                console.log("Datos de inicio de sesión:", formData)
                await new Promise((resolve) => setTimeout(resolve, 1000))
                alert("Login exitoso!")
            } catch (error) {
                console.error("Error al iniciar sesión:", error)
                setErrors({ submit: "Error al iniciar sesión. Inténtalo de nuevo." })
            } finally {
                setIsLoading(false)
            }
        } else {
            setErrors(newErrors)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-6 shadow-lg rounded-lg">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">Iniciar sesión</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        O {" "}
                        <a href="#" className="font-medium text-orange-600 hover:text-orange-500">
                            regístrate si aún no tienes cuenta
                        </a>
                    </p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm ${errors.email ? 'border-red-500' : ''}`}
                            placeholder="Correo electrónico"
                        />
                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm ${errors.password ? 'border-red-500' : ''}`}
                            placeholder="Contraseña"
                        />
                        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Recordarme</label>
                        </div>
                        <a href="#" className="text-sm font-medium text-orange-600 hover:text-orange-500">¿Olvidaste tu contraseña?</a>
                    </div>

                    {errors.submit && <div className="text-sm text-red-600 text-center">{errors.submit}</div>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                    >
                        {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default LoginForm
