import { useEffect, useState } from 'react'
import { Link, getRouteApi, useNavigate } from '@tanstack/react-router'
import { CheckCircle2, LoaderCircle, MailCheck, ShieldAlert } from 'lucide-react'
import { AuthApiError, checkEmailStatus, verifyEmail } from '../api'
import AuthSplitLayout from '../components/AuthSplitLayout'
import {
  authBodyTextClassName,
  authLinkClassName,
  authPrimaryLinkButtonClassName,
} from '../components/authClassNames'

const verifyEmailRoute = getRouteApi('/(public)/verify-email')
const redirectDelaySeconds = 5

type VerificationViewState = 'pending' | 'verifying' | 'success' | 'error'
type AppwriteVerificationStatus = 'idle' | 'checking' | 'verified' | 'unverified' | 'missing'

export default function EmailVerificationPage() {
  const navigate = useNavigate()
  const { email, secret, userId } = verifyEmailRoute.useSearch()
  const hasVerificationLink = Boolean(userId && secret)
  const [countdown, setCountdown] = useState(redirectDelaySeconds)
  const [status, setStatus] = useState<VerificationViewState>(
    hasVerificationLink ? 'verifying' : 'pending'
  )
  const [detailMessage, setDetailMessage] = useState<string | null>(null)
  const [appwriteStatus, setAppwriteStatus] = useState<AppwriteVerificationStatus>('idle')

  useEffect(() => {
    if (!hasVerificationLink) {
      return
    }

    let cancelled = false

    void (async () => {
      try {
        const response = await verifyEmail({
          userId,
          secret,
        })

        if (cancelled) {
          return
        }

        setDetailMessage(response.message)
        setStatus('success')
      } catch (error) {
        if (cancelled) {
          return
        }

        setDetailMessage(
          error instanceof AuthApiError
            ? error.message
            : 'We could not verify your email right now. Please try again.'
        )
        setStatus('error')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [hasVerificationLink, secret, userId])

  useEffect(() => {
    if (hasVerificationLink || !email) {
      return
    }

    let cancelled = false

    setAppwriteStatus('checking')

    void (async () => {
      try {
        const response = await checkEmailStatus({
          email,
        })

        if (cancelled) {
          return
        }

        if (response.verificationStatus === 'verified') {
          setAppwriteStatus('verified')
          setDetailMessage('This Appwrite account is already verified. You can sign in now.')
          setStatus('success')
          return
        }

        setAppwriteStatus(response.verificationStatus)
      } catch {
        if (!cancelled) {
          setAppwriteStatus('idle')
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [email, hasVerificationLink])

  useEffect(() => {
    if (status === 'verifying') {
      return
    }

    setCountdown(redirectDelaySeconds)

    const timeoutId = window.setTimeout(() => {
      void navigate({
        to: '/sign-in',
        replace: true,
      })
    }, redirectDelaySeconds * 1000)

    const intervalId = window.setInterval(() => {
      setCountdown((current) => (current > 1 ? current - 1 : 1))
    }, 1000)

    return () => {
      window.clearTimeout(timeoutId)
      window.clearInterval(intervalId)
    }
  }, [navigate, status])

  const content = getVerificationContent({
    appwriteStatus,
    detailMessage,
    email,
    status,
  })

  return (
    <AuthSplitLayout
      title={content.title}
      subtitle={content.subtitle}
    >
      <div className="flex flex-col items-center text-center">
        <div className={content.iconWrapperClassName}>
          <content.Icon className={content.iconClassName} strokeWidth={content.iconStrokeWidth} />
        </div>
        <p className={`${authBodyTextClassName} mb-3 max-w-sm`}>
          {content.body}
        </p>
        <p className={`${authBodyTextClassName} mb-8 max-w-sm`}>
          Redirecting to sign in in {countdown} second{countdown === 1 ? '' : 's'}.
        </p>
        <Link
          to="/sign-in"
          className={`${authPrimaryLinkButtonClassName} mt-0`}
        >
          Back to Sign In
        </Link>
        <p className="mt-6 text-sm text-muted-foreground">
          Need to try again? Return to{' '}
          <Link to="/sign-in" className={authLinkClassName}>
            sign in
          </Link>
          .
        </p>
      </div>
    </AuthSplitLayout>
  )
}

function getVerificationContent({
  appwriteStatus,
  detailMessage,
  email,
  status,
}: {
  appwriteStatus: AppwriteVerificationStatus
  detailMessage: string | null
  email: string
  status: VerificationViewState
}) {
  if (status === 'verifying') {
    return {
      title: 'Verifying Email',
      subtitle: 'We are confirming your Appwrite email verification link.',
      body: 'Please wait while we finish verifying your account.',
      Icon: LoaderCircle,
      iconWrapperClassName:
        'mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/12 text-primary',
      iconClassName: 'h-8 w-8 animate-spin',
      iconStrokeWidth: 2.2,
    }
  }

  if (status === 'success') {
    return {
      title: 'Email Verified',
      subtitle: 'Your account is ready to use.',
      body: detailMessage || 'Your email address has been verified successfully. You can sign in now.',
      Icon: CheckCircle2,
      iconWrapperClassName:
        'mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground',
      iconClassName: 'h-8 w-8',
      iconStrokeWidth: 2.4,
    }
  }

  if (status === 'error') {
    return {
      title: 'Verification Unavailable',
      subtitle: 'This email verification link is invalid or has expired.',
      body:
        detailMessage ||
        'Open the most recent verification email we sent you, or sign in again to request another link.',
      Icon: ShieldAlert,
      iconWrapperClassName:
        'mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/12 text-destructive',
      iconClassName: 'h-8 w-8',
      iconStrokeWidth: 2.2,
    }
  }

  return {
    title: 'Check Your Email',
    subtitle: 'We created your account. Verify your email to continue.',
    body: getPendingVerificationBody({
      appwriteStatus,
      email,
    }),
    Icon: MailCheck,
    iconWrapperClassName:
      'mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/12 text-primary',
    iconClassName: 'h-8 w-8',
    iconStrokeWidth: 2.2,
  }
}

function getPendingVerificationBody({
  appwriteStatus,
  email,
}: {
  appwriteStatus: AppwriteVerificationStatus
  email: string
}) {
  const emailText = email ? ` for ${email}` : ''

  if (appwriteStatus === 'checking') {
    return `Checking your Appwrite verification status${emailText}.`
  }

  if (appwriteStatus === 'verified') {
    return 'This Appwrite account is already verified. You can sign in now.'
  }

  if (appwriteStatus === 'unverified') {
    return email
      ? `Your account is not yet verified. The Appwrite account for ${email} is still marked as Unverified.`
      : 'Your account is not yet verified.'
  }

  if (appwriteStatus === 'missing') {
    return email
      ? `We could not find an Appwrite account for ${email} yet. If you just signed up, wait a moment and then try again.`
      : 'We could not find your Appwrite account yet. If you just signed up, wait a moment and then try again.'
  }

  return email
    ? `We sent a verification email to ${email}. Open that message, use the Appwrite link, and then sign in once verification is complete.`
    : 'We sent a verification email to your inbox. Open that message, use the Appwrite link, and then sign in once verification is complete.'
}
