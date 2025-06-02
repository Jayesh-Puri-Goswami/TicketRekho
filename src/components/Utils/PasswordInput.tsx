"use client"

import type React from "react"
import { useState } from "react"
import { Eye, EyeOff, Lock } from "lucide-react"
import clsx from "clsx"

interface PasswordInputProps {
  id: string
  placeholder?: string
  className?: string
  error?: any
  register: any
  validation?: any
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  placeholder = "••••••••",
  className,
  error,
  register,
  validation,
}) => {
  const [showPassword, setShowPassword] = useState(false)

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Lock className="h-4 w-4 text-slate-400" />
      </div>
      <input
        type={showPassword ? "text" : "password"}
        id={id}
        className={clsx(
          "w-full rounded-md border py-2.5 pl-10 pr-12 text-sm outline-none transition-colors",
          error
            ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-600 dark:bg-red-900/20"
            : "border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white",
          className,
        )}
        placeholder={placeholder}
        {...register(id, validation)}
      />
      <button
        type="button"
        className="absolute inset-y-0 right-0 flex items-center pr-3"
        onClick={togglePasswordVisibility}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4 text-slate-400 hover:text-slate-600" />
        ) : (
          <Eye className="h-4 w-4 text-slate-400 hover:text-slate-600" />
        )}
      </button>
    </div>
  )
}

export default PasswordInput
