import { useState, useCallback } from 'react'

export const useToast = () => {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now()
    setToasts(prevToasts => [...prevToasts, { id, message, type }])
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id))
    }, duration)
  }, [])

  return { toasts, addToast }
}

export const Toaster = () => {
  const { toasts } = useToast()

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`p-3 rounded-md ${
            toast.type === 'error' ? 'bg-red-500' : 
            toast.type === 'success' ? 'bg-green-500' : 
            'bg-blue-500'
          } text-white`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}