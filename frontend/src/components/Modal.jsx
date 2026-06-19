import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'

function Modal({ title, description, children, onClose, size = 'md' }) {
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.classList.add('modal-open')

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.classList.remove('modal-open')
    }
  }, [onClose])

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onClose?.()
    }
  }

  return createPortal(
    <div className="modal-backdrop" onMouseDown={handleBackdropClick}>
      <div
        className={`modal-panel modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-heading">
            <h2 id={titleId}>{title}</h2>
            {description ? (
              <p id={descriptionId} className="modal-description">
                {description}
              </p>
            ) : null}
          </div>
          <button type="button" className="ghost-button modal-close" onClick={onClose} aria-label="Close dialog">
            Close
          </button>
        </div>

        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

export default Modal
