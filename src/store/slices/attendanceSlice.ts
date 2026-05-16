import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

interface Attendance {
  id: number;
  userId: number;
  date: string;
  clockIn?: string;
  clockOut?: string;
  status: string;
  workHours?: number;
}

interface AttendanceState {
  todayAttendance: Attendance | null;
  attendanceHistory: Attendance[];
  loading: boolean;
  error: string | null;
}

const initialState: AttendanceState = {
  todayAttendance: null,
  attendanceHistory: [],
  loading: false,
  error: null,
};

export const clockIn = createAsyncThunk('attendance/clockIn', async (_, { rejectWithValue }) => {
  try {
    const response = await api.post('/attendance/clock-in');
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Clock in failed');
  }
});

export const clockOut = createAsyncThunk('attendance/clockOut', async (_, { rejectWithValue }) => {
  try {
    const response = await api.post('/attendance/clock-out');
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Clock out failed');
  }
});

export const getTodayAttendance = createAsyncThunk(
  'attendance/getTodayAttendance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/attendance/my-attendance');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get attendance');
    }
  }
);

export const getAttendanceHistory = createAsyncThunk(
  'attendance/getAttendanceHistory',
  async (params: { startDate?: string; endDate?: string; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await api.get('/attendance/history', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get history');
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(clockIn.fulfilled, (state, action) => {
        state.todayAttendance = action.payload.attendance;
      })
      .addCase(clockOut.fulfilled, (state, action) => {
        state.todayAttendance = action.payload.attendance;
      })
      .addCase(getTodayAttendance.fulfilled, (state, action) => {
        state.todayAttendance = action.payload.attendance;
      })
      .addCase(getAttendanceHistory.fulfilled, (state, action) => {
        state.attendanceHistory = action.payload.attendances;
      });
  },
});

export const { clearError } = attendanceSlice.actions;
export default attendanceSlice.reducer;
