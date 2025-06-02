import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { Manager } from "../../types/manager"

interface ManagerState {
  managers: Manager[]
  loading: boolean
  error: string | null
  shouldReload: boolean
  page: number
  hasMore: boolean
  totalPages: number
}

const initialState: ManagerState = {
  managers: [],
  loading: false,
  error: null,
  shouldReload: false,
  page: 1,
  hasMore: true,
  totalPages: 1,
}

const managerSlice = createSlice({
  name: "manager",
  initialState,
  reducers: {
    // Fetch managers
    fetchManagersStart: (state) => {
      state.loading = true
      state.error = null
    },
    fetchManagersSuccess: (
      state,
      action: PayloadAction<{
        managers: Manager[]
        page: number
        totalPages: number
        hasMore: boolean
        isNewFetch?: boolean
      }>,
    ) => {
      const { managers, page, totalPages, hasMore, isNewFetch = false } = action.payload

      if (isNewFetch || page === 1) {
        state.managers = managers
      } else {
        state.managers = [...state.managers, ...managers]
      }

      state.page = page
      state.totalPages = totalPages
      state.hasMore = hasMore
      state.loading = false
      state.error = null
      state.shouldReload = false
    },
    fetchManagersFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },

    // Add manager
    addManagerStart: (state) => {
      state.loading = true
      state.error = null
    },
    addManagerSuccess: (state) => {
      state.loading = false
      state.error = null
      state.shouldReload = true
      // Reset pagination to reload from beginning
      state.page = 1
      state.hasMore = true
    },
    addManagerFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },

    // Edit manager
    editManagerStart: (state) => {
      state.loading = true
      state.error = null
    },
    editManagerSuccess: (state, action: PayloadAction<Manager>) => {
      const updatedManager = action.payload
      state.managers = state.managers.map((manager) => (manager._id === updatedManager._id ? updatedManager : manager))
      state.loading = false
      state.error = null
      state.shouldReload = true
    },
    editManagerFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },

    // Update managers list
    setManagers: (state, action: PayloadAction<Manager[]>) => {
      state.managers = action.payload
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },

    // Trigger reload
    triggerReload: (state) => {
      state.shouldReload = true
      state.page = 1
      state.hasMore = true
    },

    // Reset reload flag
    resetReload: (state) => {
      state.shouldReload = false
    },

    // Set page
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload
    },

    // Clear error
    clearError: (state) => {
      state.error = null
    },
  },
})

export const {
  fetchManagersStart,
  fetchManagersSuccess,
  fetchManagersFailure,
  addManagerStart,
  addManagerSuccess,
  addManagerFailure,
  editManagerStart,
  editManagerSuccess,
  editManagerFailure,
  setManagers,
  setLoading,
  triggerReload,
  resetReload,
  setPage,
  clearError,
} = managerSlice.actions

export default managerSlice.reducer
