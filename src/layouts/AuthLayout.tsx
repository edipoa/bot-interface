/**
 * Layout para Páginas de Autenticação
 * 
 * Layout usado para páginas públicas como login, registro, etc.
 */

import { Outlet } from 'react-router-dom';
import { BFLogo } from '../components/BF-Logo';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bf-blue-primary)] to-[var(--bf-blue-dark)]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <BFLogo size="lg" />
        </div>

        <Outlet />
      </div>
    </div>
  );
}
