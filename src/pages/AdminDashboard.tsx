import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  InputAdornment,
} from '@mui/material';
import { Edit, Add, Search, AdminPanelSettings } from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../services/api';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const AdminDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
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
    role: 'employee',
    isActive: true,
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAllUsers();
    }
  }, [user]);

  useEffect(() => {
    // Filter users based on search query
    if (searchQuery.trim() === '') {
      setFilteredUsers(allUsers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = allUsers.filter(
        (u) =>
          u.firstName.toLowerCase().includes(query) ||
          u.lastName.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.employeeId.toLowerCase().includes(query) ||
          u.department.toLowerCase().includes(query) ||
          u.designation.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, allUsers]);

  const fetchAllUsers = async () => {
    try {
      const response = await api.get('/users');
      setAllUsers(response.data.users || []);
      setFilteredUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
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
      role: 'employee',
      isActive: true,
    });
    setUserDialogOpen(true);
  };

  const handleEditUser = (userToEdit: any) => {
    setEditingUser(userToEdit);
    setUserFormData({
      email: userToEdit.email,
      firstName: userToEdit.firstName,
      lastName: userToEdit.lastName,
      employeeId: userToEdit.employeeId,
      designation: userToEdit.designation,
      department: userToEdit.department,
      dateOfJoining: userToEdit.dateOfJoining
        ? format(new Date(userToEdit.dateOfJoining), 'yyyy-MM-dd')
        : '',
      phone: userToEdit.phone || '',
      dateOfBirth: userToEdit.dateOfBirth
        ? format(new Date(userToEdit.dateOfBirth), 'yyyy-MM-dd')
        : '',
      gender: userToEdit.gender || '',
      experience: userToEdit.experience || '',
      role: userToEdit.role || 'employee',
      isActive: userToEdit.isActive !== undefined ? userToEdit.isActive : true,
    });
    setUserDialogOpen(true);
  };

  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserFormData({ ...userFormData, [name]: value });
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
          managerId: user?.id,
        });
        setMessage({
          type: 'success',
          text: `User created successfully! Default password: ${response.data.defaultPassword}`,
        });
      }
      setUserDialogOpen(false);
      fetchAllUsers();
      setTimeout(() => setMessage(null), 5000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to save user',
      });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      case 'employee':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'default';
  };

  if (user?.role !== 'admin') {
    return (
      <Box>
        <Alert severity="warning">You don't have permission to access this page.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <AdminPanelSettings sx={{ fontSize: 40, color: 'error.main' }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" fontWeight={600}>
            Admin Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage all users and system settings
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={handleCreateUser}>
          Add User
        </Button>
      </Box>

      {message && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search by name, email, employee ID, department, or designation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Typography variant="h6" gutterBottom fontWeight={600}>
            All Users ({filteredUsers.length})
          </Typography>

          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Designation</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Experience</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      {searchQuery ? 'No users found matching your search' : 'No users found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((userItem) => (
                    <TableRow key={userItem.id}>
                      <TableCell>{userItem.employeeId}</TableCell>
                      <TableCell>
                        {userItem.firstName} {userItem.lastName}
                      </TableCell>
                      <TableCell>{userItem.email}</TableCell>
                      <TableCell>{userItem.designation}</TableCell>
                      <TableCell>{userItem.department}</TableCell>
                      <TableCell>
                        <Chip
                          label={userItem.role}
                          color={getRoleColor(userItem.role) as any}
                          size="small"
                          sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>{userItem.experience || 0} years</TableCell>
                      <TableCell>
                        <Chip
                          label={userItem.isActive ? 'Active' : 'Inactive'}
                          color={getStatusColor(userItem.isActive) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditUser(userItem)}
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
      </Card>

      {/* User Create/Edit Dialog */}
      <Dialog
        open={userDialogOpen}
        onClose={() => setUserDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
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
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Role"
                name="role"
                value={userFormData.role}
                onChange={handleUserFormChange}
                required
              >
                <MenuItem value="employee">Employee</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Status"
                name="isActive"
                value={userFormData.isActive ? 'true' : 'false'}
                onChange={(e) =>
                  setUserFormData({
                    ...userFormData,
                    isActive: e.target.value === 'true',
                  })
                }
                required
              >
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </TextField>
            </Grid>
          </Grid>
          {!editingUser && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Default password will be: <strong>Welcome@123</strong>
              <br />
              Please share this with the user.
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
            {editingUser ? 'Update User' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
