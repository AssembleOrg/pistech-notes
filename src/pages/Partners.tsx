import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Restore as RestoreIcon,
  RestoreFromTrash as DeletedIcon,
} from '@mui/icons-material';
import { apiService } from '../services/apiService';
import { formatDate } from '../utils/formatters';
import type { Partner, PartnerRole, PistechRole } from '../types';

export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    nickname: '',
    number: '',
    partnerRole: 'collaborator' as PartnerRole,
    pistechRole: 'other' as PistechRole,
  });
  const [filters, setFilters] = useState({
    fullName: '',
    nickname: '',
    partnerRole: '',
    pistechRole: '',
  });

  useEffect(() => {
    loadPartners();
  }, [page, rowsPerPage, showDeleted]);

  const loadPartners = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getPartnersPaginated({
        page: page + 1,
        limit: rowsPerPage,
        fullName: filters.fullName || undefined,
        nickname: filters.nickname || undefined,
        partnerRole: filters.partnerRole as PartnerRole || undefined,
        pistechRole: filters.pistechRole as PistechRole || undefined,
        includeDeleted: showDeleted,
      });

      setPartners(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando socios');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadPartners();
  };

  const handleClearFilters = () => {
    setFilters({
      fullName: '',
      nickname: '',
      partnerRole: '',
      pistechRole: '',
    });
    setPage(0);
    loadPartners();
  };

  const handleViewPartner = (partner: Partner) => {
    setSelectedPartner(partner);
    setViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialog(false);
    setSelectedPartner(null);
  };

  const handleOpen = (partner?: Partner) => {
    setEditingPartner(partner || null);
    if (partner) {
      setFormData({
        fullName: partner.fullName,
        nickname: partner.nickname,
        number: partner.number,
        partnerRole: partner.partnerRole,
        pistechRole: partner.pistechRole,
      });
    } else {
      setFormData({
        fullName: '',
        nickname: '',
        number: '',
        partnerRole: 'collaborator',
        pistechRole: 'other',
      });
    }
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingPartner(null);
    setFormData({
      fullName: '',
      nickname: '',
      number: '',
      partnerRole: 'collaborator',
      pistechRole: 'other',
    });
  };

  const handleSubmit = async () => {
    if (!formData.fullName.trim() || !formData.nickname.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const partnerData = {
        fullName: formData.fullName.trim(),
        nickname: formData.nickname.trim(),
        number: formData.number.trim(),
        partnerRole: formData.partnerRole,
        pistechRole: formData.pistechRole,
      };

      if (editingPartner) {
        await apiService.updatePartner(editingPartner.id, partnerData);
      } else {
        await apiService.createPartner(partnerData);
      }

      await loadPartners();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando socio');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (partnerId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este socio?')) return;

    try {
      setLoading(true);
      setError(null);
      await apiService.deletePartner(partnerId);
      await loadPartners();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando socio');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (partnerId: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiService.restorePartner(partnerId);
      await loadPartners();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error restaurando socio');
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

  const getPartnerRoleLabel = (role: PartnerRole) => {
    switch (role) {
      case 'owner':
        return 'Propietario';
      case 'collaborator':
        return 'Colaborador';
      default:
        return role;
    }
  };

  const getPistechRoleLabel = (role: PistechRole) => {
    switch (role) {
      case 'developer':
        return 'Desarrollador';
      case 'designer':
        return 'Diseñador';
      case 'manager':
        return 'Gerente';
      case 'rrhh':
        return 'RRHH';
      case 'accountant':
        return 'Contador';
      case 'marketing':
        return 'Marketing';
      case 'sales':
        return 'Ventas';
      case 'other':
        return 'Otro';
      default:
        return role;
    }
  };

  const getPartnerRoleColor = (role: PartnerRole) => {
    switch (role) {
      case 'owner':
        return 'error';
      case 'collaborator':
        return 'info';
      default:
        return 'default';
    }
  };

  const getPistechRoleColor = (role: PistechRole) => {
    switch (role) {
      case 'developer':
        return 'primary';
      case 'designer':
        return 'secondary';
      case 'manager':
        return 'error';
      case 'rrhh':
        return 'warning';
      case 'accountant':
        return 'success';
      case 'marketing':
        return 'info';
      default:
        return 'default';
    }
  };

  const paginatedPartners = partners.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading && partners.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Socios</Typography>
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
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(20% - 8px)' } }}>
            <TextField
              label="Nombre Completo"
              size="small"
              value={filters.fullName}
              onChange={(e) => setFilters({ ...filters, fullName: e.target.value })}
              fullWidth
            />
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(20% - 8px)' } }}>
            <TextField
              label="Apodo"
              size="small"
              value={filters.nickname}
              onChange={(e) => setFilters({ ...filters, nickname: e.target.value })}
              fullWidth
            />
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(20% - 8px)' } }}>
            <FormControl fullWidth size="small">
              <InputLabel>Rol de Socio</InputLabel>
              <Select
                value={filters.partnerRole}
                label="Rol de Socio"
                onChange={(e) => setFilters({ ...filters, partnerRole: e.target.value })}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="owner">Propietario</MenuItem>
                <MenuItem value="collaborator">Colaborador</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(20% - 8px)' } }}>
            <FormControl fullWidth size="small">
              <InputLabel>Rol en Pistech</InputLabel>
              <Select
                value={filters.pistechRole}
                label="Rol en Pistech"
                onChange={(e) => setFilters({ ...filters, pistechRole: e.target.value })}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="developer">Desarrollador</MenuItem>
                <MenuItem value="designer">Diseñador</MenuItem>
                <MenuItem value="manager">Gerente</MenuItem>
                <MenuItem value="rrhh">RRHH</MenuItem>
                <MenuItem value="accountant">Contador</MenuItem>
                <MenuItem value="marketing">Marketing</MenuItem>
                <MenuItem value="sales">Ventas</MenuItem>
                <MenuItem value="other">Otro</MenuItem>
              </Select>
            </FormControl>
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

      {/* Partners Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Nombre Completo</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Apodo</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Teléfono</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Rol de Socio</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Rol en Pistech</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedPartners.map((partner) => (
              <TableRow 
                key={partner.id} 
                hover
                sx={{
                  opacity: partner.deletedAt ? 0.6 : 1,
                  backgroundColor: partner.deletedAt ? 'action.hover' : 'inherit',
                }}
              >
                <TableCell>
                  {partner.deletedAt ? (
                    <Chip
                      icon={<DeletedIcon />}
                      label="Eliminado"
                      color="error"
                      size="small"
                    />
                  ) : (
                    <Chip
                      label="Activo"
                      color="success"
                      size="small"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {partner.fullName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {partner.nickname}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {partner.number}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getPartnerRoleLabel(partner.partnerRole)}
                    color={getPartnerRoleColor(partner.partnerRole) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={getPistechRoleLabel(partner.pistechRole)}
                    color={getPistechRoleColor(partner.pistechRole) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(partner.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleViewPartner(partner)}
                      color="primary"
                    >
                      <ViewIcon />
                    </IconButton>
                    {!partner.deletedAt && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handleOpen(partner)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(partner.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                    {partner.deletedAt && (
                      <Tooltip title="Restaurar">
                        <IconButton
                          size="small"
                          onClick={() => handleRestore(partner.id)}
                          color="success"
                        >
                          <RestoreIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </TableContainer>

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
          {editingPartner ? 'Editar Socio' : 'Nuevo Socio'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre Completo"
            fullWidth
            variant="outlined"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Apodo"
            fullWidth
            variant="outlined"
            value={formData.nickname}
            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Teléfono"
            fullWidth
            variant="outlined"
            value={formData.number}
            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Rol de Socio</InputLabel>
              <Select
                value={formData.partnerRole}
                label="Rol de Socio"
                onChange={(e) => setFormData({ ...formData, partnerRole: e.target.value as PartnerRole })}
              >
                <MenuItem value="owner">Propietario</MenuItem>
                <MenuItem value="collaborator">Colaborador</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Rol en Pistech</InputLabel>
              <Select
                value={formData.pistechRole}
                label="Rol en Pistech"
                onChange={(e) => setFormData({ ...formData, pistechRole: e.target.value as PistechRole })}
              >
                <MenuItem value="developer">Desarrollador</MenuItem>
                <MenuItem value="designer">Diseñador</MenuItem>
                <MenuItem value="manager">Gerente</MenuItem>
                <MenuItem value="rrhh">RRHH</MenuItem>
                <MenuItem value="accountant">Contador</MenuItem>
                <MenuItem value="marketing">Marketing</MenuItem>
                <MenuItem value="sales">Ventas</MenuItem>
                <MenuItem value="other">Otro</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : editingPartner ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPartner?.fullName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Apodo:
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {selectedPartner?.nickname}
            </Typography>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Teléfono:
            </Typography>
            <Typography variant="body1">
              {selectedPartner?.number}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Rol de Socio:
              </Typography>
              <Chip
                label={selectedPartner ? getPartnerRoleLabel(selectedPartner.partnerRole) : ''}
                color={selectedPartner ? getPartnerRoleColor(selectedPartner.partnerRole) as any : 'default'}
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Rol en Pistech:
              </Typography>
              <Chip
                label={selectedPartner ? getPistechRoleLabel(selectedPartner.pistechRole) : ''}
                color={selectedPartner ? getPistechRoleColor(selectedPartner.pistechRole) as any : 'default'}
              />
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Creado: {selectedPartner ? formatDate(selectedPartner.createdAt) : ''}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 