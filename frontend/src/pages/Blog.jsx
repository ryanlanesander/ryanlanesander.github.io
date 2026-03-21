import { useEffect, useState } from 'react';
import {
  Box, Heading, Text, VStack, HStack, Badge, Container, Spinner, Button, Wrap, WrapItem,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const tagLabel = (tag) => tag.replace(/-/g, ' ');

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTag, setActiveTag] = useState('all');

  useEffect(() => {
    fetch('/api/posts')
      .then((r) => {
        if (!r.ok) throw new Error('Unable to load posts');
        return r.json();
      })
      .then((data) => setPosts(data.posts ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const allTags = ['all', ...Array.from(new Set(posts.flatMap((p) => p.tags ?? []))).sort()];

  const filtered =
    activeTag === 'all' ? posts : posts.filter((p) => p.tags?.includes(activeTag));

  return (
    <Container maxW="800px" py={10} px={6}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="2xl" fontFamily="heading">
          Reflections
        </Heading>

        {/* Tag filter */}
        {!loading && !error && (
          <Wrap spacing={2}>
            {allTags.map((tag) => (
              <WrapItem key={tag}>
                <Button
                  size="sm"
                  onClick={() => setActiveTag(tag)}
                  variant={activeTag === tag ? 'solid' : 'outline'}
                  borderColor="brand.gold"
                  color={activeTag === tag ? 'brand.red' : 'brand.gold'}
                  bg={activeTag === tag ? 'brand.gold' : 'transparent'}
                  _hover={{
                    bg: activeTag === tag ? 'brand.goldDark' : 'rgba(212,175,55,0.12)',
                  }}
                >
                  {tag === 'all' ? 'All' : tagLabel(tag)}
                </Button>
              </WrapItem>
            ))}
          </Wrap>
        )}

        {/* States */}
        {loading && <HStack justify="center" py={8}><Spinner color="brand.gold" /></HStack>}
        {error && <Text color="red.300">{error}</Text>}
        {!loading && !error && filtered.length === 0 && (
          <Text color="rgba(212,175,55,0.6)">No posts for this tag.</Text>
        )}

        {/* Post list */}
        <VStack spacing={4} align="stretch">
          {filtered.map((post) => (
            <PostRow key={post.slug} post={post} slug={post.slug} />
          ))}
        </VStack>
      </VStack>
    </Container>
  );
}

function PostRow({ post, slug }) {
  return (
    <Box
      as={Link}
      to={`/blog/${slug}`}
      display="block"
      bg="rgba(84,56,37,0.7)"
      borderRadius="10px"
      border="1px solid rgba(212,175,55,0.3)"
      boxShadow="0 4px 12px rgba(0,0,0,0.2)"
      px={6}
      py={5}
      _hover={{
        boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
        borderColor: 'rgba(212,175,55,0.6)',
        textDecoration: 'none',
      }}
      transition="all 0.3s ease"
    >
      <Heading size="md" fontFamily="heading" color="brand.gold" mb={2}>
        {post.title}
      </Heading>
      <HStack spacing={3} flexWrap="wrap">
        <Text fontSize="sm" color="rgba(212,175,55,0.6)">
          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
        </Text>
        <HStack spacing={1} flexWrap="wrap">
          {post.tags?.map((tag) => (
            <Badge key={tag} fontSize="xs" bg="rgba(212,175,55,0.2)" color="brand.gold"
              borderRadius="4px">
              {tagLabel(tag)}
            </Badge>
          ))}
        </HStack>
      </HStack>
    </Box>
  );
}
