import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
export function AuthPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (user)
            navigate('/quiz');
    }, [user, navigate]);
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center px-4", children: _jsxs("div", { className: "w-full max-w-sm", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Welcome to Common Ground" }), _jsx("p", { className: "text-gray-500 mt-1 text-sm", children: "Sign in to save your results and get matched" })] }), _jsx("div", { className: "card", children: _jsx(Auth, { supabaseClient: supabase, appearance: {
                            theme: ThemeSupa,
                            variables: {
                                default: {
                                    colors: {
                                        brand: '#7c3aed',
                                        brandAccent: '#6d28d9',
                                    },
                                },
                            },
                        }, providers: ['google'], redirectTo: window.location.origin + '/quiz' }) })] }) }));
}
