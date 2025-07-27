'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { PermissionGuard } from '@/components/PermissionGuard';

interface User {
  id: string;
  email: string;
  stackId: string;
  createdAt: string;
  role: {
    id: string;
    name: string;
    description: string;
  } | null;
  plan: {
    id: string;
    name: string;
  } | null;
}

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

export default function UserManagement() {
  const currentUser = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des utilisateurs');
      }
      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/admin/roles');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des rôles');
      }
      const data = await response.json();
      setRoles(data.roles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId: string, roleId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roleId }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du rôle');
      }

      // Rafraîchir la liste des utilisateurs
      await fetchUsers();
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-orange-100 text-orange-800';
      case 'premium_user':
        return 'bg-purple-100 text-purple-800';
      case 'pro_user':
        return 'bg-blue-100 text-blue-800';
      case 'basic_user':
        return 'bg-green-100 text-green-800';
      case 'free_user':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Gestion des utilisateurs
        </h2>
        <PermissionGuard userId={currentUser?.id || null} requiredPermission="create_user">
          <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
            Ajouter un utilisateur
          </button>
        </PermissionGuard>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-purple-600 font-medium text-sm">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.email}
                    </p>
                    <p className="text-sm text-gray-500">
                      Créé le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {user.role && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role.name)}`}>
                      {user.role.name}
                    </span>
                  )}
                  
                  {user.plan && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.plan.name}
                    </span>
                  )}

                  <PermissionGuard userId={currentUser?.id || null} requiredPermission="assign_role">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowRoleModal(true);
                      }}
                      className="text-purple-600 hover:text-purple-900 text-sm font-medium"
                    >
                      Modifier le rôle
                    </button>
                  </PermissionGuard>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal de changement de rôle */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Modifier le rôle de {selectedUser.email}
              </h3>
              
              <div className="space-y-3">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleChangeRole(selectedUser.id, role.id)}
                    className={`w-full text-left p-3 rounded-md border transition-colors ${
                      selectedUser.role?.id === role.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{role.name}</div>
                    <div className="text-sm text-gray-500">{role.description}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {role.userCount} utilisateur{role.userCount > 1 ? 's' : ''}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}