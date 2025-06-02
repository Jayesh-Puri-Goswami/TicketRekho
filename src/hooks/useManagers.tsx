"use client"

import { useEffect, useRef, useCallback } from "react"
import axios from "axios"
import Urls from "../networking/app_urls"
import { useSelector, useDispatch } from "react-redux"
import type { Manager } from "../types/manager"
import {
  fetchManagersStart,
  fetchManagersSuccess,
  fetchManagersFailure,
  setPage,
  resetReload,
} from "../redux/manager/managerSlice"

export const useManagers = () => {
  const dispatch = useDispatch()
  const currentUser = useSelector((state: any) => state.user.currentUser?.data)
  const { managers, loading, error, page, hasMore, totalPages, shouldReload } = useSelector(
    (state: any) => state.manager,
  )

  const abortController = useRef<AbortController | null>(null)
  const limit = 10

  const formatRoleName = (str: string) =>
    str
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")

  const fetchManagers = useCallback(
    async (currentPage: number, isNewFetch = false) => {
      if (!currentUser?.token || (loading && !isNewFetch)) return

      try {
        dispatch(fetchManagersStart())

        // Cancel previous request if it exists
        if (abortController.current) {
          abortController.current.abort()
        }

        // Create new abort controller
        abortController.current = new AbortController()

        const response = await axios.get(`${Urls.getManagers}?page=${currentPage}&limit=${limit}`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
          signal: abortController.current.signal,
        })

        const userList = response.data?.data?.userList
        const pagination = response.data?.data?.pagination

        if (response.data.status && Array.isArray(userList)) {
          const processedManagers: Manager[] = userList.map((manager: any) => ({
            ...manager,
            profileImage: manager.profileImage ? `${Urls.Image_url}${manager.profileImage}` : "",
            role: formatRoleName(manager.role || ""),
          }))

          dispatch(
            fetchManagersSuccess({
              managers: processedManagers,
              page: currentPage,
              totalPages: pagination.totalPages || 1,
              hasMore: currentPage < pagination.totalPages,
              isNewFetch,
            }),
          )
        } else {
          dispatch(fetchManagersFailure("Invalid response from server"))
        }
      } catch (err: any) {
        // Only handle non-canceled errors
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          console.error("Fetch Managers Error:", err)
          dispatch(fetchManagersFailure("Failed to fetch managers"))
        }
        // Silently ignore canceled requests as they are expected
      }
    },
    [currentUser?.token, dispatch, loading],
  )

  // Handle reload when shouldReload is true
  useEffect(() => {
    if (shouldReload && currentUser?.token) {
      fetchManagers(1, true)
      dispatch(resetReload())
    }
  }, [shouldReload, currentUser?.token, fetchManagers, dispatch])

  // Initial fetch
  useEffect(() => {
    if (currentUser?.token && managers.length === 0 && !loading) {
      fetchManagers(1, true)
    }
  }, [currentUser?.token, managers.length, fetchManagers, loading])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort()
      }
    }
  }, [])

  const loadMore = useCallback(() => {
    if (!loading && hasMore && page < totalPages) {
      const nextPage = page + 1
      dispatch(setPage(nextPage))
      fetchManagers(nextPage)
    }
  }, [loading, hasMore, page, totalPages, fetchManagers, dispatch])

  return {
    managers,
    loading,
    error,
    loadMore,
    hasMore,
    fetchManagers,
    page,
    totalPages,
  }
}
