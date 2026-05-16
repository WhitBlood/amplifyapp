import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { 
  AccountTree, 
  Business, 
  Email, 
  Phone, 
  Work, 
  CalendarToday, 
  Cake, 
  PersonAdd 
} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../services/api';

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  employeeId: string;
  designation: string;
  department: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  dateOfJoining?: string;
  children?: Employee[];
}

interface Department {
  department: string;
  employee_count: number;
}

const Organization: React.FC = () => {
  const [hierarchy, setHierarchy] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [departmentEmployees, setDepartmentEmployees] = useState<any[]>([]);
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

  useEffect(() => {
    fetchOrganizationData();
  }, []);

  const fetchOrganizationData = async () => {
    try {
      const [hierarchyRes, departmentsRes] = await Promise.all([
        api.get('/organization/hierarchy'),
        api.get('/organization/departments'),
      ]);
      setHierarchy(hierarchyRes.data.hierarchy || []);
      setDepartments(departmentsRes.data.departments || []);
    } catch (error) {
      console.error('Failed to fetch organization data:', error);
    }
  };

  const handleDepartmentClick = async (departmentName: string) => {
    try {
      const response = await api.get(`/organization/departments/${encodeURIComponent(departmentName)}`);
      setDepartmentEmployees(response.data.employees || []);
      setSelectedDepartment(departmentName);
      setDepartmentDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch department employees:', error);
    }
  };

  const handleEmployeeClick = async (employeeId: number) => {
    try {
      const response = await api.get(`/users/${employeeId}`);
      setSelectedEmployee(response.data.user);
      setProfileDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch employee profile:', error);
    }
  };

  const handleCloseProfile = () => {
    setProfileDialogOpen(false);
    setSelectedEmployee(null);
  };

  const handleCloseDepartment = () => {
    setDepartmentDialogOpen(false);
    setDepartmentEmployees([]);
    setSelectedDepartment('');
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getAvatarColor = (id: number) => {
    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#feca57'];
    return colors[id % colors.length];
  };

  const renderEmployee = (employee: Employee, level: number = 0) => (
    <Box key={employee.id} sx={{ ml: level * 4 }}>
      <Card 
        sx={{ 
          mb: 2,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }
        }}
        onClick={() => handleEmployeeClick(employee.id)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: getAvatarColor(employee.id), fontWeight: 700 }}>
              {getInitials(employee.firstName, employee.lastName)}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight={600}>
                {employee.firstName} {employee.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {employee.designation} • {employee.department}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {employee.email} • ID: {employee.employeeId}
              </Typography>
            </Box>
            {level === 0 && (
              <Chip 
                label="Top Level" 
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
        </CardContent>
      </Card>
      {employee.children &&
        employee.children.map((child) => renderEmployee(child, level + 1))}
    </Box>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Organization
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Business sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  Departments
                </Typography>
              </Box>
              <List>
                {departments.map((dept, index) => (
                  <ListItem 
                    key={index} 
                    sx={{ 
                      px: 0,
                      cursor: 'pointer',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: 'rgba(99, 102, 241, 0.1)',
                        transform: 'translateX(8px)',
                      }
                    }}
                    onClick={() => handleDepartmentClick(dept.department)}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: getAvatarColor(index),
                        fontWeight: 700,
                      }}>
                        <Business />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight={600}>
                          {dept.department}
                        </Typography>
                      }
                      secondary={`${dept.employee_count} employees`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <AccountTree sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  Organization Hierarchy
                </Typography>
              </Box>
              {hierarchy.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center">
                  No hierarchy data available
                </Typography>
              ) : (
                <Box>{hierarchy.map((employee) => renderEmployee(employee))}</Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Employee Profile Dialog */}
      <Dialog 
        open={profileDialogOpen} 
        onClose={handleCloseProfile}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          }
        }}
      >
        {selectedEmployee && (
          <>
            <DialogTitle sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              pb: 3,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar 
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    bgcolor: 'rgba(255,255,255,0.3)',
                    fontSize: '1.5rem',
                    fontWeight: 700,
                  }}
                >
                  {getInitials(selectedEmployee.firstName, selectedEmployee.lastName)}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {selectedEmployee.designation}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Email sx={{ color: 'primary.main' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Email</Typography>
                      <Typography variant="body2" fontWeight={600}>{selectedEmployee.email}</Typography>
                    </Box>
                  </Box>
                </Grid>
                {selectedEmployee.phone && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                      <Phone sx={{ color: 'primary.main' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Phone</Typography>
                        <Typography variant="body2" fontWeight={600}>{selectedEmployee.phone}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Work sx={{ color: 'primary.main' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Department</Typography>
                      <Typography variant="body2" fontWeight={600}>{selectedEmployee.department}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <CalendarToday sx={{ color: 'primary.main' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Employee ID</Typography>
                      <Typography variant="body2" fontWeight={600}>{selectedEmployee.employeeId}</Typography>
                    </Box>
                  </Box>
                </Grid>
                {selectedEmployee.dateOfBirth && (
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                      <Cake sx={{ color: 'primary.main' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Birthday</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {format(new Date(selectedEmployee.dateOfBirth), 'MMM d, yyyy')}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
                {selectedEmployee.dateOfJoining && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                      <PersonAdd sx={{ color: 'primary.main' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Date of Joining</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {format(new Date(selectedEmployee.dateOfJoining), 'MMM d, yyyy')}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button 
                onClick={handleCloseProfile}
                variant="contained"
                fullWidth
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Department Employees Dialog */}
      <Dialog 
        open={departmentDialogOpen} 
        onClose={handleCloseDepartment}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          color: 'white',
          pb: 3,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Business sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {selectedDepartment}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {departmentEmployees.length} {departmentEmployees.length === 1 ? 'Employee' : 'Employees'}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {departmentEmployees.length > 0 ? (
            <Grid container spacing={2}>
              {departmentEmployees.map((employee) => (
                <Grid item xs={12} sm={6} key={employee.id}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      }
                    }}
                    onClick={() => {
                      handleCloseDepartment();
                      handleEmployeeClick(employee.id);
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: getAvatarColor(employee.id), fontWeight: 700, width: 48, height: 48 }}>
                          {getInitials(employee.firstName, employee.lastName)}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1" fontWeight={600}>
                            {employee.firstName} {employee.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {employee.designation}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {employee.employeeId}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Business sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                No employees in this department
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseDepartment}
            variant="contained"
            fullWidth
            sx={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Organization;
