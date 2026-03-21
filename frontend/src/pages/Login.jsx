import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Container, VStack, Heading, FormControl, FormLabel, Input,
  Button, Text, Alert, AlertIcon, Box,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const isJson = res.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await res.json() : {};
      if (!res.ok) {
        setError(data.error || `Server error (${res.status})`);
        return;
      }
      login(data.token, data.user);
      navigate(from, { replace: true });
    } catch {
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="440px" py={16} px={6}>
      <Box
        bg="rgba(84,56,37,0.7)"
        borderRadius="12px"
        border="1px solid rgba(212,175,55,0.3)"
        boxShadow="0 4px 24px rgba(0,0,0,0.3)"
        p={8}
      >
        <VStack spacing={6} align="stretch">
          <Heading size="xl" fontFamily="heading" textAlign="center">Log In</Heading>

          {error && (
            <Alert status="error" borderRadius="8px" bg="rgba(255,80,80,0.15)" color="red.300"
              border="1px solid rgba(255,80,80,0.3)">
              <AlertIcon color="red.300" />
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </FormControl>

              <Button
                type="submit"
                variant="solid"
                isLoading={loading}
                loadingText="Logging in…"
                w="100%"
                mt={2}
              >
                Log In
              </Button>
            </VStack>
          </form>

          <Text textAlign="center" fontSize="sm" color="rgba(212,175,55,0.7)">
            Don't have an account?{' '}
            <Text as={Link} to="/register" color="brand.gold" fontWeight="600" _hover={{ color: 'brand.goldDark' }}>
              Register
            </Text>
          </Text>
        </VStack>
      </Box>
    </Container>
  );
}
