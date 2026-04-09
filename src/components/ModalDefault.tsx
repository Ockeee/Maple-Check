'use client'

type Props = {
  onClose: () => void
  children: React.ReactNode
  closeOnOverlay?: boolean
  className?: string
}

export default function ModalDefault({ onClose, children, closeOnOverlay = true, className }: Props) {
  return (
    <div className="overlay" onClick={closeOnOverlay ? onClose : undefined}>
      <div className={`modal ${className ?? ''}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}