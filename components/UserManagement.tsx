import React, { useState } from 'react';
import type { User, NewUserData } from '../types';
import { UserPlusIcon, CheckCircleIcon, TrashIcon } from './icons';

interface UserManagementProps {
    users: User[];
    onAddUser: (data: NewUserData) => void;
    onUpdateUserPassword: (userId: string, newPassword: string) => void;
    onDeleteUser: (userId: string) => void;
}

const PasswordChangeModal: React.FC<{
    user: User;
    onClose: () => void;
    onSave: (userId: string, newPass: string) => void;
}> = ({ user, onClose, onSave }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSave = () => {
        if (!newPassword || !confirmPassword) {
            setError('Ambos os campos de senha são obrigatórios.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        onSave(user.id, newPassword);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm">
                <h3 className="text-lg font-bold text-cyan-400 mb-4">Alterar Senha de {user.name}</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Nova Senha</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Confirmar Nova Senha</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg block w-full p-2.5"
                        />
                    </div>
                    {error && <p className="text-red-500 text-xs">{error}</p>}
                </div>
                <div className="flex gap-4 pt-6">
                    <button onClick={onClose} className="w-full text-gray-300 bg-gray-600 hover:bg-gray-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Cancelar</button>
                    <button onClick={handleSave} className="w-full text-white bg-cyan-600 hover:bg-cyan-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Salvar</button>
                </div>
            </div>
        </div>
    );
};


export const UserManagement: React.FC<UserManagementProps> = ({ users, onAddUser, onUpdateUserPassword, onDeleteUser }) => {
    const [newUserName, setNewUserName] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserVehicle, setNewUserVehicle] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [editingUser, setEditingUser] = useState<User | null>(null);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUserName.trim() || !newUserPassword.trim() || !newUserVehicle.trim()) {
            setError('Todos os campos são obrigatórios.');
            return;
        }
        onAddUser({ name: newUserName.trim(), password: newUserPassword, vehicle: newUserVehicle.trim() });
        setNewUserName('');
        setNewUserPassword('');
        setNewUserVehicle('');
        setError('');
        setSuccessMessage(`Usuário '${newUserName.trim()}' adicionado com sucesso!`);
        setTimeout(() => setSuccessMessage(''), 3000);
    }
    
    const handlePasswordSave = (userId: string, newPass: string) => {
        onUpdateUserPassword(userId, newPass);
        const user = users.find(u => u.id === userId);
        setSuccessMessage(`Senha de ${user?.name} atualizada com sucesso!`);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleDelete = (user: User) => {
        if (window.confirm(`Tem certeza que deseja excluir o motorista ${user.name}? Esta ação não pode ser desfeita.`)) {
            onDeleteUser(user.id);
            setSuccessMessage(`Motorista ${user.name} excluído com sucesso.`);
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };

    return (
        <div className="p-4 md:p-6 w-full max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">Gestão de Motoristas</h1>
            
            {successMessage && (
                <div className="bg-green-600 border border-green-700 text-white px-4 py-3 rounded-lg relative mb-4 flex items-center gap-2" role="alert">
                    <CheckCircleIcon className="w-5 h-5"/>
                    <span className="block sm:inline">{successMessage}</span>
                </div>
             )}

            <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-cyan-400 mb-4">Adicionar Novo Motorista</h2>
                <form onSubmit={handleAdd} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                           <label className="block mb-2 text-sm font-medium text-gray-300">Nome do Motorista</label>
                           <input 
                                type="text" 
                                value={newUserName}
                                onChange={e => setNewUserName(e.target.value)}
                                placeholder="Nome completo"
                                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                            />
                        </div>
                         <div>
                           <label className="block mb-2 text-sm font-medium text-gray-300">Senha</label>
                           <input 
                                type="password" 
                                value={newUserPassword}
                                onChange={e => setNewUserPassword(e.target.value)}
                                placeholder="Senha de acesso"
                                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                            />
                        </div>
                        <div>
                           <label className="block mb-2 text-sm font-medium text-gray-300">Veículo</label>
                           <input 
                                type="text" 
                                value={newUserVehicle}
                                onChange={e => setNewUserVehicle(e.target.value)}
                                placeholder="Ex: Caminhão VW-123"
                                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="text-white bg-cyan-600 hover:bg-cyan-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center justify-center gap-2">
                            <UserPlusIcon className="w-5 h-5" /> Adicionar Motorista
                        </button>
                    </div>
                </form>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold text-cyan-400 mb-4">Lista de Usuários</h2>
                <div className="divide-y divide-gray-700">
                    {users.map(user => (
                        <div key={user.id} className="py-3 flex flex-wrap justify-between items-center gap-2">
                            <div>
                                <p className="font-medium text-white">{user.name}</p>
                                <p className="text-sm text-gray-400 capitalize">{user.role} {user.vehicle && `- ${user.vehicle}`}</p>
                            </div>
                            {user.role === 'driver' && (
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setEditingUser(user)} className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                                        Alterar Senha
                                    </button>
                                    <button onClick={() => handleDelete(user)} className="text-red-500 hover:text-red-400 text-sm font-medium flex items-center gap-1">
                                        <TrashIcon className="w-4 h-4" />
                                        Excluir
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            {editingUser && <PasswordChangeModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handlePasswordSave} />}
        </div>
    );
}