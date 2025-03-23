import React from 'react';
import {createRoot} from 'react-dom/client'
import "./styles/global.css";
import App from './App.jsx'
import {AuthProvider} from "./components/AuthProvider.jsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import SignInForm from "./components/SignInForm.jsx";
import SignUpForm from "./components/SignUpForm.jsx";
import CustomerActivity from './pages/CustomerActivity.jsx';
import OperatorActivity from './pages/OperatorActivity.jsx';

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<SignInForm/>}/>
                    <Route path="/login" element={<SignInForm/>}/>
                    <Route path="/register" element={<SignUpForm/>}/>
                    <Route path="/home" element={<App/>}/>
                    <Route path="/customers" element={<CustomerActivity/>}/>
                    <Route path="/operators" element={<OperatorActivity/>}/>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </React.StrictMode>
)
