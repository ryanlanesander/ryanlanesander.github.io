import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Box, Button, Container, Heading, HStack, Spinner, Text, useToast, VStack,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

export default function WebtoonSeries() {
  const { seriesId } = useParams();
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, getToken } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const canEdit = user?.role === 'OWNER' || user?.role === 'WRITER';

  useEffect(() => {
    fetch(`/api/webtoons/${seriesId}`)
      .then((r) => { if (!r.ok) throw new Error('Not found'); return r.json(); })
      .then((d) => setSeries(d.series))
      .catch(() => navigate('/webtoons'))
      .finally(() => setLoading(false));
  }, [seriesId]);

  const handleDeleteEpisode = async (epId, epTitle) => {
    if (!confirm(`Delete "${epTitle}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/webtoons/${seriesId}/episodes/${epId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      setSeries((prev) => ({ ...prev, episodes: prev.episodes.filter((e) => e.id !== epId) }));
      toast({ title: 'Episode deleted', status: 'success', duration: 2000 });
    } catch {
      toast({ title: 'Could not delete episode', status: 'error' });
    }
  };

  if (loading) {
    return (
      <HStack justify="center" py={20}><Spinner color="brand.gold" size="xl" /></HStack>
    );
  }

  if (!series) return null;

  return (
    <Container maxW="800px" py={10} px={6}>
      <VStack spacing={6} align="stretch">
        <Button
          as={Link} to="/webtoons"
          size="sm" variant="ghost" alignSelf="flex-start"
          color="rgba(212,175,55,0.7)"
          _hover={{ color: 'brand.gold', bg: 'transparent' }}
        >
          ← All Series
        </Button>

        <HStack justify="space-between" align="flex-start">
          <VStack align="flex-start" spacing={1}>
            <Heading as="h1" size="2xl" fontFamily="heading">{series.title}</Heading>
            {series.description && (
              <Text color="rgba(212,175,55,0.7)">{series.description}</Text>
            )}
          </VStack>
          {canEdit && (
            <Button
              as={Link} to={`/webtoons/upload?series=${seriesId}`}
              size="sm" bg="brand.gold" color="brand.red"
              _hover={{ bg: 'brand.goldDark' }}
              flexShrink={0}
            >
              + Episode
            </Button>
          )}
        </HStack>

        {series.episodes.length === 0 ? (
          <Text color="rgba(212,175,55,0.5)">No episodes yet.</Text>
        ) : (
          <VStack spacing={3} align="stretch">
            {series.episodes.map((ep) => (
              <Box
                key={ep.id}
                bg="rgba(84,56,37,0.7)"
                borderRadius="10px"
                border="1px solid rgba(212,175,55,0.3)"
                px={5} py={4}
                transition="all 0.2s ease"
                _hover={{ borderColor: 'rgba(212,175,55,0.5)' }}
              >
                <HStack justify="space-between" align="center">
                  <Box
                    as={Link}
                    to={`/webtoons/${seriesId}/episodes/${ep.id}`}
                    flex={1}
                    _hover={{ textDecoration: 'none' }}
                  >
                    <Text color="rgba(212,175,55,0.5)" fontSize="xs" mb={1}>
                      Episode {ep.episodeNum}
                    </Text>
                    <Heading size="sm" fontFamily="heading" color="brand.gold">
                      {ep.title}
                    </Heading>
                  </Box>
                  {canEdit && (
                    <Button
                      size="xs" variant="ghost" color="red.400"
                      _hover={{ bg: 'rgba(255,80,80,0.12)', color: 'red.300' }}
                      onClick={() => handleDeleteEpisode(ep.id, ep.title)}
                    >
                      Delete
                    </Button>
                  )}
                </HStack>
              </Box>
            ))}
          </VStack>
        )}
      </VStack>
    </Container>
  );
}
