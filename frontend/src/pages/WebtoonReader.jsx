import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Button, HStack, Spinner, Text, VStack } from '@chakra-ui/react';

export default function WebtoonReader() {
  const { seriesId, episodeId } = useParams();
  const [episode, setEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setEpisode(null);
    fetch(`/api/webtoons/${seriesId}/episodes/${episodeId}`)
      .then((r) => { if (!r.ok) throw new Error('Episode not found'); return r.json(); })
      .then((d) => setEpisode(d.episode))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [seriesId, episodeId]);

  if (loading) {
    return (
      <Box minH="60vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner color="brand.gold" size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={20}>
        <Text color="red.300" mb={4}>{error}</Text>
        <Button as={Link} to="/webtoons" variant="outline"
          borderColor="brand.gold" color="brand.gold"
          _hover={{ bg: 'rgba(212,175,55,0.1)' }}>
          Back to Webtoons
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Sticky sub-nav */}
      <HStack
        px={4} py={3}
        bg="rgba(20,10,5,0.92)"
        borderBottom="1px solid rgba(212,175,55,0.2)"
        justify="space-between"
        position="sticky"
        top="48px"
        zIndex={50}
        backdropFilter="blur(8px)"
      >
        <Button
          as={Link} to={`/webtoons/${seriesId}`}
          size="sm" variant="ghost"
          color="rgba(212,175,55,0.7)"
          _hover={{ color: 'brand.gold', bg: 'transparent' }}
        >
          ← {episode.series?.title}
        </Button>
        <VStack spacing={0} align="center" flex={1}>
          <Text fontSize="xs" color="rgba(212,175,55,0.5)">Episode {episode.episodeNum}</Text>
          <Text fontSize="sm" color="brand.gold" fontWeight="600" noOfLines={1}>
            {episode.title}
          </Text>
        </VStack>
        <Box w="120px" />
      </HStack>

      {/* Seamless scroll — images stacked with zero gap */}
      <Box maxW="800px" mx="auto" bg="black">
        {episode.pages.map((page) => (
          <Box key={page.id} lineHeight={0} display="block">
            <img
              src={page.imageData}
              alt=""
              style={{ width: '100%', display: 'block' }}
              loading="lazy"
            />
          </Box>
        ))}
      </Box>

      {/* Bottom nav */}
      <HStack justify="center" py={10} spacing={4} bg="rgba(20,10,5,0.5)">
        <Button
          as={Link} to={`/webtoons/${seriesId}`}
          variant="outline"
          borderColor="rgba(212,175,55,0.4)" color="brand.gold"
          _hover={{ bg: 'rgba(212,175,55,0.1)' }}
        >
          Back to Series
        </Button>
      </HStack>
    </Box>
  );
}
