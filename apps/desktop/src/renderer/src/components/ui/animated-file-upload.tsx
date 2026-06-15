/* from smoothui.dev/docs/components/animated-file-upload */

import { cn } from '@/lib/utils'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useRef, useState } from 'react'

export interface AnimatedFileUploadProps {
  onFilesSelected: (files: File[]) => void
  accept?: string
  multiple?: boolean
  maxSize?: number
  className?: string
  disabled?: boolean
  hideFileList?: boolean
  previewUrl?: string | null
  onClearPreview?: () => void
}

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD
 *
 *    0ms   drop zone visible, dashed border idle
 *  drag    zone scales 1.02, border goes primary, icon floats up
 *  drop    icon bounces back, file rows slide in staggered
 * remove   file row slides out right + fades
 * layout   remaining files reorder with layout animation
 * ───────────────────────────────────────────────────────── */

const SPRING = {
  type: 'spring' as const,
  duration: 0.25,
  bounce: 0.1
}

const SPRING_BOUNCY = {
  type: 'spring' as const,
  duration: 0.3,
  bounce: 0.2
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileIcon(): React.JSX.Element {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 text-muted-foreground"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
    >
      <path
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function UploadIcon({ isDragOver }: { isDragOver: boolean }): React.JSX.Element {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      animate={
        shouldReduceMotion ? undefined : isDragOver ? { scale: 1.15, y: -4 } : { scale: 1, y: 0 }
      }
      transition={shouldReduceMotion ? { duration: 0 } : SPRING_BOUNCY}
    >
      <svg
        aria-hidden="true"
        className={cn(
          'mb-3 h-10 w-10 transition-colors duration-200',
          isDragOver ? 'text-primary' : 'text-muted-foreground'
        )}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  )
}

export default function AnimatedFileUpload({
  onFilesSelected,
  accept,
  multiple = true,
  maxSize,
  className,
  disabled = false,
  hideFileList = false,
  previewUrl = null,
  onClearPreview
}: AnimatedFileUploadProps): React.JSX.Element {
  const shouldReduceMotion = useReducedMotion()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const dragCounter = useRef(0)

  const validateFiles = useCallback(
    (newFiles: File[]): File[] => {
      setError(null)
      if (maxSize) {
        const oversized = newFiles.filter((f) => f.size > maxSize)
        if (oversized.length > 0) {
          setError(`${oversized.length} file(s) exceed the ${formatFileSize(maxSize)} limit`)
          return newFiles.filter((f) => f.size <= maxSize)
        }
      }
      return newFiles
    },
    [maxSize]
  )

  const handleFiles = useCallback(
    (newFiles: File[]) => {
      const valid = validateFiles(newFiles)
      if (valid.length === 0) return
      const updated = multiple ? [...files, ...valid] : valid.slice(0, 1)
      setFiles(updated)
      onFilesSelected(updated)
    },
    [files, multiple, onFilesSelected, validateFiles]
  )

  const removeFile = useCallback(
    (index: number) => {
      const updated = files.filter((_, i) => i !== index)
      setFiles(updated)
      onFilesSelected(updated)
    },
    [files, onFilesSelected]
  )

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (disabled) return
      dragCounter.current += 1
      setIsDragOver(true)
    },
    [disabled]
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current -= 1
    if (dragCounter.current === 0) {
      setIsDragOver(false)
    }
  }, [])

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (disabled) return
    },
    [disabled]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      dragCounter.current = 0
      setIsDragOver(false)
      if (disabled) return
      const droppedFiles = Array.from(e.dataTransfer.files)
      handleFiles(droppedFiles)
    },
    [disabled, handleFiles]
  )

  const handleClick = (): void => {
    if (!disabled) inputRef.current?.click()
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault()
      inputRef.current?.click()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const selected = e.target.files ? Array.from(e.target.files) : []
    handleFiles(selected)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={cn('w-full space-y-3', className)}>
      <motion.div
        animate={shouldReduceMotion ? undefined : isDragOver ? { scale: 1.02 } : { scale: 1 }}
        aria-label="File upload area. Drag and drop files or press to browse"
        className={cn(
          'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 min-h-[180px]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'transition-colors duration-200',
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/40 hover:bg-muted/30',
          disabled && 'pointer-events-none opacity-50'
        )}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={disabled ? -1 : 0}
        transition={shouldReduceMotion ? { duration: 0 } : SPRING}
      >
        <input
          accept={accept}
          className="sr-only"
          disabled={disabled}
          multiple={multiple}
          onChange={handleInputChange}
          ref={inputRef}
          type="file"
        />

        {previewUrl && (
          <>
            <img
              src={previewUrl}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover rounded-md"
            />
            {onClearPreview && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onClearPreview()
                }}
                className="absolute top-2 right-2 z-10 h-7 w-7 rounded-md bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"
                type="button"
                aria-label="Remove image"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </>
        )}

        {!previewUrl && (
          <div className="relative z-[1] flex flex-col items-center">
            <UploadIcon isDragOver={isDragOver} />
            <AnimatePresence initial={false} mode="wait">
              <motion.p
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                className="font-medium text-sm text-foreground"
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                key={isDragOver ? 'drop' : 'idle'}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.15 }}
              >
                {isDragOver ? 'Drop files here' : 'Drag & drop or click to upload'}
              </motion.p>
            </AnimatePresence>
            <p className="mt-1 text-xs text-muted-foreground">
              {accept ? accept.replace(/,/g, ', ') : 'Any file type'}
              {maxSize && ` \u2022 Max ${formatFileSize(maxSize)}`}
            </p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            className="text-destructive text-sm"
            exit={
              shouldReduceMotion
                ? { opacity: 0, transition: { duration: 0 } }
                : { opacity: 0, y: -4 }
            }
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
            role="alert"
            transition={shouldReduceMotion ? { duration: 0 } : SPRING}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {!hideFileList && files.length > 0 && (
        <ul aria-label="Selected files" className="space-y-2">
          <AnimatePresence initial={false}>
            {files.map((file, index) => (
              <motion.li
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, scale: 1 }}
                className="flex items-center gap-3 rounded-md border bg-muted/50 px-3 py-2"
                exit={
                  shouldReduceMotion
                    ? { opacity: 0, transition: { duration: 0 } }
                    : {
                        opacity: 0,
                        x: 24,
                        scale: 0.95,
                        transition: { duration: 0.15 }
                      }
                }
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -16, scale: 0.95 }}
                key={`${file.name}-${file.size}-${file.lastModified}`}
                layout={!shouldReduceMotion}
                transition={shouldReduceMotion ? { duration: 0 } : SPRING}
              >
                <FileIcon />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground text-sm">{file.name}</p>
                  <p className="text-muted-foreground text-xs">{formatFileSize(file.size)}</p>
                </div>
                <motion.button
                  aria-label={`Remove ${file.name}`}
                  className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(index)
                  }}
                  type="button"
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.1 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
                >
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  )
}
