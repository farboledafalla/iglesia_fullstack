import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';

const Login = () => {
    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-md w-full space-y-8'>
                <div className='text-center'>
                    <h1 className='text-3xl font-bold text-gray-900'>
                        Plataforma de Capacitación
                    </h1>
                    <p className='mt-2 text-sm text-gray-600'>
                        Inicia sesión en tu cuenta
                    </p>
                </div>
                <LoginForm />
                <div className='text-center'>
                    <p className='text-sm text-gray-600'>
                        ¿No tienes una cuenta?{' '}
                        <Link
                            to='/register'
                            className='font-medium text-indigo-600 hover:text-indigo-500'
                        >
                            Regístrate aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login; 