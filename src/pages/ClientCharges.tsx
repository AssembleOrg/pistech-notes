import React, { useState, useEffect } from "react";
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
} from "@mui/material";
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
} from "@mui/icons-material";
import { getCurrentDate } from "../utils/helpers";
import {
  formatCurrency,
  formatPaymentMethod,
  formatDate,
  formatCurrencyForInput,
  parseCurrencyInput,
} from "../utils/formatters";
import type { ClientCharge, Currency, PaymentMethod } from "../types";
import { useClientChargeStore } from "../stores/clientChargeStore";
import { useProjectStore } from "../stores/projectStore";
import { apiService } from "../services/apiService";

interface ProjectWithCharges {
  project: any;
  charges: ClientCharge[];
  totalCharged: number;
  totalProject: number;
  remainingAmount: number;
  currency: Currency;
}

export default function ClientCharges() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedProject, setSelectedProject] =
    useState<ProjectWithCharges | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [editingCharge, setEditingCharge] = useState<ClientCharge | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [formData, setFormData] = useState({
    projectId: "",
    amount: "",
    currency: "ARS" as Currency,
    date: getCurrentDate(),
    paymentMethod: "transfer" as PaymentMethod,
    description: "",
  });
  const [filters, setFilters] = useState({
    projectId: "",
    description: "",
    minAmount: "",
    maxAmount: "",
    currency: "",
    paymentMethod: "",
    startDate: "",
    endDate: "",
  });

  const clientChargeStore = useClientChargeStore();
  const projectStore = useProjectStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          clientChargeStore.loadClientCharges(),
          projectStore.loadProjects(),
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, [clientChargeStore, projectStore]);

  useEffect(() => {
    loadClientCharges();
  }, [page, rowsPerPage, showDeleted]);

  const loadClientCharges = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getClientChargesPaginated({
        page: page + 1,
        limit: rowsPerPage,
        projectId: filters.projectId || undefined,
        description: filters.description || undefined,
        minAmount: filters.minAmount
          ? parseFloat(filters.minAmount)
          : undefined,
        maxAmount: filters.maxAmount
          ? parseFloat(filters.maxAmount)
          : undefined,
        currency: (filters.currency as Currency) || undefined,
        paymentMethod: (filters.paymentMethod as PaymentMethod) || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        includeDeleted: showDeleted,
      });

      clientChargeStore.setClientCharges(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando cobros");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadClientCharges();
  };

  const handleClearFilters = () => {
    setFilters({
      projectId: "",
      description: "",
      minAmount: "",
      maxAmount: "",
      currency: "",
      paymentMethod: "",
      startDate: "",
      endDate: "",
    });
    setPage(0);
    loadClientCharges();
  };

  const handleViewProject = (project: any) => {
    const projectCharges = clientCharges.filter(
      (charge) => charge.projectId === project.id
    );
    const totalCharged = projectCharges.reduce(
      (sum, charge) => sum + charge.amount,
      0
    );
    const totalProject = project.amount || 0;
    const remainingAmount = totalProject - totalCharged;
    const currency = project.currency || "ARS";

    setSelectedProject({
      project,
      charges: projectCharges,
      totalCharged,
      totalProject,
      remainingAmount,
      currency,
    });
    setViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialog(false);
    setSelectedProject(null);
  };

  const handleOpen = (charge?: ClientCharge) => {
    setEditingCharge(charge || null);
    if (charge) {
      setFormData({
        projectId: charge.projectId,
        amount: charge.amount.toString(),
        currency: charge.currency,
        date: charge.date,
        paymentMethod: charge.paymentMethod,
        description: charge.description || "",
      });
    } else {
      setFormData({
        projectId: "",
        amount: "",
        currency: "ARS",
        date: getCurrentDate(),
        paymentMethod: "transfer",
        description: "",
      });
    }
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingCharge(null);
    setFormData({
      projectId: "",
      amount: "",
      currency: "ARS",
      date: getCurrentDate(),
      paymentMethod: "transfer",
      description: "",
    });
  };

  const handleSubmit = async () => {
    if (!formData.projectId || !formData.amount || !formData.date) return;

    setLoading(true);
    setError(null);

    try {
      const chargeData = {
        projectId: formData.projectId,
        amount: parseCurrencyInput(formData.amount, formData.currency),
        currency: formData.currency,
        date: new Date(formData.date),
        paymentMethod: formData.paymentMethod,
        description: formData.description,
      };

      let updatedCharge: ClientCharge;

      if (editingCharge) {
        updatedCharge = await clientChargeStore.updateClientCharge(
          editingCharge.id,
          chargeData
        );
      } else {
        updatedCharge = await clientChargeStore.createClientCharge(chargeData);
      }

      // Update the selected project data if dialog is open
      if (selectedProject && viewDialog) {
        const updatedProjectCharges = clientChargeStore.clientCharges.map(
          (charge) => {
            return charge.id === updatedCharge.id ? updatedCharge : charge;
          }
        );
        const updatedTotalCharged = updatedProjectCharges.reduce(
          (sum, charge) => sum + charge.amount,
          0
        );
        const updatedRemainingAmount =
          selectedProject.totalProject - updatedTotalCharged;

        setSelectedProject({
          ...selectedProject,
          charges: updatedProjectCharges,
          totalCharged: updatedTotalCharged,
          remainingAmount: updatedRemainingAmount,
        });
      }

      setFormData({
        projectId: "",
        amount: "",
        currency: "ARS",
        date: getCurrentDate(),
        paymentMethod: "transfer",
        description: "",
      });
      setEditingCharge(null);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar cobro");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (charge: ClientCharge) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este cobro?"))
      return;

    try {
      setLoading(true);
      setError(null);
      await clientChargeStore.deleteClientCharge(charge.id);

      // Update the selected project data if dialog is open
      if (selectedProject && viewDialog) {
        const updatedProjectCharges = clientChargeStore.clientCharges.filter(
          (charge) => charge.projectId === selectedProject.project.id
        );
        const updatedTotalCharged = updatedProjectCharges.reduce(
          (sum, charge) => sum + charge.amount,
          0
        );
        const updatedRemainingAmount =
          selectedProject.totalProject - updatedTotalCharged;

        setSelectedProject({
          ...selectedProject,
          charges: updatedProjectCharges,
          totalCharged: updatedTotalCharged,
          remainingAmount: updatedRemainingAmount,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error eliminando cobro");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (chargeId: string) => {
    try {
      setLoading(true);
      setError(null);
      await clientChargeStore.restoreClientCharge(chargeId);

      // Update the selected project data if dialog is open
      if (selectedProject && viewDialog) {
        const updatedProjectCharges = clientChargeStore.clientCharges.filter(
          (charge) => charge.projectId === selectedProject.project.id
        );
        const updatedTotalCharged = updatedProjectCharges.reduce(
          (sum, charge) => sum + charge.amount,
          0
        );
        const updatedRemainingAmount =
          selectedProject.totalProject - updatedTotalCharged;

        setSelectedProject({
          ...selectedProject,
          charges: updatedProjectCharges,
          totalCharged: updatedTotalCharged,
          remainingAmount: updatedRemainingAmount,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error restaurando cobro");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Group charges by project
  const getProjectsWithCharges = (): ProjectWithCharges[] => {
    const projectsWithCharges: ProjectWithCharges[] = [];

    projects.forEach((project) => {
      const projectCharges = clientCharges.filter(
        (charge) => charge.projectId === project.id
      );
      if (projectCharges.length > 0) {
        const totalCharged = projectCharges.reduce(
          (sum, charge) => sum + charge.amount,
          0
        );
        const totalProject = project.amount || 0;
        const remainingAmount = totalProject - totalCharged;

        projectsWithCharges.push({
          project,
          charges: projectCharges,
          totalCharged,
          totalProject,
          remainingAmount,
          currency: project.currency || "ARS",
        });
      }
    });

    return projectsWithCharges;
  };

  const clientCharges = clientChargeStore.clientCharges;
  const projects = projectStore.projects;
  const projectsWithCharges = getProjectsWithCharges();

  if (loading && clientCharges.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Cobros a Clientes</Typography>
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
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium" }}>
          Filtros
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "flex-end",
          }}
        >
          <Box
            sx={{
              flex: {
                xs: "1 1 100%",
                sm: "1 1 calc(50% - 8px)",
                md: "1 1 calc(16.66% - 8px)",
              },
            }}
          >
            <FormControl fullWidth size="small">
              <InputLabel>Proyecto</InputLabel>
              <Select
                value={filters.projectId}
                label="Proyecto"
                onChange={(e) =>
                  setFilters({ ...filters, projectId: e.target.value })
                }
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
          <Box
            sx={{
              flex: {
                xs: "1 1 100%",
                sm: "1 1 calc(50% - 8px)",
                md: "1 1 calc(16.66% - 8px)",
              },
            }}
          >
            <TextField
              label="Descripción"
              size="small"
              value={filters.description}
              onChange={(e) =>
                setFilters({ ...filters, description: e.target.value })
              }
              fullWidth
            />
          </Box>
          <Box
            sx={{
              flex: {
                xs: "1 1 100%",
                sm: "1 1 calc(50% - 8px)",
                md: "1 1 calc(16.66% - 8px)",
              },
            }}
          >
            <TextField
              label="Monto Mínimo"
              size="small"
              type="number"
              value={filters.minAmount}
              onChange={(e) =>
                setFilters({ ...filters, minAmount: e.target.value })
              }
              fullWidth
            />
          </Box>
          <Box
            sx={{
              flex: {
                xs: "1 1 100%",
                sm: "1 1 calc(50% - 8px)",
                md: "1 1 calc(16.66% - 8px)",
              },
            }}
          >
            <TextField
              label="Monto Máximo"
              size="small"
              type="number"
              value={filters.maxAmount}
              onChange={(e) =>
                setFilters({ ...filters, maxAmount: e.target.value })
              }
              fullWidth
            />
          </Box>
          <Box
            sx={{
              flex: {
                xs: "1 1 100%",
                sm: "1 1 calc(50% - 8px)",
                md: "1 1 calc(16.66% - 8px)",
              },
            }}
          >
            <FormControl fullWidth size="small">
              <InputLabel>Moneda</InputLabel>
              <Select
                value={filters.currency}
                label="Moneda"
                onChange={(e) =>
                  setFilters({ ...filters, currency: e.target.value })
                }
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="ARS">ARS</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box
            sx={{
              flex: {
                xs: "1 1 100%",
                sm: "1 1 calc(50% - 8px)",
                md: "1 1 calc(16.66% - 8px)",
              },
            }}
          >
            <FormControl fullWidth size="small">
              <InputLabel>Método de Pago</InputLabel>
              <Select
                value={filters.paymentMethod}
                label="Método de Pago"
                onChange={(e) =>
                  setFilters({ ...filters, paymentMethod: e.target.value })
                }
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
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "flex-end",
            mt: 2,
          }}
        >
          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 8px)" } }}>
            <TextField
              label="Fecha Desde"
              size="small"
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box sx={{ flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 8px)" } }}>
            <TextField
              label="Fecha Hasta"
              size="small"
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleSearch}
            startIcon={<FilterIcon />}
          >
            Filtrar
          </Button>
          <Button variant="outlined" onClick={handleClearFilters}>
            Limpiar
          </Button>
        </Box>
      </Paper>

      {/* Projects with Charges Grid */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {projectsWithCharges
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((projectWithCharges) => (
            <Box
              key={projectWithCharges.project.id}
              sx={{
                width: {
                  xs: "100%",
                  sm: "calc(50% - 12px)",
                  md: "calc(33.333% - 16px)",
                },
                minWidth: {
                  xs: "100%",
                  sm: "calc(50% - 12px)",
                  md: "calc(33.333% - 16px)",
                },
              }}
            >
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent
                  sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
                >
                  {/* Project Header */}
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <ProjectIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "medium", flexGrow: 1 }}
                    >
                      {projectWithCharges.project.name}
                    </Typography>
                  </Box>

                  {/* Project Stats */}
                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Total Proyecto:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                        {formatCurrency(
                          projectWithCharges.totalProject,
                          projectWithCharges.currency
                        )}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Total Cobrado:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: "medium", color: "success.main" }}
                      >
                        {formatCurrency(
                          projectWithCharges.totalCharged,
                          projectWithCharges.currency
                        )}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Pendiente:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "medium",
                          color:
                            projectWithCharges.remainingAmount > 0
                              ? "warning.main"
                              : selectedProject?.remainingAmount &&
                                selectedProject.remainingAmount === 0
                              ? "success.main"
                              : "error.main",
                        }}
                      >
                        {formatCurrency(
                          projectWithCharges.remainingAmount,
                          projectWithCharges.currency
                        )}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Recent Charges */}
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, fontWeight: "medium" }}
                    >
                      Cobros Recientes ({projectWithCharges.charges.length})
                    </Typography>
                    {projectWithCharges.charges.slice(0, 3).map((charge) => (
                      <Box
                        key={charge.id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {charge.description || "Sin descripción"}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: "medium" }}
                        >
                          {formatCurrency(charge.amount, charge.currency)}
                        </Typography>
                      </Box>
                    ))}
                    {projectWithCharges.charges.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        +{projectWithCharges.charges.length - 3} más...
                      </Typography>
                    )}
                  </Box>

                  {/* Actions */}
                  <Box sx={{ mt: "auto", display: "flex", gap: 1 }}>
                    <Tooltip title="Ver todos los cobros">
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleViewProject(projectWithCharges.project)
                        }
                        color="primary"
                        sx={{ flexGrow: 1 }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Agregar cobro">
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
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <TablePagination
          rowsPerPageOptions={[6, 12, 24]}
          component="div"
          count={projectsWithCharges.length}
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
          position: "fixed",
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCharge ? "Editar Cobro" : "Nuevo Cobro"}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Proyecto</InputLabel>
            <Select
              value={formData.projectId}
              label="Proyecto"
              onChange={(e) =>
                setFormData({ ...formData, projectId: e.target.value })
              }
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
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
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Moneda</InputLabel>
              <Select
                value={formData.currency}
                label="Moneda"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currency: e.target.value as Currency,
                  })
                }
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
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentMethod: e.target.value as PaymentMethod,
                  })
                }
              >
                <MenuItem value="cash">Efectivo</MenuItem>
                <MenuItem value="transfer">Transferencia</MenuItem>
                <MenuItem value="card">Tarjeta</MenuItem>
                <MenuItem value="check">Cheque</MenuItem>
                <MenuItem value="other">Otro</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              margin="dense"
              label="Monto"
              type="text"
              fullWidth
              variant="outlined"
              value={formatCurrencyForInput(
                parseFloat(formData.amount) || 0,
                formData.currency
              )}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount: parseCurrencyInput(
                    e.target.value,
                    formData.currency
                  ).toString(),
                })
              }
            />
            <TextField
              margin="dense"
              label="Fecha"
              type="date"
              fullWidth
              variant="outlined"
              value={formData.date.toISOString().split("T")[0]}
              onChange={(e) =>
                setFormData({ ...formData, date: new Date(e.target.value) })
              }
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? (
              <CircularProgress size={20} />
            ) : editingCharge ? (
              "Actualizar"
            ) : (
              "Crear"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Project Dialog */}
      <Dialog
        open={viewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <ProjectIcon color="primary" />
            <Typography variant="h6">
              {selectedProject?.project.name}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Project Summary */}
          <Paper
            sx={{
              p: 3,
              mb: 3,
              background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
            }}
          >
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              <Box
                sx={{
                  flex: { xs: "1 1 100%", sm: "1 1 calc(33.333% - 16px)" },
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <TotalIcon
                    sx={{ fontSize: 40, color: "primary.main", mb: 1 }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Total Proyecto
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                  >
                    {selectedProject
                      ? formatCurrency(
                          selectedProject.totalProject,
                          selectedProject.currency
                        )
                      : ""}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  flex: { xs: "1 1 100%", sm: "1 1 calc(33.333% - 16px)" },
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <PaymentIcon
                    sx={{ fontSize: 40, color: "success.main", mb: 1 }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Total Cobrado
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "bold",
                      color:
                        selectedProject?.totalCharged! > 0
                          ? "success.main"
                          : "error.main",
                    }}
                  >
                    {selectedProject
                      ? formatCurrency(
                          selectedProject.totalCharged,
                          selectedProject.currency
                        )
                      : ""}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  flex: { xs: "1 1 100%", sm: "1 1 calc(33.333% - 16px)" },
                }}
              >
                <Box sx={{ textAlign: "center" }}>
                  <BalanceIcon
                    sx={{
                      fontSize: 40,
                      color:
                        selectedProject?.remainingAmount &&
                        selectedProject.remainingAmount > 0
                          ? "warning.main"
                          : selectedProject?.remainingAmount &&
                            selectedProject.remainingAmount < 0
                          ? "error.main"
                          : "success.main",
                      mb: 1,
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Pendiente
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "bold",
                      color:
                        selectedProject?.remainingAmount &&
                        selectedProject.remainingAmount > 0
                          ? "warning.main"
                          : selectedProject?.remainingAmount &&
                            selectedProject.remainingAmount === 0
                          ? "success.main"
                          : "error.main",
                    }}
                  >
                    {selectedProject
                      ? formatCurrency(
                          selectedProject.remainingAmount,
                          selectedProject.currency
                        )
                      : ""}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Charges List */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: "medium" }}>
            Cobros del Proyecto ({selectedProject?.charges.length || 0})
          </Typography>

          {selectedProject?.charges.length === 0 ? (
            <Alert severity="info">
              No hay cobros registrados para este proyecto.
            </Alert>
          ) : (
            <List>
              {selectedProject?.charges.map((charge, index) => (
                <React.Fragment key={charge.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: "medium" }}
                          >
                            {charge.description || "Sin descripción"}
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: "bold", color: "success.main" }}
                          >
                            {formatCurrency(charge.amount, charge.currency)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mt: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              gap: 2,
                              alignItems: "center",
                            }}
                          >
                            <Chip
                              label={formatPaymentMethod(charge.paymentMethod)}
                              size="small"
                              variant="outlined"
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatDate(charge.date)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            {!charge.deletedAt && (
                              <>
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpen(charge)}
                                  color="primary"
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(charge)}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </>
                            )}
                            {charge.deletedAt && (
                              <Tooltip title="Restaurar">
                                <IconButton
                                  size="small"
                                  onClick={() => handleRestore(charge.id)}
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
                  {index < (selectedProject?.charges.length || 0) - 1 && (
                    <Divider />
                  )}
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
