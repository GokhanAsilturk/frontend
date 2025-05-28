import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

export interface DataTableColumn<T = any> {
  id: string;
  label: string;
  minWidth?: number;
  width?: string; // width özelliği eklendi
  align?: 'right' | 'left' | 'center';
  format?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T = any> {
  columns: DataTableColumn<T>[];
  rows: T[];
  loading?: boolean;
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: (searchTerm: string) => void;
  onRefresh?: () => void;
  searchPlaceholder?: string;
  searchValue?: string;
  rowsPerPageOptions?: number[];
}

export const DataTable = <T extends Record<string, any>>({
  columns,
  rows,
  loading = false,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  onSearch,
  onRefresh,
  searchPlaceholder = 'Ara...',
  searchValue = '',
  rowsPerPageOptions = [5, 10, 25, 50],
}: DataTableProps<T>) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [localSearchValue, setLocalSearchValue] = React.useState(searchValue);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLocalSearchValue(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };
  // Render fonksiyonunu component içinde ekleyin
  const renderTableContent = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} align="center">
            <Box sx={{ py: 4 }}>Yükleniyor...</Box>
          </TableCell>
        </TableRow>
      );
    }
    
    // Veri kontrolü yapılıyor
    if (!rows || rows.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} align="center">
            <Box sx={{ py: 4 }}>Veri bulunamadı</Box>
          </TableCell>
        </TableRow>
      );
    }    
    // Burada, önceki if kontrolleri geçtiyse, rows dizisi tanımlı ve boş değildir
    // Ancak yine de güvenlik için kontrol ekleyelim
    if (Array.isArray(rows)) {
      return rows.map((row, index) => {
        const rowKey = row?.id ?? row?.key ?? `row-${index}`;
        return (
          <TableRow hover tabIndex={-1} key={rowKey}>          {Array.isArray(columns) && columns.map((column) => {
            const value = row ? row[column.id] : undefined;
            return (
              <TableCell key={column.id} align={column.align}>
                {column.format ? column.format(value, row) : value}
              </TableCell>
            );
          })}
          </TableRow>
        );
      });
    }
    
    // Eğer rows doğru bir dizi değilse, son bir güvenlik kontrolü
    return (
      <TableRow>
        <TableCell colSpan={columns.length} align="center">
          <Box sx={{ py: 4 }}>Veri yapısı geçersiz</Box>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Paper elevation={3}>
      {/* Search and Actions Bar */}
      {(onSearch || onRefresh) && (        <Box
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: isMobile ? 2 : 0,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {onSearch && (
              <TextField
                size="small"
                placeholder={searchPlaceholder}
                value={localSearchValue}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  minWidth: isMobile ? '100%' : 300,
                  width: isMobile ? '100%' : 'auto'
                }}
              />
            )}
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            justifyContent: isMobile ? 'center' : 'flex-end',
            width: isMobile ? '100%' : 'auto'
          }}>
            {onRefresh && (
              <Tooltip title="Yenile">
                <IconButton onClick={handleRefresh} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      )}

      {/* Table */}
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>            {Array.isArray(columns) && columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor: 'grey.50',
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {renderTableContent()}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        labelRowsPerPage="Sayfa başına satır:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} / ${count !== -1 ? count : to} arası`
        }
      />
    </Paper>
  );
};
