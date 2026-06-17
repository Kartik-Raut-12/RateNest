import { useState } from 'react'

interface StarRatingDisplayProps {
  value: number
  showNumber?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const StarRatingDisplay = ({ value, showNumber = true, size = 'md' }: StarRatingDisplayProps) => {
  const rounded = Math.round(value * 10) / 10
  const filled = Math.round(value)
  const sizeClass = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-base'
  return (
    <span className="flex items-center gap-1.5">
      <span className={`text-amber-500 ${sizeClass}`} aria-hidden="true">
        {'★'.repeat(filled)}{'☆'.repeat(5 - filled)}
      </span>
      {showNumber && <span className="text-gray-500 text-xs">({rounded})</span>}
    </span>
  )
}

interface StarRatingInputProps {
  storeId: string
  ratingId: string | null
  currentRating: number | null
  onRate: (storeId: string, ratingId: string | null, value: number) => void
}

export const StarRatingInput = ({ storeId, ratingId, currentRating, onRate }: StarRatingInputProps) => {
  const [hovered, setHovered] = useState<number | null>(null)
  const display = hovered ?? currentRating ?? 0

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1.5">
        {currentRating ? 'Your rating (click to update):' : 'Rate this store:'}
      </p>
      <div className="flex gap-1" role="group" aria-label="Star rating">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            className={`text-2xl transition-transform hover:scale-125 focus:outline-none ${star <= display ? 'text-amber-400' : 'text-gray-300'}`}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onRate(storeId, ratingId, star)}
            aria-label={`Rate ${star} out of 5 stars`}
          >
            ★
          </button>
        ))}
      </div>
      {currentRating && (
        <p className="text-xs text-indigo-600 mt-1 font-medium">You rated: {currentRating}/5</p>
      )}
    </div>
  )
}
