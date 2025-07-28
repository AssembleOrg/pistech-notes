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
import { formatCurrency, formatDate } from '../utils/formatters';
import { formatCurrencyForInput, parseCurrencyInput } from '../utils/formatters';
import type { Project, ProjectStatus, Currency } from '../types';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active' as ProjectStatus,
    amount: '',
    currency: 'ARS' as Currency,
  });
  const [filters, setFilters] = useState({
    name: '',
    description: '',
    status: '',
  });

  useEffect(() => {
    loadProjects();
  }, [page, rowsPerPage, showDeleted]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getProjectsPaginated({
        page: page + 1,
        limit: rowsPerPage,
        name: filters.name || undefined,
        description: filters.description || undefined,
        status: filters.status as ProjectStatus || undefined,
        includeDeleted: showDeleted,
      });
      console.log('response', response);
      setProjects(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando proyectos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadProjects();
  };

  const handleClearFilters = () => {
    setFilters({
      name: '',
      description: '',
      status: '',
    });
    setPage(0);
    loadProjects();
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialog(false);
    setSelectedProject(null);
  };

  const handleOpen = (project?: Project) => {
    setEditingProject(project || null);
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        status: project.status,
        amount: project.amount.toString(),
        currency: project.currency,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'active',
        amount: '',
        currency: 'ARS',
      });
    }
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      status: 'active',
      amount: '',
      currency: 'ARS',
    });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.amount) return;

    try {
      setLoading(true);
      setError(null);

      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        status: formData.status,
        amount: parseCurrencyInput(formData.amount, formData.currency),
        currency: formData.currency,
      };

      if (editingProject) {
        await apiService.updateProject(editingProject.id, projectData);
      } else {
        await apiService.createProject(projectData);
      }

      console.log('projectData', projectData);

      await loadProjects();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando proyecto');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este proyecto?')) return;

    try {
      setLoading(true);
      setError(null);
      await apiService.deleteProject(projectId);
      await loadProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando proyecto');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (projectId: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiService.restoreProject(projectId);
      await loadProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error restaurando proyecto');
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

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'info';
      case 'on-hold':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'pending':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'on-hold':
        return 'En Pausa';
      case 'cancelled':
        return 'Cancelado';
      case 'pending':
        return 'Pendiente';
      default:
        return status;
    }
  };

  const paginatedProjects = projects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading && projects.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Proyectos</Typography>
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
              label="Nombre"
              size="small"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              fullWidth
            />
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(20% - 8px)' } }}>
            <TextField
              label="Descripción"
              size="small"
              value={filters.description}
              onChange={(e) => setFilters({ ...filters, description: e.target.value })}
              fullWidth
            />
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(20% - 8px)' } }}>
            <FormControl fullWidth size="small">
              <InputLabel>Estado</InputLabel>
              <Select
                value={filters.status}
                label="Estado"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="active">Activo</MenuItem>
                <MenuItem value="completed">Completado</MenuItem>
                <MenuItem value="on-hold">En Pausa</MenuItem>
                <MenuItem value="cancelled">Cancelado</MenuItem>
                <MenuItem value="pending">Pendiente</MenuItem>
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

      {/* Projects Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Descripción</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Estado Proyecto</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Monto</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedProjects.map((project) => (
              <TableRow 
                key={project.id} 
                hover
                sx={{
                  opacity: project.deletedAt ? 0.6 : 1,
                  backgroundColor: project.deletedAt ? 'action.hover' : 'inherit',
                }}
              >
                <TableCell>
                  {project.deletedAt ? (
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
                    {project.name}
                  </Typography>
                </TableCell>
                <TableCell sx={{ maxWidth: 200 }}>
                  <Typography variant="body2" color="text.secondary">
                    {project.description || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(project.status)}
                    color={getStatusColor(project.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {formatCurrency(project.amount, project.currency)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(project.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleViewProject(project)}
                      color="primary"
                    >
                      <ViewIcon />
                    </IconButton>
                    {!project.deletedAt && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handleOpen(project)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(project.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                    {project.deletedAt && (
                      <Tooltip title="Restaurar">
                        <IconButton
                          size="small"
                          onClick={() => handleRestore(project.id)}
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
          {editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombre"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Descripción"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={formData.status}
                label="Estado"
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
              >
                <MenuItem value="active">Activo</MenuItem>
                <MenuItem value="completed">Completado</MenuItem>
                <MenuItem value="on-hold">En Pausa</MenuItem>
                <MenuItem value="cancelled">Cancelado</MenuItem>
                <MenuItem value="pending">Pendiente</MenuItem>
              </Select>
            </FormControl>
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
          </Box>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : editingProject ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProject?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Descripción:
            </Typography>
            <Typography variant="body1">
              {selectedProject?.description || 'Sin descripción'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Estado:
              </Typography>
              <Chip
                label={selectedProject ? getStatusLabel(selectedProject.status) : ''}
                color={selectedProject ? getStatusColor(selectedProject.status) as any : 'default'}
              />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Monto:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {selectedProject ? formatCurrency(selectedProject.amount, selectedProject.currency) : ''}
              </Typography>
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Creado: {selectedProject ? formatDate(selectedProject.createdAt) : ''}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
