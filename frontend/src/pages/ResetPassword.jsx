import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
	const [searchParams] = useSearchParams();
	const token = searchParams.get('token');
	const userId = searchParams.get('id');
	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const navigate = useNavigate();

	useEffect(() => {
		if (!token || !userId) {
			setError('Invalid reset link');
		}
	}, [token, userId]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		if (!password) return setError('Enter a new password');
		if (password !== confirm) return setError('Passwords do not match');
		try {
			const resp = await axios.post('/api/auth/reset-password', { userId, token, password }, { withCredentials: true });
			setSuccess('Password reset successful — please sign in');
			setTimeout(() => navigate('/login'), 1500);
		} catch (err) {
			setError(err.response?.data?.message || 'Reset failed');
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
			<div className="w-full max-w-md bg-gray-800/80 rounded-2xl p-8 shadow-lg">
				<h2 className="text-2xl font-bold mb-2">Reset password</h2>
				{error && <div className="text-sm text-red-400 mb-2">{error}</div>}
				{success && <div className="text-sm text-green-400 mb-2">{success}</div>}

				<form onSubmit={handleSubmit} className="space-y-4">
					<input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 rounded bg-gray-700 outline-none" required />
					<input type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full p-3 rounded bg-gray-700 outline-none" required />
					<button type="submit" className="w-full py-3 rounded bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 font-semibold">Reset password</button>
				</form>
			</div>
		</div>
	);
};

export default ResetPassword;
