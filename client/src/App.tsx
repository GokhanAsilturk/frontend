import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { CourseProvider } from './contexts/CourseContext';
import { EnrollmentProvider } from './contexts/EnrollmentContext';
import { UIProvider } from './contexts/UIContext';
import AppRouter from './routes';
import theme from './theme/theme';

/**
 * Ana uygulama bileşeni
 * Tüm provider'ları ve routing yapısını içerir
 */
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <UIProvider>
          <AuthProvider>
            <CourseProvider>
              <EnrollmentProvider>
                <Box
                  sx={{
                    minHeight: '100vh',
                    backgroundColor: 'background.default'
                  }}
                >
                  <AppRouter />
                </Box>
              </EnrollmentProvider>
            </CourseProvider>
          </AuthProvider>
        </UIProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;