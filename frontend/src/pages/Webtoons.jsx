import { useEffect, useState } from 'react';
import {
  Box, Container, Grid, Heading, HStack, Spinner, Text, VStack, Button,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Webtoons() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/webtoons')
      .then((r) => { if (!r.ok) throw new Error('Failed to load'); return r.json(); })
      .then((d) => setSeries(d.series ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const canUpload = user?.role === 'OWNER' || user?.role === 'WRITER';

  return (
    <Container maxW="900px" py={10} px={6}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between" align="center">
          <Heading as="h1" size="2xl" fontFamily="heading">Webtoons</Heading>
          {canUpload && (
            <Button
              onClick={() => navigate('/webtoons/upload')}
              bg="brand.gold" color="brand.red"
              _hover={{ bg: 'brand.goldDark' }}
            >
              Upload Episode
            </Button>
          )}
        </HStack>

        {loading && <HStack justify="center" py={12}><Spinner color="brand.gold" size="lg" /></HStack>}
        {error && <Text color="red.300">{error}</Text>}
        {!loading && !error && series.length === 0 && (
          <Text color="rgba(212,175,55,0.6)">No series yet.</Text>
        )}

        <Grid
          templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
          gap={4}
        >
          {series.map((s) => (
            <Box
              key={s.id}
              as={Link}
              to={`/webtoons/${s.id}`}
              bg="rgba(84,56,37,0.7)"
              borderRadius="10px"
              border="1px solid rgba(212,175,55,0.3)"
              px={5} py={5}
              _hover={{
                borderColor: 'rgba(212,175,55,0.6)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                textDecoration: 'none',
              }}
              transition="all 0.3s ease"
            >
              <Heading size="md" fontFamily="heading" color="brand.gold" mb={2}>
                {s.title}
              </Heading>
              {s.description && (
                <Text fontSize="sm" color="rgba(212,175,55,0.7)" mb={3} noOfLines={2}>
                  {s.description}
                </Text>
              )}
              <Text fontSize="xs" color="rgba(212,175,55,0.5)">
                {s._count.episodes} episode{s._count.episodes !== 1 ? 's' : ''}
              </Text>
            </Box>
          ))}
        </Grid>
      </VStack>
    </Container>
  );
}
