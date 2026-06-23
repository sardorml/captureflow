import { X } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useOnClickOutside } from 'usehooks-ts'

export interface BasicModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  hideClose?: boolean
}

const modalSizes = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl'
}

export default function BasicModal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  hideClose = false
}: BasicModalProps): React.JSX.Element | null {
  const overlayRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousActiveElementRef = useRef<HTMLElement | null>(null)
  useOnClickOutside(modalRef, () => onClose())
  const shouldReduceMotion = useReducedMotion()

  const generatedTitleId = useId()
  const titleId = title ? `modal-title-${generatedTitleId}` : undefined

  // Save the previously focused element on open and restore it on close.
  useEffect(() => {
    if (isOpen) {
      previousActiveElementRef.current = document.activeElement as HTMLElement
      // Defer focus so it lands after the modal has mounted and animated in.
      setTimeout(() => {
        closeButtonRef.current?.focus()
      }, 100)
    } else if (previousActiveElementRef.current) {
      previousActiveElementRef.current.focus()
    }
  }, [isOpen])

  // Close on Escape key press and focus trap
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      // Focus trap: wrap Tab/Shift+Tab around the modal's focusable elements.
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements.at(-1)

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement?.focus()
          }
        } else if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Body overflow is left untouched: manually locking it conflicts with other
  // components, and the overlay + modal positioning already prevent scroll.

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[80] bg-background/70 backdrop-blur-sm"
            exit={{ opacity: 0 }}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            onClick={(e) => {
              if (e.target === overlayRef.current) {
                onClose()
              }
            }}
            ref={overlayRef}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
          />

          {/* Modal */}
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto px-4 py-6 sm:p-0"
            exit={{ opacity: 0 }}
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
          >
            <motion.div
              animate={shouldReduceMotion ? {} : { scale: 1, y: 0, opacity: 1 }}
              aria-labelledby={titleId}
              aria-modal="true"
              className={`${modalSizes[size]} relative mx-auto w-full rounded-xl border border-border bg-card p-4 shadow-xl sm:p-6`}
              exit={
                shouldReduceMotion
                  ? { opacity: 0, transition: { duration: 0 } }
                  : {
                      scale: 0.95,
                      y: 10,
                      opacity: 0,
                      transition: { duration: 0.15 }
                    }
              }
              initial={shouldReduceMotion ? { opacity: 1 } : { scale: 0.95, y: 10, opacity: 0 }}
              ref={modalRef}
              role="dialog"
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : {
                      type: 'spring',
                      damping: 25,
                      stiffness: 300,
                      duration: 0.25
                    }
              }
            >
              {/* Rendered only when there's a title, so the title shares the
                  row with the close button. */}
              {title && (
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="font-medium text-xl leading-6" id={titleId}>
                    {title}
                  </h3>
                  {!hideClose && (
                    <motion.button
                      aria-label="Close modal"
                      className="min-h-[44px] min-w-[44px] rounded-full p-2 transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      onClick={onClose}
                      ref={closeButtonRef}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                      type="button"
                      whileHover={shouldReduceMotion ? {} : { rotate: 90 }}
                    >
                      <X aria-hidden="true" className="h-5 w-5" />
                    </motion.button>
                  )}
                </div>
              )}

              {/* Title-less modals: float the close button into the top-right
                  corner so the content starts flush at the top (no empty
                  close-only row pushing everything down). */}
              {!title && !hideClose && (
                <motion.button
                  aria-label="Close modal"
                  className="absolute right-3 top-3 z-10 min-h-[44px] min-w-[44px] rounded-full p-2 transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:right-4 sm:top-4"
                  onClick={onClose}
                  ref={closeButtonRef}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                  type="button"
                  whileHover={shouldReduceMotion ? {} : { rotate: 90 }}
                >
                  <X aria-hidden="true" className="h-5 w-5" />
                </motion.button>
              )}

              {/* Content */}
              <div className="relative">{children}</div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}
