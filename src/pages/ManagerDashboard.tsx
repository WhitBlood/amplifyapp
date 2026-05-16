import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Alert,
  IconButton,
} from '@mui/material';
import { CheckCircle, Cancel, Edit, Add, Visibility } from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ManagerDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [teamLeaves, setTeamLeaves] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // User management states
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userFormData, setUserFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    employeeId: '',
    designation: '',
    department: '',
    dateOfJoining: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    experience: '',
  });

  useEffect(() => {
    if (user?.role === 'manager' || user?.role === 'admin') {
      fetchTeamLeaves();
      fetchTeamMembers();
    }
  }, [user]);

  const fetchTeamLeaves = async () => {
    try {
      const response = await api.get('/leaves/team');
      setTeamLeaves(response.data.leaves || []);
    } catch (error) {
      console.error('Failed to fetch team leaves:', error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await api.get('/users/team-members');
      setTeamMembers(response.data.teamMembers || []);
    } catch (error) {
      console.error('Failed to fetch team members:', error);
    }
  };

  const handleLeaveAction = async (leaveId: number, status: 'approved' | 'rejected') => {
    try {
      await api.put(`/leaves/${leaveId}/status`, {
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : undefined,
      });
      setMessage({ type: 'success', text: `Leave ${status} successfully!` });
      setLeaveDialogOpen(false);
      setSelectedLeave(null);
      setRejectionReason('');
      fetchTeamLeaves();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update leave status' });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setUserFormData({
      email: '',
      firstName: '',
      lastName: '',
      employeeId: '',
      designation: '',
      department: '',
      dateOfJoining: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      experience: '',
    });
    setUserDialogOpen(true);
  };

  const handleEditUser = (member: any) => {
    setEditingUser(member);
    setUserFormData({
      email: member.email,
      firstName: member.firstName,
      lastName: member.lastName,
      employeeId: member.employeeId,
      designation: member.designation,
      department: member.department,
      dateOfJoining: member.dateOfJoining ? format(new Date(member.dateOfJoining), 'yyyy-MM-dd') : '',
      phone: member.phone || '',
      dateOfBirth: member.dateOfBirth ? format(new Date(member.dateOfBirth), 'yyyy-MM-dd') : '',
      gender: member.gender || '',
      experience: member.experience || '',
    });
    setUserDialogOpen(true);
  };

  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserFormData({ ...userFormData, [e.target.name]: e.target.value });
  };

  const handleUserSubmit = async () => {
    try {
      if (editingUser) {
        // Update existing user
        await api.put(`/users/${editingUser.id}`, userFormData);
        setMessage({ type: 'success', text: 'User updated successfully!' });
      } else {
        // Create new user
        const response = await api.post('/users', {
          ...userFormData,
          role: 'employee',
          managerId: user?.id,
        });
        setMessage({
          type: 'success',
          text: `User created successfully! Default password: ${response.data.defaultPassword}`,
        });
      }
      setUserDialogOpen(false);
      fetchTeamMembers();
      setTimeout(() => setMessage(null), 5000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save user' });
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
      default:
        return 'default';
    }
  };

  if (user?.role !== 'manager' && user?.role !== 'admin') {
    return (
      <Box>
        <Alert severity="warning">You don't have permission to access this page.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Manager Dashboard
      </Typography>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Card>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Leave Approvals" />
          <Tab label="Team Management" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Pending Leave Requests
            </Typography>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Leave Type</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Days</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teamLeaves.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No leave requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    teamLeaves.map((leave) => (
                      <TableRow key={leave.id}>
                        <TableCell>
                          {leave.user?.firstName} {leave.user?.lastName}
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {leave.user?.employeeId}
                          </Typography>
                        </TableCell>
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
                        <TableCell>
                          {leave.status === 'pending' ? (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleLeaveAction(leave.id, 'approved')}
                                title="Approve"
                              >
                                <CheckCircle />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  setSelectedLeave(leave);
                                  setLeaveDialogOpen(true);
                                }}
                                title="Reject"
                              >
                                <Cancel />
                              </IconButton>
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              {leave.status}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Team Members
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateUser}
              >
                Add Employee
              </Button>
            </Box>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Designation</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Experience</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teamMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No team members found
                      </TableCell>
                    </TableRow>
                  ) : (
                    teamMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.employeeId}</TableCell>
                        <TableCell>
                          {member.firstName} {member.lastName}
                        </TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.designation}</TableCell>
                        <TableCell>{member.department}</TableCell>
                        <TableCell>{member.experience || 0} years</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditUser(member)}
                            title="Edit"
                          >
                            <Edit />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </TabPanel>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={leaveDialogOpen} onClose={() => setLeaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Leave Request</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Rejection Reason"
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            sx={{ mt: 2 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => selectedLeave && handleLeaveAction(selectedLeave.id, 'rejected')}
            variant="contained"
            color="error"
            disabled={!rejectionReason}
          >
            Reject Leave
          </Button>
        </DialogActions>
      </Dialog>

      {/* User Create/Edit Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingUser ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={userFormData.firstName}
                onChange={handleUserFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={userFormData.lastName}
                onChange={handleUserFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={userFormData.email}
                onChange={handleUserFormChange}
                required
                disabled={!!editingUser}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Employee ID"
                name="employeeId"
                value={userFormData.employeeId}
                onChange={handleUserFormChange}
                required
                disabled={!!editingUser}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Designation"
                name="designation"
                value={userFormData.designation}
                onChange={handleUserFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                name="department"
                value={userFormData.department}
                onChange={handleUserFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Joining"
                name="dateOfJoining"
                type="date"
                value={userFormData.dateOfJoining}
                onChange={handleUserFormChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={userFormData.dateOfBirth}
                onChange={handleUserFormChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={userFormData.phone}
                onChange={handleUserFormChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Gender"
                name="gender"
                value={userFormData.gender}
                onChange={handleUserFormChange}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Years of Experience"
                name="experience"
                type="number"
                value={userFormData.experience}
                onChange={handleUserFormChange}
              />
            </Grid>
          </Grid>
          {!editingUser && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Default password will be: <strong>Welcome@123</strong>
              <br />
              Please share this with the employee.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUserSubmit}
            variant="contained"
            disabled={
              !userFormData.firstName ||
              !userFormData.lastName ||
              !userFormData.email ||
              !userFormData.employeeId ||
              !userFormData.designation ||
              !userFormData.department
            }
          >
            {editingUser ? 'Update Employee' : 'Create Employee'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManagerDashboard;
