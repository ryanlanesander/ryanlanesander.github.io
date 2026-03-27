import { Box, HStack, Link as ChakraLink, Button, Text, Spacer } from '@chakra-ui/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/blog', label: 'Reflections' },
  { to: '/webtoons', label: 'Webtoons' },
  { to: '/games', label: 'Games' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleLinks = [];
  if (user?.role === 'OWNER' || user?.role === 'WRITER') {
    roleLinks.push({ to: '/write', label: 'Write' });
  }
  if (user?.role === 'OWNER') {
    roleLinks.push({ to: '/admin', label: 'Admin' });
  }

  return (
    <Box
      as="nav"
      bg="brand.redDark"
      px={4}
      py={0}
      position="sticky"
      top={0}
      zIndex={100}
      boxShadow="0 2px 8px rgba(0,0,0,0.3)"
    >
      <HStack spacing={0} align="stretch" minH="48px">
        {[...NAV_LINKS, ...roleLinks].map(({ to, label }) => {
          const isActive = pathname === to || (to !== '/' && pathname.startsWith(to));
          return (
            <ChakraLink
              as={Link}
              to={to}
              key={to}
              px={4}
              py={3}
              display="flex"
              alignItems="center"
              fontSize="sm"
              fontWeight="600"
              color={isActive ? 'white' : 'rgba(255,255,255,0.85)'}
              bg={isActive ? 'brand.goldDark' : 'transparent'}
              textDecoration="none"
              transition="background-color 0.2s ease, color 0.2s ease"
              _hover={{ bg: 'rgba(221,221,221,0.15)', color: 'white', textDecoration: 'none' }}
              position="relative"
            >
              {label}
            </ChakraLink>
          );
        })}

        <Spacer />

        <HStack spacing={2} px={3} align="center">
          {isLoggedIn ? (
            <>
              <Text fontSize="sm" color="rgba(255,255,255,0.8)">
                {user.displayName}
              </Text>
              <Button size="sm" variant="outline" onClick={handleLogout}
                borderColor="rgba(212,175,55,0.6)" color="brand.gold"
                _hover={{ bg: 'rgba(212,175,55,0.15)' }}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" as={Link} to="/login"
                color="rgba(255,255,255,0.85)" _hover={{ bg: 'rgba(221,221,221,0.1)' }}>
                Log in
              </Button>
              <Button size="sm" variant="solid" as={Link} to="/register">
                Register
              </Button>
            </>
          )}
        </HStack>
      </HStack>
    </Box>
  );
}
