'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

interface UseLoadingStateOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const {
    showSuccessToast = true,
    showErrorToast = true,
    successMessage = 'Operação realizada com sucesso!',
    onSuccess,
    onError
  } = options;

  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    success: false
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading: loading,
      error: loading ? null : prev.error,
      success: loading ? false : prev.success
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false,
      success: false
    }));

    if (error && showErrorToast) {
      toast.error(error);
    }

    if (error && onError) {
      onError(error);
    }
  }, [showErrorToast, onError]);

  const setSuccess = useCallback((success: boolean = true) => {
    setState(prev => ({
      ...prev,
      success,
      isLoading: false,
      error: null
    }));

    if (success && showSuccessToast) {
      toast.success(successMessage);
    }

    if (success && onSuccess) {
      onSuccess();
    }
  }, [showSuccessToast, successMessage, onSuccess]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      success: false
    });
  }, []);

  const executeAsync = useCallback(async <T>(
    asyncFunction: () => Promise<T>,
    options?: {
      successMessage?: string;
      onSuccess?: (result: T) => void;
      onError?: (error: string) => void;
    }
  ): Promise<T | null> => {
    try {
      setLoading(true);
      const result = await asyncFunction();
      
      if (options?.successMessage && showSuccessToast) {
        toast.success(options.successMessage);
      } else if (showSuccessToast) {
        toast.success(successMessage);
      }
      
      setSuccess(true);
      
      if (options?.onSuccess) {
        options.onSuccess(result);
      } else if (onSuccess) {
        onSuccess();
      }
      
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Erro inesperado';
      setError(errorMessage);
      
      if (options?.onError) {
        options.onError(errorMessage);
      }
      
      return null;
    }
  }, [setLoading, setError, setSuccess, showSuccessToast, successMessage, onSuccess]);

  return {
    ...state,
    setLoading,
    setError,
    setSuccess,
    reset,
    executeAsync
  };
}

// Hook específico para formulários
export function useFormState() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const setFieldTouched = useCallback((field: string, touched: boolean = true) => {
    setTouched(prev => ({ ...prev, [field]: touched }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setErrors({});
    setTouched({});
  }, []);

  const hasErrors = Object.keys(errors).length > 0;
  const getFieldError = (field: string) => touched[field] ? errors[field] : undefined;

  return {
    isSubmitting,
    setIsSubmitting,
    errors,
    touched,
    hasErrors,
    setFieldError,
    clearFieldError,
    setFieldTouched,
    clearErrors,
    getFieldError,
    reset
  };
}