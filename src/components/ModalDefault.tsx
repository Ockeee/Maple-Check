'use client'

type Props = {
  onClose: () => void
  children: React.ReactNode
  closeOnOverlay?: boolean
}

export default function ModalDefault({ onClose, children, closeOnOverlay = true }: Props) {
  return (
    <div className="overlay" onClick={closeOnOverlay ? onClose : undefined}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}