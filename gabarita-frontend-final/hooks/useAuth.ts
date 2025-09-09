'use client';

import { useAuth as useAuthContext } from '@/contexts/AuthContext';

// Re-exporta o hook do AuthContext para manter compatibilidade
export const useAuth = useAuthContext;

export default useAuth;