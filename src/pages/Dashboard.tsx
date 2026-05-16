import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  AccessTime,
  BeachAccess,
  TrendingUp,
  People,
  Cake,
  PersonAdd,
  Email,
  Phone,
  Work,
  CalendarToday,
} from '@mui/icons-material';
import { AppDispatch, RootState } from '../store';
import { getTodayAttendance } from '../store/slices/attendanceSlice';
import { getLeaveBalance } from '../store/slices/leaveSlice';
import { format } from 'date-fns';
import api from '../services/api';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { todayAttendance } = useSelector((state: RootState) => state.attendance);
  const { leaveBalance } = useSelector((state: RootState) => state.leave);
  
  const [birthdays, setBirthdays] = useState<any[]>([]);
  const [newJoiners, setNewJoiners] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(getTodayAttendance());
    dispatch(getLeaveBalance());
    
    // Fetch birthdays and new joiners
    const fetchDashboardData = async () => {
      try {
        const [birthdaysRes, joinersRes] = await Promise.all([
          api.get('/dashboard/birthdays'),
          api.get('/dashboard/new-joiners'),
        ]);
        setBirthdays(birthdaysRes.data.birthdays);
        setNewJoiners(joinersRes.data.newJoiners);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };
    
    fetchDashboardData();
  }, [dispatch]);

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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getAvatarColor = (id: number) => {
    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#feca57'];
    return colors[id % colors.length];
  };

  const stats = [
    {
      title: 'Today\'s Status',
      value: todayAttendance?.clockIn ? 'Clocked In' : 'Not Clocked In',
      icon: <AccessTime sx={{ fontSize: 40 }} />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      bgColor: 'rgba(102, 126, 234, 0.1)',
      action: () => navigate('/attendance'),
    },
    {
      title: 'Annual Leave',
      value: `${leaveBalance?.annualLeave || 0} days`,
      icon: <BeachAccess sx={{ fontSize: 40 }} />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      bgColor: 'rgba(240, 147, 251, 0.1)',
      action: () => navigate('/leaves'),
    },
    {
      title: 'Casual Leave',
      value: `${leaveBalance?.casualLeave || 0} days`,
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      bgColor: 'rgba(79, 172, 254, 0.1)',
      action: () => navigate('/leaves'),
    },
    {
      title: 'Department',
      value: user?.department || 'N/A',
      icon: <People sx={{ fontSize: 40 }} />,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      bgColor: 'rgba(67, 233, 123, 0.1)',
      action: () => navigate('/organization'),
    },
  ];

  return (
    <Box>
      <Box 
        sx={{ 
          mb: 4,
          p: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" gutterBottom fontWeight={700}>
            Welcome back, {user?.firstName}! 👋
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '2px solid transparent',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                  borderColor: 'primary.main',
                },
                animation: `fadeInUp 0.5s ease ${index * 0.1}s both`,
                '@keyframes fadeInUp': {
                  from: {
                    opacity: 0,
                    transform: 'translateY(30px)',
                  },
                  to: {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
              }}
              onClick={stat.action}
            >
              <CardContent>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mb: 3 
                  }}
                >
                  <Box
                    sx={{
                      background: stat.gradient,
                      color: 'white',
                      p: 2,
                      borderRadius: 3,
                      display: 'flex',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  gutterBottom
                  sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}
                >
                  {stat.title}
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary' }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom fontWeight={700} sx={{ mb: 3 }}>
                ⚡ Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => navigate('/attendance')}
                  sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                    }
                  }}
                >
                  📍 Mark Attendance
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  onClick={() => navigate('/leaves')}
                  sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      background: 'rgba(99, 102, 241, 0.05)',
                    }
                  }}
                >
                  🏖️ Apply for Leave
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  onClick={() => navigate('/profile')}
                  sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      background: 'rgba(99, 102, 241, 0.05)',
                    }
                  }}
                >
                  👤 Update Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.05) 0%, rgba(239, 68, 68, 0.05) 100%)',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom fontWeight={700} sx={{ mb: 3 }}>
                📋 Your Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  mb: 2.5,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                }}>
                  <Typography variant="body1" color="text.secondary" fontWeight={600}>
                    Employee ID
                  </Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {user?.employeeId}
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  mb: 2.5,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                }}>
                  <Typography variant="body1" color="text.secondary" fontWeight={600}>
                    Designation
                  </Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {user?.designation}
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  mb: 2.5,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                }}>
                  <Typography variant="body1" color="text.secondary" fontWeight={600}>
                    Department
                  </Typography>
                  <Typography variant="body1" fontWeight={700}>
                    {user?.department}
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                }}>
                  <Typography variant="body1" color="text.secondary" fontWeight={600}>
                    Role
                  </Typography>
                  <Chip
                    label={user?.role}
                    size="medium"
                    sx={{ 
                      textTransform: 'capitalize',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Birthdays and New Joiners Section */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Birthdays This Month */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.05) 0%, rgba(245, 87, 108, 0.05) 100%)',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    p: 1.5,
                    borderRadius: 2,
                    display: 'flex',
                    mr: 2,
                  }}
                >
                  <Cake sx={{ fontSize: 28 }} />
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  🎂 Birthdays Today
                </Typography>
              </Box>
              
              {birthdays.length > 0 ? (
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {birthdays.map((employee, index) => {
                    const birthDate = new Date(employee.dateOfBirth);
                    const isToday = birthDate.getDate() === new Date().getDate();
                    
                    return (
                      <React.Fragment key={employee.id}>
                        <ListItem
                          sx={{
                            borderRadius: 2,
                            mb: 1,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            bgcolor: isToday ? 'rgba(240, 147, 251, 0.15)' : 'background.paper',
                            border: isToday ? '2px solid #f093fb' : 'none',
                            '&:hover': {
                              bgcolor: 'rgba(240, 147, 251, 0.1)',
                              transform: 'translateX(8px)',
                            },
                          }}
                          onClick={() => handleEmployeeClick(employee.id)}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: getAvatarColor(employee.id), fontWeight: 700 }}>
                              {getInitials(employee.firstName, employee.lastName)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body1" fontWeight={600}>
                                  {employee.firstName} {employee.lastName}
                                </Typography>
                                {isToday && (
                                  <Chip 
                                    label="Today!" 
                                    size="small" 
                                    sx={{ 
                                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                      color: 'white',
                                      fontWeight: 700,
                                      animation: 'pulse 2s infinite',
                                      '@keyframes pulse': {
                                        '0%, 100%': { transform: 'scale(1)' },
                                        '50%': { transform: 'scale(1.05)' },
                                      },
                                    }}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  {employee.designation} • {employee.department}
                                </Typography>
                                <Typography variant="caption" display="block" sx={{ fontWeight: 600, color: '#f093fb' }}>
                                  {format(birthDate, 'MMMM d')}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < birthdays.length - 1 && <Divider sx={{ my: 0.5 }} />}
                      </React.Fragment>
                    );
                  })}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Cake sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No birthdays today 🎉
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Check back tomorrow!
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* New Joiners This Month */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.05) 0%, rgba(56, 249, 215, 0.05) 100%)',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    color: 'white',
                    p: 1.5,
                    borderRadius: 2,
                    display: 'flex',
                    mr: 2,
                  }}
                >
                  <PersonAdd sx={{ fontSize: 28 }} />
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  👋 New Joiners (Last 30 Days)
                </Typography>
              </Box>
              
              {newJoiners.length > 0 ? (
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {newJoiners.map((employee, index) => {
                    const joinDate = new Date(employee.dateOfJoining);
                    const daysAgo = Math.floor((new Date().getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <React.Fragment key={employee.id}>
                        <ListItem
                          sx={{
                            borderRadius: 2,
                            mb: 1,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            bgcolor: 'background.paper',
                            '&:hover': {
                              bgcolor: 'rgba(67, 233, 123, 0.1)',
                              transform: 'translateX(8px)',
                            },
                          }}
                          onClick={() => handleEmployeeClick(employee.id)}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: getAvatarColor(employee.id), fontWeight: 700 }}>
                              {getInitials(employee.firstName, employee.lastName)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body1" fontWeight={600}>
                                  {employee.firstName} {employee.lastName}
                                </Typography>
                                {daysAgo === 0 && (
                                  <Chip 
                                    label="New!" 
                                    size="small" 
                                    sx={{ 
                                      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                                      color: 'white',
                                      fontWeight: 700,
                                    }}
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  {employee.designation} • {employee.department}
                                </Typography>
                                <Typography variant="caption" display="block" sx={{ fontWeight: 600, color: '#43e97b' }}>
                                  Joined {format(joinDate, 'MMM d, yyyy')} {daysAgo > 0 && `(${daysAgo} days ago)`}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < newJoiners.length - 1 && <Divider sx={{ my: 0.5 }} />}
                      </React.Fragment>
                    );
                  })}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <PersonAdd sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No new joiners in the last 30 days
                  </Typography>
                </Box>
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
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Phone sx={{ color: 'primary.main' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Phone</Typography>
                      <Typography variant="body2" fontWeight={600}>{selectedEmployee.phone}</Typography>
                    </Box>
                  </Box>
                </Grid>
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
    </Box>
  );
};

export default Dashboard;
