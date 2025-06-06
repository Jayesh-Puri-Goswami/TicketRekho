"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import Breadcrumb from "../components/Breadcrumbs/Breadcrumb"
import { motion } from "framer-motion"
import { useManagers } from "../hooks/useManagers"
import type { ManagerCategory, ManagerStatus, Manager } from "../types/manager"
import SearchBar from "../components/Utils/SearchBar"
import FilterOptions from "../components/Utils/FilterOptions"
import ManagerGrid from "../components/Utils/ManagerGrid"
import { Loader, Users } from "lucide-react"
import EditManagerModal from "../components/Modals/EditManagerModal"
import { useSelector, useDispatch } from "react-redux"
import { triggerReload } from "../redux/manager/managerSlice"
import ViewManagerModal from "../components/Modals/ViewManagerProfile"

const ManagerPage: React.FC = () => {
  const dispatch = useDispatch()
  const { managers, loading, error, loadMore, hasMore } = useManagers()
  const managerState = useSelector((state: any) => state.manager)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<ManagerCategory[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<ManagerStatus[]>([])
  const [editManagerId, setEditManagerId] = useState<string | null>(null)
  const [editManager, setEditManager] = useState<Manager | null>(null)

  const observer = useRef<IntersectionObserver | null>(null)

  const lastManagerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore()
        }
      })

      if (node) observer.current.observe(node)
    },
    [loading, hasMore, loadMore],
  )

  const onEditProfile = (manager: Manager) => {
    setEditManager(manager)
    setEditManagerId(manager._id)
  }

  const handleEditModalClose = () => {
    setEditManagerId(null)
    setEditManager(null)
    // Trigger reload to get fresh data
    dispatch(triggerReload())
  }

  if (loading && managers.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader size={48} className="text-indigo-600 animate-spin mb-4" />
        <h2 className="text-xl font-medium text-gray-700">Loading managers...</h2>
      </div>
    )
  }

  if (error && managers.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="mx-auto max-w-270">
        <Breadcrumb pageName="Managers" />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
              >
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <Users size={28} className="mr-2 text-indigo-600" />
                    Manager Management
                  </h1>
                  <p className="text-gray-600 mt-1">Browse, search and filter managers by category and status</p>
                </div>
                <SearchBar placeholder={`Search Managers...`} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white p-4 rounded-xl shadow-sm mb-6"
              >
                <FilterOptions
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                  selectedStatuses={selectedStatuses}
                  setSelectedStatuses={setSelectedStatuses}
                />
              </motion.div>
            </div>

            <ManagerGrid
              managers={managers}
              searchTerm={searchTerm}
              selectedCategories={selectedCategories}
              selectedStatuses={selectedStatuses}
              onViewProfile={() => {}}
              lastRef={lastManagerRef}
              onEditProfile={onEditProfile}
            />

            <EditManagerModal isOpen={!!editManagerId} manager={editManager} onClose={handleEditModalClose} />


            {/* <ViewManagerModal isOpen={!!editManagerId} manager={editManager} onClose={handleEditModalClose} /> */}

            {loading && managers.length > 0 && (
              <div className="text-center py-4">
                <Loader className="animate-spin inline text-indigo-600" />
              </div>
            )}

            {!hasMore && managers.length > 0 && (
              <p className="text-center text-gray-500 py-4">No more managers to load.</p>
            )}
          </div>
        </motion.div>
      </div>
    </>
  )
}

export default ManagerPage
