import { useCallback, useRef, type FormEvent } from 'react'
import { toast } from 'sonner'
import { AuthApiError } from './api'

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmailInput(value: string) {
  return value.trim().toLowerCase()
}

export function normalizeNameInput(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

export function validateEmailInput(value: string) {
  const normalizedEmail = normalizeEmailInput(value)

  if (!normalizedEmail) {
    return 'Email is required'
  }

  if (!emailPattern.test(normalizedEmail)) {
    return 'Enter a valid email address'
  }

  return undefined
}

export function validateFullName(value: string) {
  const normalizedName = normalizeNameInput(value)

  if (!normalizedName) {
    return 'Name is required'
  }

  if (normalizedName.length < 2) {
    return 'Enter your full name'
  }

  return undefined
}

export function validateRequiredPassword(value: string) {
  if (!value) {
    return 'Password is required'
  }

  return undefined
}

export function validatePasswordConfirmation(value: string, password: string) {
  if (!value) {
    return 'Confirm your password'
  }

  if (value !== password) {
    return 'Passwords do not match'
  }

  return undefined
}

export function validateAcceptedTerms(value: boolean) {
  if (!value) {
    return 'You must agree to Terms & Privacy'
  }

  return undefined
}

export function getAuthPageErrorMessage(error: unknown, fallbackMessage: string) {
  return error instanceof AuthApiError ? error.message : fallbackMessage
}

export function showAuthErrorToast(options: {
  error: unknown
  fallbackMessage: string
  id: string
}) {
  toast.error(getAuthPageErrorMessage(options.error, options.fallbackMessage), {
    id: options.id,
  })
}

export function useGuardedFormSubmit(handleSubmit: () => Promise<unknown>) {
  const isHandlingSubmitRef = useRef(false)

  return useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      event.stopPropagation()

      if (isHandlingSubmitRef.current) {
        return
      }

      isHandlingSubmitRef.current = true

      void Promise.resolve(handleSubmit()).finally(() => {
        isHandlingSubmitRef.current = false
      })
    },
    [handleSubmit],
  )
}
