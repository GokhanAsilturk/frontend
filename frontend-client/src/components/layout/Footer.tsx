import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Divider,
} from '@mui/material';

/**
 * Alt bilgi bileşeni
 * Telif hakkı ve bağlantılar içerir
 */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={
        {
          mt: 'auto',
          py: 3,
          px: 2,
          backgroundColor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
        }
      }
    >
      <Container maxWidth="lg">
        <Divider sx={{ mb: 2 }} />
        <Box
          sx={
            {
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }
          }
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Student Portal. Tüm hakları saklıdır.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link
              href="#"
              variant="body2"
              color="text.secondary"
              underline="hover"
            >
              Gizlilik Politikası
            </Link>
            <Link
              href="#"
              variant="body2"
              color="text.secondary"
              underline="hover"
            >
              Kullanım Şartları
            </Link>
            <Link
              href="#"
              variant="body2"
              color="text.secondary"
              underline="hover"
            >
              İletişim
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;