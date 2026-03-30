import { useCallback, useRef, useState, type FormEvent } from 'react'
import { AuthApiError, checkEmailStatus } from './api'

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const existingAccountMessage =
  'An account with this email already exists. Try signing in instead.'

export type EmailAvailabilityStatus = 'idle' | 'checking' | 'available' | 'exists'

export interface EmailAvailabilityState {
  email: string
  status: EmailAvailabilityStatus
}

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

export function useEmailAvailability() {
  const [emailAvailability, setEmailAvailability] = useState<EmailAvailabilityState>({
    email: '',
    status: 'idle',
  })
  const currentEmailRef = useRef('')
  const availabilityCacheRef = useRef(new Map<string, boolean>())
  const pendingCheckRef = useRef<{
    email: string
    promise: Promise<boolean | null>
  } | null>(null)

  const trackEmailInput = useCallback((rawEmail: string) => {
    const normalizedEmail = normalizeEmailInput(rawEmail)
    currentEmailRef.current = normalizedEmail

    setEmailAvailability((current) => {
      if (current.status === 'idle' && current.email === normalizedEmail) {
        return current
      }

      if (normalizedEmail && current.email === normalizedEmail && current.status !== 'checking') {
        return current
      }

      return {
        email: normalizedEmail,
        status: 'idle',
      }
    })
  }, [])

  const checkEmailExists = useCallback(async (rawEmail: string) => {
    const normalizedEmail = normalizeEmailInput(rawEmail)
    currentEmailRef.current = normalizedEmail

    if (!normalizedEmail || !emailPattern.test(normalizedEmail)) {
      setEmailAvailability((current) =>
        current.status === 'idle' && current.email === normalizedEmail
          ? current
          : { email: normalizedEmail, status: 'idle' },
      )

      return null
    }

    const cachedExists = availabilityCacheRef.current.get(normalizedEmail)

    if (typeof cachedExists === 'boolean') {
      setEmailAvailability((current) =>
        current.email === normalizedEmail &&
        current.status === (cachedExists ? 'exists' : 'available')
          ? current
          : {
              email: normalizedEmail,
              status: cachedExists ? 'exists' : 'available',
            },
      )

      return cachedExists
    }

    if (pendingCheckRef.current?.email === normalizedEmail) {
      return pendingCheckRef.current.promise
    }

    setEmailAvailability((current) =>
      current.email === normalizedEmail && current.status === 'checking'
        ? current
        : {
            email: normalizedEmail,
            status: 'checking',
          },
    )

    const promise = checkEmailStatus({ email: normalizedEmail })
      .then(({ exists }) => {
        availabilityCacheRef.current.set(normalizedEmail, exists)

        if (currentEmailRef.current === normalizedEmail) {
          setEmailAvailability({
            email: normalizedEmail,
            status: exists ? 'exists' : 'available',
          })
        }

        return exists
      })
      .catch(() => {
        if (currentEmailRef.current === normalizedEmail) {
          setEmailAvailability({
            email: normalizedEmail,
            status: 'idle',
          })
        }

        return null
      })
      .finally(() => {
        if (pendingCheckRef.current?.email === normalizedEmail) {
          pendingCheckRef.current = null
        }
      })

    pendingCheckRef.current = {
      email: normalizedEmail,
      promise,
    }

    return promise
  }, [])

  return {
    emailAvailability,
    checkEmailExists,
    trackEmailInput,
  }
}
