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
  Chip,
  Alert,
  CircularProgress,
  Fab,
  Switch,
  FormControlLabel,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Restore as RestoreIcon,
  RestoreFromTrash as DeletedIcon,
  MoreVert as MoreVertIcon,
  DeleteForever as HardDeleteIcon,
} from '@mui/icons-material';
import { formatDateTime } from '../utils/formatters';
import type { Note } from '../types';
import { useNoteStore } from '../stores/noteStore';

export default function Notes() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedNoteForMenu, setSelectedNoteForMenu] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
  });
  const [filters, setFilters] = useState({
    title: '',
    content: '',
    tags: '',
  });

  const noteStore = useNoteStore();

  useEffect(() => {
    loadNotes();
  }, [page, rowsPerPage, showDeleted]);

  const loadNotes = async () => {
    try {
      const response = await noteStore.loadNotesPaginated({
        page: page + 1,
        limit: rowsPerPage,
        title: filters.title || undefined,
        content: filters.content || undefined,
        tags: filters.tags || undefined,
        includeDeleted: showDeleted,
      });
      setTotal(response.total);
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadNotes();
  };

  const handleClearFilters = () => {
    setFilters({
      title: '',
      content: '',
      tags: '',
    });
    setPage(0);
    loadNotes();
  };

  const handleViewNote = (note: Note) => {
    setSelectedNote(note);
    setViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialog(false);
    setSelectedNote(null);
  };

  const handleOpen = (note?: Note) => {
    setEditingNote(note || null);
    if (note) {
      setFormData({
        title: note.title,
        content: note.content,
        tags: note.tags?.join(', ') || '',
      });
    } else {
      setFormData({
        title: '',
        content: '',
        tags: '',
      });
    }
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingNote(null);
    setFormData({
      title: '',
      content: '',
      tags: '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) return;

    try {
      const noteData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      };

      if (editingNote) {
        await noteStore.updateNote(editingNote.id, noteData);
      } else {
        await noteStore.createNote(noteData);
      }

      await loadNotes();
      handleClose();
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta nota?')) return;

    try {
      await noteStore.deleteNote(noteId);
      await loadNotes();
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleRestore = async (noteId: string) => {
    try {
      await noteStore.restoreNote(noteId);
      await loadNotes();
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleHardDelete = async (noteId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta nota permanentemente? Esta acción no se puede deshacer.')) return;

    try {
      await noteStore.hardDeleteNote(noteId);
      await loadNotes();
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, note: Note) => {
    setMenuAnchor(event.currentTarget);
    setSelectedNoteForMenu(note);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedNoteForMenu(null);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const notes = noteStore.notes;
  const loading = noteStore.isLoading;
  const error = noteStore.error;

  if (loading && notes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Notas</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={showDeleted}
              onChange={(e) => setShowDeleted(e.target.checked)}
              color="warning"
            />
          }
          label="Mostrar eliminadas"
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
              label="Título"
              size="small"
              value={filters.title}
              onChange={(e) => setFilters({ ...filters, title: e.target.value })}
              fullWidth
            />
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(20% - 8px)' } }}>
            <TextField
              label="Contenido"
              size="small"
              value={filters.content}
              onChange={(e) => setFilters({ ...filters, content: e.target.value })}
              fullWidth
            />
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(20% - 8px)' } }}>
            <TextField
              label="Etiquetas"
              size="small"
              value={filters.tags}
              onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
              fullWidth
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

      {/* Notes Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Título</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Contenido</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Etiquetas</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((note) => (
              <TableRow 
                key={note.id} 
                hover
                sx={{
                  opacity: note.deletedAt ? 0.6 : 1,
                  backgroundColor: note.deletedAt ? 'action.hover' : 'inherit',
                }}
              >
                <TableCell>
                  {note.deletedAt ? (
                    <Chip
                      icon={<DeletedIcon />}
                      label="Eliminada"
                      color="error"
                      size="small"
                    />
                  ) : (
                    <Chip
                      label="Activa"
                      color="success"
                      size="small"
                    />
                  )}
                </TableCell>
                <TableCell sx={{ maxWidth: 200 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {note.title}
                  </Typography>
                </TableCell>
                <TableCell sx={{ maxWidth: 300 }}>
                  <Typography variant="body2" color="text.secondary">
                    {note.content.length > 100
                      ? `${note.content.substring(0, 100)}...`
                      : note.content}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {note.tags?.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(note.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleViewNote(note)}
                      color="primary"
                    >
                      <ViewIcon />
                    </IconButton>
                    {!note.deletedAt && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handleOpen(note)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(note.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                    {note.deletedAt && (
                      <>
                        <Tooltip title="Restaurar">
                          <IconButton
                            size="small"
                            onClick={() => handleRestore(note.id)}
                            color="success"
                          >
                            <RestoreIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Más opciones">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, note)}
                            color="default"
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Tooltip>
                      </>
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
          {editingNote ? 'Editar Nota' : 'Nueva Nota'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Título"
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Contenido"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Etiquetas"
            fullWidth
            variant="outlined"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            helperText="Ejemplo: trabajo, importante, pendiente"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : editingNote ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialog} onClose={handleCloseViewDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedNote?.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
            {selectedNote?.content}
          </Typography>
          {selectedNote?.tags && selectedNote.tags.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Etiquetas:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selectedNote.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
          <Typography variant="caption" color="text.secondary">
            Creada: {selectedNote ? formatDateTime(selectedNote.createdAt) : ''}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Menu for deleted notes */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            if (selectedNoteForMenu) {
              handleHardDelete(selectedNoteForMenu.id);
            }
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <HardDeleteIcon color="error" />
          </ListItemIcon>
          <ListItemText>Eliminar permanentemente</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
} 