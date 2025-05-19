'use client';

import ProtectedRoute from '@/lib/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';
import LogoutButton from '@/lib/auth/LogoutButton';
import Toolbar from '@/components/editor/Toolbar';
import Canvas from '@/components/editor/Canvas';
import Sidebar from '@/components/editor/Sidebar';
import { ReactFlowProvider } from 'reactflow';

export default function EditorPage() {
  return (
    <ProtectedRoute>
      <EditorContent />
    </ProtectedRoute>
  );
}

function EditorContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">obliq Editor</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Logged in as {user?.email}</span>
            <Link
              href="/"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline text-sm"
            >
              Dashboard
            </Link>
            <LogoutButton className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded focus:outline-none focus:shadow-outline text-sm" />
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <Toolbar />

      {/* Main content */}
      <main className="flex-grow flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Canvas */}
        <ReactFlowProvider>
          <Canvas />
        </ReactFlowProvider>
      </main>

      {/* Status bar */}
      <footer className="bg-gray-100 border-t border-gray-300 p-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <div>Status: Ready</div>
          <div>Simulation: Idle</div>
        </div>
      </footer>
    </div>
  );
}