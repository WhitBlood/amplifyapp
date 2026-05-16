import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { AppDispatch, RootState } from '../store';
import { applyLeave, getMyLeaves, getLeaveBalance } from '../store/slices/leaveSlice';
import { format } from 'date-fns';

const leaveTypes = [
  { value: 'sick', label: 'Sick Leave' },
  { value: 'casual', label: 'Casual Leave' },
  { value: 'annual', label: 'Annual Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' },
  { value: 'maternity', label: 'Maternity Leave' },
  { value: 'paternity', label: 'Paternity Leave' },
];

const LeaveManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { leaves, leaveBalance, error } = useSelector((state: RootState) => state.leave);
  const [openDialog, setOpenDialog] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    days: '',
    reason: '',
  });

  useEffect(() => {
    dispatch(getMyLeaves({}));
    dispatch(getLeaveBalance());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setMessage({ type: 'error', text: error });
      setTimeout(() => setMessage(null), 5000);
    }
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setFormData({ ...formData, days: diffDays.toString() });
    }
  };

  useEffect(() => {
    calculateDays();
  }, [formData.startDate, formData.endDate]);

  const handleSubmit = async () => {
    try {
      await dispatch(
        applyLeave({
          ...formData,
          days: parseFloat(formData.days),
        })
      ).unwrap();
      setMessage({ type: 'success', text: 'Leave application submitted successfully!' });
      setOpenDialog(false);
      setFormData({ leaveType: '', startDate: '', endDate: '', days: '', reason: '' });
      dispatch(getMyLeaves({}));
      dispatch(getLeaveBalance());
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error || 'Failed to apply leave' });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Leave Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Apply Leave
        </Button>
      </Box>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Sick Leave
              </Typography>
              <Typography variant="h4" fontWeight={600}>
                {leaveBalance?.sickLeave || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                days remaining
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Casual Leave
              </Typography>
              <Typography variant="h4" fontWeight={600}>
                {leaveBalance?.casualLeave || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                days remaining
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Annual Leave
              </Typography>
              <Typography variant="h4" fontWeight={600}>
                {leaveBalance?.annualLeave || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                days remaining
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Leaves
              </Typography>
              <Typography variant="h4" fontWeight={600}>
                {leaves.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                applications
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Leave History
              </Typography>
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Leave Type</TableCell>
                      <TableCell>Start Date</TableCell>
                      <TableCell>End Date</TableCell>
                      <TableCell>Days</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaves.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No leave applications found
                        </TableCell>
                      </TableRow>
                    ) : (
                      leaves.map((leave) => (
                        <TableRow key={leave.id}>
                          <TableCell sx={{ textTransform: 'capitalize' }}>
                            {leave.leaveType}
                          </TableCell>
                          <TableCell>
                            {format(new Date(leave.startDate), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>{leave.days}</TableCell>
                          <TableCell>{leave.reason}</TableCell>
                          <TableCell>
                            <Chip
                              label={leave.status}
                              color={getStatusColor(leave.status) as any}
                              size="small"
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply for Leave</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              select
              fullWidth
              label="Leave Type"
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              required
            >
              {leaveTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="End Date"
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              fullWidth
              label="Number of Days"
              name="days"
              value={formData.days}
              onChange={handleChange}
              type="number"
              required
            />
            <TextField
              fullWidth
              label="Reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              multiline
              rows={3}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !formData.leaveType ||
              !formData.startDate ||
              !formData.endDate ||
              !formData.days ||
              !formData.reason
            }
          >
            Submit Application
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveManagement;
