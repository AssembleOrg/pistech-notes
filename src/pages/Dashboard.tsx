import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Note as NoteIcon,
  Business as BusinessIcon,
  Payment as PaymentIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { formatCurrency } from '../utils/formatters';
import { apiService } from '../services/apiService';

interface DashboardStats {
  totalNotes: number;
  totalProjects: number;
  totalClientCharges: number;
  totalPartnerPayments: number;
  totalRevenue: number;
  totalExpenses: number;
  netAmount: number;
  recentActivity: Array<{
    type: 'note' | 'project' | 'charge' | 'payment';
    title: string;
    amount?: number;
    currency?: string;
    date: Date;
  }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalNotes: 0,
    totalProjects: 0,
    totalClientCharges: 0,
    totalPartnerPayments: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netAmount: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [notes, projects, clientCharges, partnerPayments] = await Promise.all([
          apiService.getNotes(),
          apiService.getProjects(),
          apiService.getClientCharges(),
          apiService.getPartnerPayments(),
        ]);

        // Calculate totals
        const totalRevenue = clientCharges.reduce((sum, charge) => sum + charge.amount, 0);
        const totalExpenses = partnerPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const netAmount = totalRevenue - totalExpenses;

        // Create recent activity
        const recentActivity = [
          ...notes.slice(0, 3).map(note => ({
            type: 'note' as const,
            title: note.title,
            date: new Date(note.createdAt),
          })),
          ...projects.slice(0, 3).map(project => ({
            type: 'project' as const,
            title: project.name,
            amount: project.amount,
            currency: project.currency,
            date: new Date(project.createdAt),
          })),
          ...clientCharges.slice(0, 3).map(charge => ({
            type: 'charge' as const,
            title: `Cobro - ${charge.description || 'Sin descripción'}`,
            amount: charge.amount,
            currency: charge.currency,
            date: new Date(charge.date),
          })),
          ...partnerPayments.slice(0, 3).map(payment => ({
            type: 'payment' as const,
            title: `Pago - ${payment.description || 'Sin descripción'}`,
            amount: payment.amount,
            currency: payment.currency,
            date: new Date(payment.date),
          })),
        ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 6);

        setStats({
          totalNotes: notes.length,
          totalProjects: projects.length,
          totalClientCharges: clientCharges.length,
          totalPartnerPayments: partnerPayments.length,
          totalRevenue,
          totalExpenses,
          netAmount,
          recentActivity,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error cargando datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getStatCard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info',
    subtitle?: string
  ) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          backgroundColor: `${color}.main`,
        },
      }}
    >
      <CardContent sx={{ p: 3, flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: `${color}.main` }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: `${color}.50`,
              color: `${color}.main`,
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'note':
        return <NoteIcon fontSize="small" />;
      case 'project':
        return <BusinessIcon fontSize="small" />;
      case 'charge':
        return <PaymentIcon fontSize="small" />;
      case 'payment':
        return <PaymentIcon fontSize="small" />;
      default:
        return <NoteIcon fontSize="small" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'note':
        return 'info';
      case 'project':
        return 'primary';
      case 'charge':
        return 'success';
      case 'payment':
        return 'warning';
      default:
        return 'info';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Resumen general de tu actividad y finanzas
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          {getStatCard(
            'Notas',
            stats.totalNotes,
            <NoteIcon />,
            'info'
          )}
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          {getStatCard(
            'Proyectos',
            stats.totalProjects,
            <BusinessIcon />,
            'primary'
          )}
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          {getStatCard(
            'Cobros',
            stats.totalClientCharges,
            <PaymentIcon />,
            'success'
          )}
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
          {getStatCard(
            'Pagos',
            stats.totalPartnerPayments,
            <PeopleIcon />,
            'warning'
          )}
        </Box>
      </Box>

      {/* Financial Summary */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.33% - 16px)' } }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'success.50', color: 'success.main', mr: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    Ingresos
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(stats.totalRevenue, 'ARS')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.33% - 16px)' } }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'error.50', color: 'error.main', mr: 2 }}>
                  <TrendingDownIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    Gastos
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(stats.totalExpenses, 'ARS')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.33% - 16px)' } }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main', mr: 2 }}>
                  <AccountBalanceIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Balance
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: stats.netAmount >= 0 ? 'success.main' : 'error.main'
                    }}
                  >
                    {formatCurrency(stats.netAmount, 'ARS')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Recent Activity */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
            Actividad Reciente
          </Typography>
          <Box>
            {stats.recentActivity.map((activity, index) => (
              <Box key={index}>
                <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: `${getActivityColor(activity.type)}.50`,
                      color: `${getActivityColor(activity.type)}.main`,
                      mr: 2,
                      width: 40,
                      height: 40,
                    }}
                  >
                    {getActivityIcon(activity.type)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {activity.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.date.toLocaleDateString('es-AR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Box>
                  {activity.amount && (
                    <Chip
                      label={formatCurrency(activity.amount, (activity.currency || 'ARS') as 'ARS' | 'USD' | 'EUR')}
                      size="small"
                      sx={{
                        bgcolor: `${getActivityColor(activity.type)}.50`,
                        color: `${getActivityColor(activity.type)}.main`,
                        fontWeight: 'medium',
                      }}
                    />
                  )}
                </Box>
                {index < stats.recentActivity.length - 1 && <Divider />}
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
} 