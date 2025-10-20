'use client'

interface FilterButtonsProps {
  options: string[]
  active: string
  onSelect: (option: string) => void
  theme?: 'default' | 'cooking' | 'notes' | 'movies' | 'blog' | 'projects'
  counts?: { [key: string]: number }
}

export default function FilterButtons({ options, active, onSelect, theme = 'default', counts }: FilterButtonsProps) {
  const themeClasses = {
    default: {
      active: 'bg-purple-600 text-white border-purple-600',
      inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500',
    },
    cooking: {
      active: 'bg-orange-600 text-white border-orange-600',
      inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500',
    },
    notes: {
      active: 'bg-blue-600 text-white border-blue-600',
      inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500',
    },
    movies: {
      active: 'bg-red-600 text-white border-red-600',
      inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-500',
    },
    blog: {
      active: 'bg-indigo-600 text-white border-indigo-600',
      inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500',
    },
    projects: {
      active: 'bg-green-600 text-white border-green-600',
      inactive: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500',
    },
  }

  const classes = themeClasses[theme]

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          className={`px-4 py-2 rounded-lg border font-medium transition-all duration-200 ${
            active === option ? classes.active : classes.inactive
          }`}
        >
          <span>{option}</span>
          {counts && counts[option] !== undefined && (
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
              active === option 
                ? 'bg-white/20' 
                : 'bg-gray-200 dark:bg-gray-700'
            }`}>
              {counts[option]}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
