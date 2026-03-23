'use client'

type Props = {
  onClose: () => void
  children: React.ReactNode
}

export default function ModalDefault({ onClose, children }: Props) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}