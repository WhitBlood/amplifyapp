import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Button, Card, CardContent, Alert } from '@mui/material';
import { AppDispatch, RootState } from '../store';
import { clockIn, clockOut, getTodayAttendance } from '../store/slices/attendanceSlice';

const AttendanceMinimal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { todayAttendance } = useSelector((state: RootState) => state.attendance);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    console.log('AttendanceMinimal: Component mounted');
    dispatch(getTodayAttendance());
  }, [dispatch]);

  console.log('AttendanceMinimal: Rendering, todayAttendance =', todayAttendance);

  const handleClockIn = async () => {
    try {
      await dispatch(clockIn()).unwrap();
      setMessage({ type: 'success', text: 'Clocked in successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error || 'Failed to clock in' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleClockOut = async () => {
    try {
      await dispatch(clockOut()).unwrap();
      setMessage({ type: 'success', text: 'Clocked out successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error || 'Failed to clock out' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Attendance (Minimal Version)
      </Typography>
      
      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}
      
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6">Today's Status</Typography>
          <Typography>Clock In: {todayAttendance?.clockIn || 'Not clocked in'}</Typography>
          <Typography>Clock Out: {todayAttendance?.clockOut || 'Not clocked out'}</Typography>
          
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleClockIn}
              disabled={!!todayAttendance?.clockIn}
            >
              Clock In
            </Button>
            <Button 
              variant="outlined" 
              color="secondary" 
              sx={{ ml: 2 }}
              onClick={handleClockOut}
              disabled={!todayAttendance?.clockIn || !!todayAttendance?.clockOut}
            >
              Clock Out
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AttendanceMinimal;
