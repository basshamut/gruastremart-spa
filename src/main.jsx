import React from 'react';
import {createRoot} from 'react-dom/client'
import "./styles/global.css";
import App from './App.jsx'
import {AuthProvider} from "./components/access/AuthProvider.jsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import SignInForm from "./components/access/SignInForm.jsx";
import SignUpForm from "./components/access/SignUpForm.jsx";
import ResetPassword from "./components/access/ResetPassword.jsx";
import ForgotPassword from "./components/access/ForgotPassword.jsx";

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<SignInForm/>}/>
                    <Route path="/login" element={<SignInForm/>}/>
                    <Route path="/register" element={<SignUpForm/>}/>
                    <Route path="/forgot-password" element={<ForgotPassword/>}/>
                    <Route path="/reset-password" element={<ResetPassword/>}/>
                    <Route path="/home" element={<App/>}/>
                    <Route path="/customers" element={<App/>}/>
                    <Route path="/operators" element={<App/>}/>
                    <Route path="/configurations" element={<App/>}/>
                    <Route path="/profiles" element={<App/>}/>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </React.StrictMode>
)
