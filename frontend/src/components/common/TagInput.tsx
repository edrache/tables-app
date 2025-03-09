import { useState, KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  className?: string
}

const TagInput = ({ tags, onChange, placeholder, className = '' }: TagInputProps) => {
  const [input, setInput] = useState('')
  const { t } = useTranslation()

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const newTag = input.trim().toLowerCase()
      
      if (newTag && !tags.includes(newTag)) {
        onChange([...tags, newTag])
      }
      
      setInput('')
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className={`flex flex-wrap gap-2 p-2 border rounded-md ${className}`}>
      {tags.map(tag => (
        <span
          key={tag}
          className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-primary-100 text-primary-700"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="ml-1 text-primary-600 hover:text-primary-800"
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || t('common.addTags')}
        className="flex-1 min-w-[120px] outline-none border-none bg-transparent"
      />
    </div>
  )
}

export default TagInput 