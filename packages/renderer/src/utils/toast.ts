import { toast as sonnerToast } from 'sonner'

export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
      duration: 5000,
      style: {
        background: 'rgb(var(--green))',
        color: 'rgb(var(--crust))',
        border: 'none',
      },
    })
  },

  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
      duration: 5000,
      style: {
        background: 'rgb(var(--red))',
        color: 'rgb(var(--crust))',
        border: 'none',
      },
    })
  },

  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
      duration: 5000,
      style: {
        background: 'rgb(var(--blue))',
        color: 'rgb(var(--crust))',
        border: 'none',
      },
    })
  },

  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
      duration: 5000,
      style: {
        background: 'rgb(var(--yellow))',
        color: 'rgb(var(--crust))',
        border: 'none',
      },
    })
  },

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ) => {
    return sonnerToast.promise(promise, messages)
  },

  loading: (message: string) => {
    return sonnerToast.loading(message, {
      duration: Infinity,
    })
  },

  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId)
  },
}
