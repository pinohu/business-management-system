import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { useApi } from '../../hooks/useApi';

// Async thunks
export const fetchData = createAsyncThunk(
  'data/fetchData',
  async ({ endpoint, params }, { rejectWithValue }) => {
    try {
      const api = useApi();
      const response = await api.get(endpoint, { params });
      return { endpoint, data: response.data };
    } catch (error) {
      return rejectWithValue({ endpoint, error: error.response.data });
    }
  }
);

export const createData = createAsyncThunk(
  'data/createData',
  async ({ endpoint, data }, { rejectWithValue }) => {
    try {
      const api = useApi();
      const response = await api.post(endpoint, data);
      return { endpoint, data: response.data };
    } catch (error) {
      return rejectWithValue({ endpoint, error: error.response.data });
    }
  }
);

export const updateData = createAsyncThunk(
  'data/updateData',
  async ({ endpoint, id, data }, { rejectWithValue }) => {
    try {
      const api = useApi();
      const response = await api.put(`${endpoint}/${id}`, data);
      return { endpoint, id, data: response.data };
    } catch (error) {
      return rejectWithValue({ endpoint, id, error: error.response.data });
    }
  }
);

export const deleteData = createAsyncThunk(
  'data/deleteData',
  async ({ endpoint, id }, { rejectWithValue }) => {
    try {
      const api = useApi();
      await api.delete(`${endpoint}/${id}`);
      return { endpoint, id };
    } catch (error) {
      return rejectWithValue({ endpoint, id, error: error.response.data });
    }
  }
);

const initialState = {
  items: {},
  loading: {},
  errors: {},
  lastUpdated: {},
  pagination: {},
  filters: {},
  sort: {},
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    clearError: (state, action) => {
      const { endpoint } = action.payload;
      if (state.errors[endpoint]) {
        delete state.errors[endpoint];
      }
    },
    setFilter: (state, action) => {
      const { endpoint, filter } = action.payload;
      state.filters[endpoint] = filter;
    },
    setSort: (state, action) => {
      const { endpoint, sort } = action.payload;
      state.sort[endpoint] = sort;
    },
    clearData: (state, action) => {
      const { endpoint } = action.payload;
      if (state.items[endpoint]) {
        delete state.items[endpoint];
      }
      if (state.loading[endpoint]) {
        delete state.loading[endpoint];
      }
      if (state.errors[endpoint]) {
        delete state.errors[endpoint];
      }
      if (state.lastUpdated[endpoint]) {
        delete state.lastUpdated[endpoint];
      }
      if (state.pagination[endpoint]) {
        delete state.pagination[endpoint];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Data
      .addCase(fetchData.pending, (state, action) => {
        const { endpoint } = action.meta.arg;
        state.loading[endpoint] = true;
        if (state.errors[endpoint]) {
          delete state.errors[endpoint];
        }
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        const { endpoint, data } = action.payload;
        state.items[endpoint] = data;
        state.loading[endpoint] = false;
        state.lastUpdated[endpoint] = new Date().toISOString();
      })
      .addCase(fetchData.rejected, (state, action) => {
        const { endpoint, error } = action.payload;
        state.loading[endpoint] = false;
        state.errors[endpoint] = error.message || 'Failed to fetch data';
      })
      // Create Data
      .addCase(createData.pending, (state, action) => {
        const { endpoint } = action.meta.arg;
        state.loading[endpoint] = true;
        if (state.errors[endpoint]) {
          delete state.errors[endpoint];
        }
      })
      .addCase(createData.fulfilled, (state, action) => {
        const { endpoint, data } = action.payload;
        if (!state.items[endpoint]) {
          state.items[endpoint] = [];
        }
        state.items[endpoint].push(data);
        state.loading[endpoint] = false;
        state.lastUpdated[endpoint] = new Date().toISOString();
      })
      .addCase(createData.rejected, (state, action) => {
        const { endpoint, error } = action.payload;
        state.loading[endpoint] = false;
        state.errors[endpoint] = error.message || 'Failed to create data';
      })
      // Update Data
      .addCase(updateData.pending, (state, action) => {
        const { endpoint } = action.meta.arg;
        state.loading[endpoint] = true;
        if (state.errors[endpoint]) {
          delete state.errors[endpoint];
        }
      })
      .addCase(updateData.fulfilled, (state, action) => {
        const { endpoint, id, data } = action.payload;
        if (state.items[endpoint]) {
          const index = state.items[endpoint].findIndex(item => item.id === id);
          if (index !== -1) {
            state.items[endpoint][index] = data;
          }
        }
        state.loading[endpoint] = false;
        state.lastUpdated[endpoint] = new Date().toISOString();
      })
      .addCase(updateData.rejected, (state, action) => {
        const { endpoint, error } = action.payload;
        state.loading[endpoint] = false;
        state.errors[endpoint] = error.message || 'Failed to update data';
      })
      // Delete Data
      .addCase(deleteData.pending, (state, action) => {
        const { endpoint } = action.meta.arg;
        state.loading[endpoint] = true;
        if (state.errors[endpoint]) {
          delete state.errors[endpoint];
        }
      })
      .addCase(deleteData.fulfilled, (state, action) => {
        const { endpoint, id } = action.payload;
        if (state.items[endpoint]) {
          state.items[endpoint] = state.items[endpoint].filter(item => item.id !== id);
        }
        state.loading[endpoint] = false;
        state.lastUpdated[endpoint] = new Date().toISOString();
      })
      .addCase(deleteData.rejected, (state, action) => {
        const { endpoint, error } = action.payload;
        state.loading[endpoint] = false;
        state.errors[endpoint] = error.message || 'Failed to delete data';
      });
  },
});

export const { clearError, setFilter, setSort, clearData } = dataSlice.actions;

export default dataSlice.reducer; 