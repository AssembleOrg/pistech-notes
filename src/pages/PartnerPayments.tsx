import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Fab,
  Switch,
  FormControlLabel,
  Tooltip,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Restore as RestoreIcon,
  Business as ProjectIcon,
  Payment as PaymentIcon,
  TrendingUp as TotalIcon,
  AccountBalance as BalanceIcon,
  People as PartnerIcon,
} from '@mui/icons-material';
import { getCurrentDate, formatDateForInput } from '../utils/helpers';
import { formatCurrency, formatPaymentMethod, formatDate, formatCurrencyForInput, parseCurrencyInput } from '../utils/formatters';
import type { PartnerPayment, Currency, PaymentMethod } from '../types';
import { usePartnerPaymentStore } from '../stores/partnerPayment';
import { useProjectStore } from '../stores/projectStore';
import { usePartnerStore } from '../stores/partnerStore';
import { useClientChargeStore } from '../stores/clientChargeStore';

interface ProjectWithPayments {
  project: any;
  payments: PartnerPayment[];
  totalPaid: number;
  totalProject: number;
  remainingAmount: number;
  currency: Currency;
}

export default function PartnerPayments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedProject, setSelectedProject] = useState<ProjectWithPayments | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PartnerPayment | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [formData, setFormData] = useState<{
    projectId: string;
    partnerName: string;
    amount: string;
    currency: Currency;
    date: string;
    paymentMethod: PaymentMethod;
    description: string;
  }>({
    projectId: '',
    partnerName: '',
    amount: '',
    currency: 'ARS',
    date: formatDateForInput(getCurrentDate()),
    paymentMethod: 'transfer',
    description: '',
  });
  const [filters, setFilters] = useState({
    projectId: '',
    partnerName: '',
    description: '',
    minAmount: '',
    maxAmount: '',
    currency: '',
    paymentMethod: '',
    startDate: '',
    endDate: '',
  });
  const [total, setTotal] = useState(0);

  const partnerPaymentStore = usePartnerPaymentStore();
  const projectStore = useProjectStore();
  const partnerStore = usePartnerStore();
  const clientChargeStore = useClientChargeStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading partner payments data...');
        await Promise.all([
          partnerPaymentStore.loadPartnerPayments(),
          projectStore.loadProjects(),
          partnerStore.loadPartners(),
          clientChargeStore.loadClientCharges(), // Agregar esta línea
        ]);
        console.log('Data loaded successfully');
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Error cargando datos');
      }
    };

    loadData();
  }, [partnerPaymentStore, projectStore, partnerStore, clientChargeStore]);

  const loadPartnerPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Since we're using the store data directly, we don't need to call the API here
      // The store already has the data loaded
      const filteredPayments = partnerPaymentStore.partnerPayments.filter(payment => {
        if (filters.projectId && payment.projectId !== filters.projectId) return false;
        if (filters.partnerName && !payment.partnerName.includes(filters.partnerName)) return false;
        if (filters.description && !payment.description?.includes(filters.description)) return false;
        if (filters.minAmount && payment.amount < parseFloat(filters.minAmount)) return false;
        if (filters.maxAmount && payment.amount > parseFloat(filters.maxAmount)) return false;
        if (filters.currency && payment.currency !== filters.currency) return false;
        if (filters.paymentMethod && payment.paymentMethod !== filters.paymentMethod) return false;
        if (filters.startDate && new Date(payment.date) < new Date(filters.startDate)) return false;
        if (filters.endDate && new Date(payment.date) > new Date(filters.endDate)) return false;
        if (!showDeleted && payment.deletedAt) return false;
        if (showDeleted && !payment.deletedAt) return false;
        return true;
      });
      
      setTotal(filteredPayments.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando pagos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartnerPayments();
  }, [page, rowsPerPage, showDeleted, filters]);

  const handleSearch = () => {
    setPage(0);
    loadPartnerPayments();
  };

  const handleClearFilters = () => {
    setFilters({
      projectId: '',
      partnerName: '',
      description: '',
      minAmount: '',
      maxAmount: '',
      currency: '',
      paymentMethod: '',
      startDate: '',
      endDate: '',
    });
    setPage(0);
    loadPartnerPayments();
  };

  const handleViewProject = (project: any) => {
    const projectPayments = partnerPaymentStore.partnerPayments.filter(payment => payment.projectId === project.id);
    const projectCharges = clientChargeStore.clientCharges.filter(charge => charge.projectId === project.id);
    
    const totalPaid = projectPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalCharged = projectCharges.reduce((sum, charge) => sum + charge.amount, 0);
    const remainingAmount = totalCharged - totalPaid; // Dinero disponible = Cobros - Pagos
    const currency = project.currency || 'ARS';

    setSelectedProject({
      project,
      payments: projectPayments,
      totalPaid,
      totalProject: totalCharged, // Cambiar a totalCharged
      remainingAmount,
      currency,
    });
    setViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialog(false);
    setSelectedProject(null);
  };

  const handleOpen = (payment?: PartnerPayment) => {
    console.log('payment', payment);
    setEditingPayment(payment || null);
    if (payment) {
      setFormData({
        projectId: payment.projectId,
        partnerName: payment.partnerName,
        amount: payment.amount.toString(),
        currency: payment.currency,
        date: formatDateForInput(new Date(payment.date)),
        paymentMethod: payment.paymentMethod,
        description: payment.description || '',
      });
    } else {
      setFormData({
        projectId: '',
        partnerName: '',
        amount: '',
        currency: 'ARS',
        date: formatDateForInput(getCurrentDate()),
        paymentMethod: 'transfer',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingPayment(null);
    setFormData({
      projectId: '',
      partnerName: '',
      amount: '',
      currency: 'ARS',
      date: formatDateForInput(getCurrentDate()),
      paymentMethod: 'transfer',
      description: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.projectId || !formData.partnerName || !formData.amount) return;

    try {
      setLoading(true);
      setError(null);

      const paymentData = {
        projectId: formData.projectId,
        partnerName: formData.partnerName,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        date: new Date(formData.date),
        paymentMethod: formData.paymentMethod,
        description: formData.description.trim(),
      };
      
      let updatedPayment: PartnerPayment;
      
      if (editingPayment) {
        updatedPayment = await partnerPaymentStore.updatePartnerPayment(editingPayment.id, paymentData);
      } else {
        updatedPayment = await partnerPaymentStore.createPartnerPayment(paymentData);
      }

      // Update the selected project data if dialog is open
      if (selectedProject && viewDialog) {
        // Use the current state from the store after the update
        const currentPayments = partnerPaymentStore.partnerPayments;
        const updatedProjectPayments = currentPayments.map(payment => {
          // console.log('paymentb', payment.id, updatedPayment.id, payment.id === updatedPayment.id);
          return payment.id === updatedPayment.id ? updatedPayment : payment;
        });
        const updatedTotalPaid = updatedProjectPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const updatedRemainingAmount = selectedProject.totalProject - updatedTotalPaid;

        setSelectedProject({
          ...selectedProject,
          payments: updatedProjectPayments,
          totalPaid: updatedTotalPaid,
          remainingAmount: updatedRemainingAmount,
        });
      }

      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando pago');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (payment: PartnerPayment) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este pago?')) return;

    try {
      setLoading(true);
      setError(null);
      await partnerPaymentStore.deletePartnerPayment(payment.id);

      // Update the selected project data if dialog is open
      if (selectedProject && viewDialog) {
        const updatedProjectPayments = partnerPaymentStore.partnerPayments.filter(payment => payment.projectId === selectedProject.project.id);
        const updatedTotalPaid = updatedProjectPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const updatedRemainingAmount = selectedProject.totalProject - updatedTotalPaid;

        setSelectedProject({
          ...selectedProject,
          payments: updatedProjectPayments,
          totalPaid: updatedTotalPaid,
          remainingAmount: updatedRemainingAmount,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando pago');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (paymentId: string) => {
    try {
      setLoading(true);
      setError(null);
      await partnerPaymentStore.restorePartnerPayment(paymentId);

      // Update the selected project data if dialog is open
      if (selectedProject && viewDialog) {
        const updatedProjectPayments = partnerPaymentStore.partnerPayments.filter(payment => payment.projectId === selectedProject.project.id);
        const updatedTotalPaid = updatedProjectPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const updatedRemainingAmount = selectedProject.totalProject - updatedTotalPaid;

        setSelectedProject({
          ...selectedProject,
          payments: updatedProjectPayments,
          totalPaid: updatedTotalPaid,
          remainingAmount: updatedRemainingAmount,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error restaurando pago');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getPartnerName = (partnerName: string) => {
    // Since we're using partnerName directly, we can just return it
    // or if you want to validate against registered partners:
    const partner = partnerStore.partners.find(p => p.id === partnerName);
    return partner ? partner.nickname : partnerName;
  };

  // Group payments by project
  const getProjectsWithPayments = (): ProjectWithPayments[] => {
    const projectsWithPayments: ProjectWithPayments[] = [];
    
    projects.forEach(project => {
      const projectPayments = partnerPaymentStore.partnerPayments.filter(payment => payment.projectId === project.id);
      const projectCharges = clientChargeStore.clientCharges.filter(charge => charge.projectId === project.id);
      
      if (projectPayments.length > 0) {
        const totalPaid = projectPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const totalCharged = projectCharges.reduce((sum, charge) => sum + charge.amount, 0);
        const remainingAmount = totalCharged - totalPaid; // Dinero disponible = Cobros - Pagos
        
        projectsWithPayments.push({
          project,
          payments: projectPayments,
          totalPaid,
          totalProject: totalCharged, // Cambiar a totalCharged
          remainingAmount,
          currency: project.currency || 'ARS',
        });
      }
    });
    
    return projectsWithPayments;
  };

  const projects = projectStore.projects;
  const partners = partnerStore.partners;
  const projectsWithPayments = getProjectsWithPayments();

  if (loading && partnerPaymentStore.partnerPayments.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Pagos a Socios</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={showDeleted}
              onChange={(e) => setShowDeleted(e.target.checked)}
              color="warning"
            />
          }
          label="Mostrar eliminados"
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
          Filtros
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end' }}>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(16.66% - 8px)' } }}>
            <FormControl fullWidth size="small">
              <InputLabel>Proyecto</InputLabel>
              <Select
                value={filters.projectId}
                label="Proyecto"
                onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
              >
                <MenuItem value="">Todos</MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(16.66% - 8px)' } }}>
            <FormControl fullWidth size="small">
              <InputLabel>Socio3</InputLabel>
              <Select
                value={getPartnerName(filters.partnerName)}
                label="Socio"
                onChange={(e) => setFilters({ ...filters, partnerName: e.target.value })}
              >
                <MenuItem value="">Todos</MenuItem>
                {partners.map((partner) => (
                  <MenuItem key={partner.id} value={partner.nickname}>
                    {partner.nickname}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(16.66% - 8px)' } }}>
            <TextField
              label="Descripción"
              size="small"
              value={filters.description}
              onChange={(e) => setFilters({ ...filters, description: e.target.value })}
              fullWidth
            />
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(16.66% - 8px)' } }}>
            <TextField
              label="Monto Mínimo"
              size="small"
              type="number"
              value={filters.minAmount}
              onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
              fullWidth
            />
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(16.66% - 8px)' } }}>
            <TextField
              label="Monto Máximo"
              size="small"
              type="number"
              value={filters.maxAmount}
              onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
              fullWidth
            />
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(16.66% - 8px)' } }}>
            <FormControl fullWidth size="small">
              <InputLabel>Moneda</InputLabel>
              <Select
                value={filters.currency}
                label="Moneda"
                onChange={(e) => setFilters({ ...filters, currency: e.target.value })}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="ARS">ARS</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(16.66% - 8px)' } }}>
            <FormControl fullWidth size="small">
              <InputLabel>Método de Pago</InputLabel>
              <Select
                value={filters.paymentMethod}
                label="Método de Pago"
                onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="cash">Efectivo</MenuItem>
                <MenuItem value="transfer">Transferencia</MenuItem>
                <MenuItem value="card">Tarjeta</MenuItem>
                <MenuItem value="check">Cheque</MenuItem>
                <MenuItem value="other">Otro</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end', mt: 2 }}>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
            <TextField
              label="Fecha Desde"
              size="small"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)' } }}>
            <TextField
              label="Fecha Hasta"
              size="small"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleSearch}
            startIcon={<FilterIcon />}
          >
            Filtrar
          </Button>
          <Button
            variant="outlined"
            onClick={handleClearFilters}
          >
            Limpiar
          </Button>
        </Box>
      </Paper>

      {/* Projects with Payments Grid */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {projectsWithPayments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((projectWithPayments) => (
          <Box 
            key={projectWithPayments.project.id}
            sx={{ 
              width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' },
              minWidth: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' }
            }}
          >
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Project Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ProjectIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'medium', flexGrow: 1 }}>
                    {projectWithPayments.project.name}
                  </Typography>
                </Box>

                {/* Project Stats */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Cobrado:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {formatCurrency(projectWithPayments.totalProject, projectWithPayments.currency)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Pagado:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'error.main' }}>
                      {formatCurrency(projectWithPayments.totalPaid, projectWithPayments.currency)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Disponible:
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 'medium',
                        color: projectWithPayments.remainingAmount > 0 ? 'success.main' : 'error.main'
                      }}
                    >
                      {formatCurrency(projectWithPayments.remainingAmount, projectWithPayments.currency)}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Recent Payments */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                    Pagos Recientes ({projectWithPayments.payments.length})
                  </Typography>
                  {projectWithPayments.payments.slice(0, 3).map((payment) => (
                    <Box key={payment.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {getPartnerName(payment.partnerName)}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                        {formatCurrency(payment.amount, payment.currency)}
                      </Typography>
                    </Box>
                  ))}
                  {projectWithPayments.payments.length > 3 && (
                    <Typography variant="caption" color="text.secondary">
                      +{projectWithPayments.payments.length - 3} más...
                    </Typography>
                  )}
                </Box>

                {/* Actions */}
                <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
                  <Tooltip title="Ver todos los pagos">
                    <IconButton
                      size="small"
                      onClick={() => handleViewProject(projectWithPayments.project)}
                      color="primary"
                      sx={{ flexGrow: 1 }}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Agregar pago">
                    <IconButton
                      size="small"
                      onClick={() => handleOpen()}
                      color="primary"
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <TablePagination
          rowsPerPageOptions={[6, 12, 24]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Proyectos por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </Box>

      <Fab
        color="primary"
        aria-label="add"
        onClick={() => handleOpen()}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPayment ? 'Editar Pago' : 'Nuevo Pago'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Proyecto</InputLabel>
            <Select
              value={formData.projectId}
              label="Proyecto"
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Socio3</InputLabel>
            <Select
              value={getPartnerName(formData.partnerName)}
              label="Socio"
              onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
            >
              {partners.map((partner) => (
                <MenuItem key={partner.id} value={partner.nickname}>
                  {partner.nickname}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Descripción"
            fullWidth
            variant="outlined"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Moneda</InputLabel>
              <Select
                value={formData.currency}
                label="Moneda"
                onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
              >
                <MenuItem value="ARS">ARS</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Método de Pago</InputLabel>
              <Select
                value={formData.paymentMethod}
                label="Método de Pago"
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
              >
                <MenuItem value="cash">Efectivo</MenuItem>
                <MenuItem value="transfer">Transferencia</MenuItem>
                <MenuItem value="card">Tarjeta</MenuItem>
                <MenuItem value="check">Cheque</MenuItem>
                <MenuItem value="other">Otro</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              margin="dense"
              label="Monto"
              type="text"
              fullWidth
              variant="outlined"
              value={formatCurrencyForInput(parseFloat(formData.amount) || 0, formData.currency)}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount: parseCurrencyInput(e.target.value, formData.currency).toString(),
                })
              }
            />
            <TextField
              margin="dense"
              label="Fecha"
              type="date"
              fullWidth
              variant="outlined"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : editingPayment ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Project Dialog */}
      <Dialog open={viewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ProjectIcon color="primary" />
            <Typography variant="h6">
              {selectedProject?.project.name}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Project Summary */}
          <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 16px)' } }}>
                <Box sx={{ textAlign: 'center' }}>
                  <TotalIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Total Cobrado
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {selectedProject ? formatCurrency(selectedProject.totalProject, selectedProject.currency) : ''}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 16px)' } }}>
                <Box sx={{ textAlign: 'center' }}>
                  <PaymentIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Total Pagado
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    {selectedProject ? formatCurrency(selectedProject.totalPaid, selectedProject.currency) : ''}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(33.333% - 16px)' } }}>
                <Box sx={{ textAlign: 'center' }}>
                  <BalanceIcon sx={{ fontSize: 40, color: selectedProject?.remainingAmount && selectedProject.remainingAmount > 0 ? 'success.main' : 'error.main', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Disponible
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: selectedProject?.remainingAmount && selectedProject.remainingAmount > 0 ? 'success.main' : 'error.main'
                    }}
                  >
                    {selectedProject ? formatCurrency(selectedProject.remainingAmount, selectedProject.currency) : ''}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Payments List */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
            Pagos del Proyecto ({selectedProject?.payments.length || 0})
          </Typography>
          
          {selectedProject?.payments.length === 0 ? (
            <Alert severity="info">
              No hay pagos registrados para este proyecto.
            </Alert>
          ) : (
            <List>
              {selectedProject?.payments.map((payment, index) => (
                <React.Fragment key={payment.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PartnerIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {getPartnerName(payment.partnerName)}
                            </Typography>
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                            {formatCurrency(payment.amount, payment.currency)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Chip
                              label={formatPaymentMethod(payment.paymentMethod)}
                              size="small"
                              variant="outlined"
                            />
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(payment.date)}
                            </Typography>
                            {payment.description && (
                              <Typography variant="caption" color="text.secondary">
                                {payment.description}
                              </Typography>
                            )}
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {!payment.deletedAt && (
                              <>
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpen(payment)}
                                  color="primary"
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(payment)}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </>
                            )}
                            {payment.deletedAt && (
                              <Tooltip title="Restaurar">
                                <IconButton
                                  size="small"
                                  onClick={() => handleRestore(payment.id)}
                                  color="success"
                                >
                                  <RestoreIcon />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < (selectedProject?.payments.length || 0) - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
