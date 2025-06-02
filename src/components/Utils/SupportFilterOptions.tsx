// <DOCUMENT filename="SupportFilterOptions.tsx">
"use client"

import React from "react"
import { motion } from "framer-motion"
import { Check, X } from "lucide-react"

export type SupportStatus = "Active" | "Inactive"

interface SupportFilterOptionsProps {
  selectedStatuses: SupportStatus[]
  setSelectedStatuses: (statuses: SupportStatus[]) => void
}

const SupportFilterOptions: React.FC<SupportFilterOptionsProps> = ({
  selectedStatuses,
  setSelectedStatuses,
}) => {
  const toggleStatus = (status: SupportStatus) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter((s) => s !== status))
    } else {
      setSelectedStatuses([...selectedStatuses, status])
    }
  }

  return (
    <div className="w-full mb-5">
      <h3 className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Status</h3>
      <div className="flex flex-wrap gap-2">
        <FilterButton
          isActive={selectedStatuses.includes("Active")}
          onClick={() => toggleStatus("Active")}
          icon={<Check size={16} />}
          label="Active"
          activeClasses="bg-green-100 text-green-800 border-green-200"
        />
        <FilterButton
          isActive={selectedStatuses.includes("Inactive")}
          onClick={() => toggleStatus("Inactive")}
          icon={<X size={16} />}
          label="Inactive"
          activeClasses="bg-red-100 text-red-800 border-red-200"
        />
      </div>
    </div>
  )
}

interface FilterButtonProps {
  isActive: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  activeClasses: string
}

const FilterButton: React.FC<FilterButtonProps> = ({ isActive, onClick, icon, label, activeClasses }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
        isActive ? activeClasses : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-boxdark dark:border-strokedark dark:text-gray-300 dark:hover:bg-gray-700"
      }`}
    >
      {icon}
      {label}
    </motion.button>
  )
}

export default SupportFilterOptions
// </DOCUMENT>