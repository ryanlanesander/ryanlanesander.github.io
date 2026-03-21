import { useEffect, useState } from 'react';
import { Box, Heading, Text, VStack, HStack, Badge, Container, SimpleGrid,
  Card, CardBody, CardHeader, Spinner, Link as ChakraLink } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts')
      .then((r) => r.json())
      .then((data) => {
        // API returns newest-first; take top 3
        setPosts((data.posts ?? []).slice(0, 3));
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container maxW="900px" py={10} px={6}>
      <VStack spacing={10} align="stretch">
        {/* Hero */}
        <Box textAlign="center" py={8}>
          <Heading as="h1" size="2xl" mb={4} fontFamily="heading">
            Ryan
          </Heading>
          <Text fontSize="lg" color="rgba(212,175,55,0.8)">
            Reflections, games, and tools.
          </Text>
        </Box>

        {/* Recent Posts */}
        <Box>
          <HStack justify="space-between" mb={4}>
            <Heading as="h2" size="lg" fontFamily="heading">
              Recent Reflections
            </Heading>
            <ChakraLink as={Link} to="/blog" fontSize="sm" color="brand.goldDark" fontWeight="600">
              View all →
            </ChakraLink>
          </HStack>

          {loading ? (
            <HStack justify="center" py={8}><Spinner color="brand.gold" /></HStack>
          ) : posts.length === 0 ? (
            <Text color="rgba(212,175,55,0.6)">No posts yet.</Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </SimpleGrid>
          )}
        </Box>

        {/* Section Links */}
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} pt={4}>
          <SectionCard
            title="Lil Tools"
            description="Game creation dashboard — 8 formats to build and export."
            to="/tools"
          />
          <SectionCard
            title="Games"
            description="Beats, Clue Cards, and TicSnackToe."
            to="/games"
          />
        </SimpleGrid>
      </VStack>
    </Container>
  );
}

function PostCard({ post }) {
  return (
    <Card
      as={Link}
      to={`/blog/${post.slug}`}
      bg="rgba(84,56,37,0.7)"
      borderRadius="10px"
      border="1px solid rgba(212,175,55,0.3)"
      boxShadow="0 4px 12px rgba(0,0,0,0.2)"
      _hover={{ boxShadow: '0 6px 20px rgba(0,0,0,0.3)', textDecoration: 'none',
        borderColor: 'rgba(212,175,55,0.6)' }}
      transition="all 0.3s ease"
      p={5}
    >
      <CardHeader p={0} mb={2}>
        <Heading size="sm" fontFamily="heading" color="brand.gold" noOfLines={2}>
          {post.title}
        </Heading>
      </CardHeader>
      <CardBody p={0}>
        <Text fontSize="xs" color="rgba(212,175,55,0.6)" mb={2}>
          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
        </Text>
        <HStack spacing={1} flexWrap="wrap">
          {post.tags?.map((tag) => (
            <Badge key={tag} fontSize="xs" bg="rgba(212,175,55,0.2)" color="brand.gold"
              borderRadius="4px">
              {tag}
            </Badge>
          ))}
        </HStack>
      </CardBody>
    </Card>
  );
}

function SectionCard({ title, description, to }) {
  return (
    <Card
      as={Link}
      to={to}
      bg="rgba(84,56,37,0.7)"
      borderRadius="10px"
      border="1px solid rgba(212,175,55,0.3)"
      boxShadow="0 4px 12px rgba(0,0,0,0.2)"
      _hover={{ boxShadow: '0 6px 20px rgba(0,0,0,0.3)', textDecoration: 'none',
        borderColor: 'rgba(212,175,55,0.6)' }}
      transition="all 0.3s ease"
      p={5}
    >
      <CardHeader p={0} mb={2}>
        <Heading size="md" fontFamily="heading" color="brand.gold">{title}</Heading>
      </CardHeader>
      <CardBody p={0}>
        <Text fontSize="sm" color="rgba(212,175,55,0.8)">{description}</Text>
      </CardBody>
    </Card>
  );
}
