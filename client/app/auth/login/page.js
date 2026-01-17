'use client';

import { PasskeyButton } from '@/components/auth/PasskeyButton';
import { GuestModeButton } from '@/components/auth/GuestModeButton';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Login to your TasteSync account</p>
        </div>
        
        <div className="space-y-4">
          <PasskeyButton mode="login" />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>
          <GuestModeButton />
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-gray-500 text-center">
            Don't have an account?{' '}
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
