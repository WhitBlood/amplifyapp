import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

interface Leave {
  id: number;
  userId: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: string;
  approvedBy?: number;
  approvedAt?: string;
}

interface LeaveBalance {
  id: number;
  userId: number;
  year: number;
  sickLeave: number;
  casualLeave: number;
  annualLeave: number;
  maternityLeave: number;
  paternityLeave: number;
}

interface LeaveState {
  leaves: Leave[];
  leaveBalance: LeaveBalance | null;
  loading: boolean;
  error: string | null;
}

const initialState: LeaveState = {
  leaves: [],
  leaveBalance: null,
  loading: false,
  error: null,
};

export const applyLeave = createAsyncThunk(
  'leave/applyLeave',
  async (leaveData: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/leaves/apply', leaveData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to apply leave');
    }
  }
);

export const getMyLeaves = createAsyncThunk(
  'leave/getMyLeaves',
  async (params: { status?: string; year?: number }, { rejectWithValue }) => {
    try {
      const response = await api.get('/leaves/my-leaves', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get leaves');
    }
  }
);

export const getLeaveBalance = createAsyncThunk(
  'leave/getLeaveBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/leaves/balance');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get balance');
    }
  }
);

const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyLeave.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves.unshift(action.payload.leave);
      })
      .addCase(applyLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getMyLeaves.fulfilled, (state, action) => {
        state.leaves = action.payload.leaves;
      })
      .addCase(getLeaveBalance.fulfilled, (state, action) => {
        state.leaveBalance = action.payload.leaveBalance;
      });
  },
});

export const { clearError } = leaveSlice.actions;
export default leaveSlice.reducer;
