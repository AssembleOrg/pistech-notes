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
  Chip,
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
} from '@mui/material';
import {
  Visibility as ViewIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { apiService } from '../services/apiService';
import { formatDateTime } from '../utils/formatters';
import type { Log, LogAction, EntityType } from '../types';

export default function Logs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    entityId: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadLogs();
  }, [page, rowsPerPage]);

  const loadLogs = async () => {
    try {
      // Since the backend doesn't have paginated logs endpoint, we'll load all and paginate client-side
      const allLogs = await apiService.getLogs({
        action: filters.action as LogAction || undefined,
        entityType: filters.entityType as EntityType || undefined,
        entityId: filters.entityId || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      
      setLogs(allLogs);
      setTotal(allLogs.length);
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const handleViewLog = (log: Log) => {
    setSelectedLog(log);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedLog(null);
  };

  const handleSearch = () => {
    setPage(0);
    loadLogs();
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getActionColor = (action: LogAction) => {
    switch (action) {
      case 'CREATE':
        return 'success';
      case 'UPDATE':
        return 'info';
      case 'DELETE':
        return 'error';
      default:
        return 'default';
    }
  };

  const getActionLabel = (action: LogAction) => {
    switch (action) {
      case 'CREATE':
        return 'Crear';
      case 'UPDATE':
        return 'Actualizar';
      case 'DELETE':
        return 'Eliminar';
      default:
        return action;
    }
  };

  const getEntityTypeLabel = (entityType: EntityType) => {
    switch (entityType) {
      case 'Note':
        return 'Nota';
      case 'Project':
        return 'Proyecto';
      case 'ClientCharge':
        return 'Cobro Cliente';
      case 'PartnerPayment':
        return 'Pago Socio';
      case 'Partner':
        return 'Socio';
      case 'User':
        return 'Usuario';
      default:
        return entityType;
    }
  };

  const getEntityTypeColor = (entityType: EntityType) => {
    switch (entityType) {
      case 'Note':
        return 'primary';
      case 'Project':
        return 'secondary';
      case 'ClientCharge':
        return 'success';
      case 'PartnerPayment':
        return 'warning';
      case 'Partner':
        return 'info';
      case 'User':
        return 'error';
      default:
        return 'default';
    }
  };

  const paginatedLogs = logs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Registro de Actividad
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(16.666% - 8px)' } }}>
            <FormControl fullWidth size="small">
              <InputLabel>Acción</InputLabel>
              <Select
                value={filters.action}
                label="Acción"
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="CREATE">Crear</MenuItem>
                <MenuItem value="UPDATE">Actualizar</MenuItem>
                <MenuItem value="DELETE">Eliminar</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(16.666% - 8px)' } }}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo de Entidad</InputLabel>
              <Select
                value={filters.entityType}
                label="Tipo de Entidad"
                onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="Note">Nota</MenuItem>
                <MenuItem value="Project">Proyecto</MenuItem>
                <MenuItem value="ClientCharge">Cobro Cliente</MenuItem>
                <MenuItem value="PartnerPayment">Pago Socio</MenuItem>
                <MenuItem value="Partner">Socio</MenuItem>
                <MenuItem value="User">Usuario</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(16.666% - 8px)' } }}>
            <TextField
              label="ID de Entidad"
              size="small"
              value={filters.entityId}
              onChange={(e) => setFilters({ ...filters, entityId: e.target.value })}
              fullWidth
            />
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(16.666% - 8px)' } }}>
            <TextField
              label="Fecha Desde"
              type="date"
              size="small"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(16.666% - 8px)' } }}>
            <TextField
              label="Fecha Hasta"
              type="date"
              size="small"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(16.666% - 8px)' } }}>
            <Button
              variant="contained"
              onClick={handleSearch}
              startIcon={<FilterIcon />}
              fullWidth
            >
              Filtrar
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Logs Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Acción</TableCell>
              <TableCell>Tipo de Entidad</TableCell>
              <TableCell>ID de Entidad</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{formatDateTime(log.createdAt)}</TableCell>
                <TableCell>
                  <Chip
                    label={getActionLabel(log.action)}
                    color={getActionColor(log.action)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={getEntityTypeLabel(log.entityType)}
                    color={getEntityTypeColor(log.entityType)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{log.entityId}</TableCell>
                <TableCell>{log.userId}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleViewLog(log)}
                  >
                    <ViewIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
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

      {/* Log Detail Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Detalle del Registro
        </DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(16.666% - 8px)' } }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    ID del Registro
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedLog.id}
                  </Typography>
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(16.666% - 8px)' } }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDateTime(selectedLog.createdAt)}
                  </Typography>
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(16.666% - 8px)' } }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Acción
                  </Typography>
                  <Chip
                    label={getActionLabel(selectedLog.action)}
                    color={getActionColor(selectedLog.action)}
                    size="small"
                  />
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(16.666% - 8px)' } }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tipo de Entidad
                  </Typography>
                  <Chip
                    label={getEntityTypeLabel(selectedLog.entityType)}
                    color={getEntityTypeColor(selectedLog.entityType)}
                    size="small"
                  />
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(16.666% - 8px)' } }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    ID de Entidad
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedLog.entityId}
                  </Typography>
                </Box>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(16.666% - 8px)' } }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Usuario
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedLog.userId}
                  </Typography>
                </Box>
                {selectedLog.ipAddress && (
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(16.666% - 8px)' } }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Dirección IP
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedLog.ipAddress}
                    </Typography>
                  </Box>
                )}
                {selectedLog.userAgent && (
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(16.666% - 8px)' } }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      User Agent
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedLog.userAgent}
                    </Typography>
                  </Box>
                )}
                {selectedLog.changes && selectedLog.changes.length > 0 && (
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(16.666% - 8px)' } }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Cambios
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                      {selectedLog.changes.map((change, index) => (
                        <Chip
                          key={index}
                          label={change}
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                {(selectedLog.oldData || selectedLog.newData) && (
                  <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(16.666% - 8px)' } }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Datos Detallados
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {selectedLog.oldData && (
                        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(16.666% - 8px)' } }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Datos Anteriores
                          </Typography>
                          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                            <pre style={{ fontSize: '0.875rem', margin: 0 }}>
                              {JSON.stringify(selectedLog.oldData, null, 2)}
                            </pre>
                          </Paper>
                        </Box>
                      )}
                      {selectedLog.newData && (
                        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(16.666% - 8px)' } }}>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Datos Nuevos
                          </Typography>
                          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                            <pre style={{ fontSize: '0.875rem', margin: 0 }}>
                              {JSON.stringify(selectedLog.newData, null, 2)}
                            </pre>
                          </Paper>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 