'use client'
import React, { useState } from 'react';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        console.log('submit');
        e.preventDefault();
        const params = new URLSearchParams({ username, password }).toString();
        fetch(`/api/login?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((res) => res.json())
            .then((data) => {
                console.log(data);
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    window.location = '/';
                } else {
                    alert('Login failed');
                }
            }).catch((error) => {
                console.error('Error:', error);
                alert('Login failed');
            });
    };

    React.useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token })
            }).then((res) => {
                if (res.status === 200) {
                    window.location = '/';
                }
            })
        }
    }, []);

    return (
        <div className="flex justify-center items-center h-screen">
            <form onSubmit={handleSubmit} className="flex flex-col w-72">
                <h2 className="text-2xl mb-4">Login</h2>
                <label className="mb-2">
                    Username:
                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="border p-2 w-full"
                    />
                </label>
                <label className="mb-4">
                    Password:
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border p-2 w-full"
                    />
                </label>
                <button type="submit" className="bg-blue-500 text-white p-2 rounded">Login</button>
            </form>
        </div>
    );
};

export default LoginPage;