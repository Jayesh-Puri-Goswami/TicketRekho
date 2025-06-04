"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ChevronDown, X, Check, Users, User, Loader2, CheckSquare, Square } from "lucide-react"

export type Option = {
  _id: string
  name: string
  email: string
  mobileNumber: string
}

type MultiSelectDropdownProps = {
  options: Option[]
  selectedOptions: Option[]
  onChange: (selected: Option[]) => void
  placeholder?: string
  searchPlaceholder?: string
  loading?: boolean
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  selectedOptions,
  onChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Optimized filtering for large datasets
  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return options
    const search = searchTerm.toLowerCase()
    return options.filter((option) => {
      return (
        option.name?.toLowerCase().includes(search) ||
        option.email?.toLowerCase().includes(search) ||
        option.mobileNumber?.toLowerCase().includes(search)
      )
    })
  }, [options, searchTerm])

  const isAllSelected = React.useMemo(() => {
    return (
      filteredOptions.length > 0 &&
      filteredOptions.every((option) => selectedOptions.some((selected) => selected._id === option._id))
    )
  }, [filteredOptions, selectedOptions])

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const remaining = selectedOptions.filter(
        (selected) => !filteredOptions.some((option) => option._id === selected._id),
      )
      onChange(remaining)
    } else {
      const merged = [
        ...selectedOptions,
        ...filteredOptions.filter((option) => !selectedOptions.some((selected) => selected._id === option._id)),
      ]
      onChange(merged)
    }
  }

  const toggleOption = (option: Option) => {
    const isSelected = selectedOptions.some((selected) => selected._id === option._id)

    if (isSelected) {
      onChange(selectedOptions.filter((selected) => selected._id !== option._id))
    } else {
      onChange([...selectedOptions, option])
    }
  }

  const removeOption = (option: Option, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selectedOptions.filter((selected) => selected._id !== option._id))
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setSearchTerm("")
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const dropdownVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300,
        duration: 0.2,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <motion.div
        className="flex min-h-[48px] w-full cursor-pointer items-center justify-between rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-sm transition-all duration-200 hover:border-indigo-400 dark:hover:border-indigo-500 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20"
        onClick={toggleDropdown}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex flex-1 flex-wrap gap-2 min-h-[24px]">
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 size={16} className="animate-spin" />
              <span>Loading users...</span>
            </div>
          ) : selectedOptions.length > 0 ? (
            <AnimatePresence>
              {selectedOptions.slice(0, 3).map((option, index) => (
                <motion.span
                  key={option._id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-1 text-xs text-white shadow-sm"
                >
                  <User size={12} />
                  {option.name || option.email || option.mobileNumber}
                  <motion.button
                    type="button"
                    onClick={(e) => removeOption(option, e)}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                  >
                    <X size={10} />
                  </motion.button>
                </motion.span>
              ))}
              {selectedOptions.length > 3 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1 rounded-lg bg-gray-200 dark:bg-gray-700 px-3 py-1 text-xs text-gray-700 dark:text-gray-300"
                >
                  <Users size={12} />+{selectedOptions.length - 3} more
                </motion.span>
              )}
            </AnimatePresence>
          ) : (
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Users size={16} />
              {placeholder}
            </span>
          )}
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={20} className="text-indigo-500" />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute z-[999] mt-2 w-full overflow-hidden rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-2xl"
          >
            {/* Search Header */}
            <div className="border-b border-gray-200 dark:border-gray-600 p-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-gray-900 dark:text-white"
                />
              </div>

              {/* Stats */}
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{filteredOptions.length} users found</span>
                <span>{selectedOptions.length} selected</span>
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-indigo-500" />
                </div>
              ) : (
                <>
                  {/* Select All Option */}
                  {filteredOptions.length > 0 && (
                    <motion.div
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      onClick={toggleSelectAll}
                      className="flex cursor-pointer items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-b border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-center">
                        {isAllSelected ? (
                          <CheckSquare size={18} className="text-indigo-500" />
                        ) : (
                          <Square size={18} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-indigo-500" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          Select All ({filteredOptions.length})
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* User Options */}
                  {filteredOptions.length > 0 ? (
                    <AnimatePresence>
                      {filteredOptions.map((option, index) => {
                        const isSelected = selectedOptions.some((selected) => selected._id === option._id)
                        return (
                          <motion.div
                            key={option._id}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: index * 0.02 }}
                            onClick={() => toggleOption(option)}
                            className={`flex cursor-pointer items-center gap-3 px-4 py-3 text-sm transition-all duration-150 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                              isSelected ? "bg-indigo-50 dark:bg-indigo-900/20 border-r-2 border-indigo-500" : ""
                            }`}
                          >
                            <div className="flex items-center justify-center">
                              <motion.div
                                animate={{
                                  scale: isSelected ? 1.1 : 1,
                                  rotate: isSelected ? 360 : 0,
                                }}
                                transition={{ duration: 0.2 }}
                              >
                                {isSelected ? (
                                  <CheckSquare size={18} className="text-indigo-500" />
                                ) : (
                                  <Square size={18} className="text-gray-400" />
                                )}
                              </motion.div>
                            </div>

                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                {(option.name || option.email || "U").charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                  {option.name || "No Name"}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {option.email || option.mobileNumber}
                                </p>
                              </div>
                            </div>

                            {isSelected && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-indigo-500">
                                <Check size={16} />
                              </motion.div>
                            )}
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                      <Users size={32} className="mb-2 opacity-50" />
                      <p className="text-sm">No users found</p>
                      <p className="text-xs mt-1">Try adjusting your search</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {selectedOptions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t border-gray-200 dark:border-gray-600 p-4 bg-gray-50 dark:bg-gray-900"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedOptions.length} user{selectedOptions.length !== 1 ? "s" : ""} selected
                  </span>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      onChange([])
                    }}
                    className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Clear all
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MultiSelectDropdown
