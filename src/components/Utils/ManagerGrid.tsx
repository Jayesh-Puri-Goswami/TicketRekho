"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Manager, ManagerCategory, ManagerStatus } from "../../types/manager"
import ManagerCard from "../Cards/ManagerCard"

interface ManagerGridProps {
  managers: Manager[]
  searchTerm: string
  selectedCategories: ManagerCategory[]
  selectedStatuses: ManagerStatus[]
  onViewProfile: (id: string) => void
  lastRef?: (node: HTMLDivElement | null) => void
  onEditProfile: (manager: Manager) => void
}

const ManagerGrid: React.FC<ManagerGridProps> = ({
  managers,
  searchTerm,
  selectedCategories,
  selectedStatuses,
  onViewProfile,
  onEditProfile,
  lastRef,
}) => {
  const filteredManagers = managers.filter((manager) => {
    const matchesSearch = manager.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(manager.role)

    const managerStatus = manager.active ? "Active" : "Inactive"
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(managerStatus as ManagerStatus)

    return matchesSearch && matchesCategory && matchesStatus
  })

  if (filteredManagers.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full text-center py-16">
        <h3 className="text-xl font-medium text-gray-600">No managers found</h3>
        <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
      </motion.div>
    )
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredManagers.map((manager, index) => {
            const isLast = index === filteredManagers.length - 1
            return (
              <motion.div
                key={manager._id}
                exit={{ opacity: 0, scale: 0.8 }}
                layout
                className="h-full"
                ref={isLast ? lastRef : null}
              >
                <ManagerCard
                  manager={manager}
                  onViewProfile={onViewProfile}
                  index={index}
                  onEditProfile={onEditProfile}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default ManagerGrid
