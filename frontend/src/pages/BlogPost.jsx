import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box, Heading, Text, VStack, HStack, Badge, Container, Spinner, Button,
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/posts/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error('Post not found');
        return r.json();
      })
      .then((data) => setPost(data.post))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <Container maxW="800px" py={10} px={6}>
        <HStack justify="center" py={16}><Spinner color="brand.gold" size="lg" /></HStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="800px" py={10} px={6}>
        <Text color="red.300">{error}</Text>
        <Button mt={4} as={Link} to="/blog" variant="outline">← Back to Reflections</Button>
      </Container>
    );
  }

  return (
    <Container maxW="800px" py={10} px={6}>
      <VStack spacing={6} align="stretch">
        <Button as={Link} to="/blog" variant="ghost" size="sm" alignSelf="flex-start"
          color="brand.goldDark" _hover={{ color: 'brand.gold' }}>
          ← Back to Reflections
        </Button>

        <Box>
          <Heading as="h1" size="xl" fontFamily="heading" mb={2}>{post.title}</Heading>
          <HStack spacing={3} flexWrap="wrap" mb={6}>
            <Text fontSize="sm" color="rgba(212,175,55,0.6)">
              {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Draft'}
            </Text>
            {post.author?.displayName && (
              <Text fontSize="sm" color="rgba(212,175,55,0.5)">by {post.author.displayName}</Text>
            )}
            {post.tags?.map((tag) => (
              <Badge key={tag} fontSize="xs" bg="rgba(212,175,55,0.2)" color="brand.gold"
                borderRadius="4px">
                {tag.replace(/-/g, ' ')}
              </Badge>
            ))}
          </HStack>
        </Box>

        <Box
          bg="rgba(84,56,37,0.7)"
          borderRadius="10px"
          border="1px solid rgba(212,175,55,0.25)"
          px={{ base: 5, md: 8 }}
          py={8}
          className="blog-prose"
          sx={{
            '& h1, & h2, & h3, & h4': {
              fontFamily: 'heading',
              color: 'brand.gold',
              mt: 6,
              mb: 3,
            },
            '& p': { mb: 4, lineHeight: 1.8, color: 'rgba(212,175,55,0.9)' },
            '& em': { color: 'brand.gold', fontStyle: 'italic' },
            '& strong': { color: 'brand.gold', fontWeight: 700 },
            '& a': { color: 'brand.goldDark', textDecoration: 'underline' },
            '& blockquote': {
              borderLeft: '3px solid',
              borderColor: 'brand.gold',
              pl: 4,
              my: 4,
              color: 'rgba(212,175,55,0.75)',
              fontStyle: 'italic',
            },
            '& ul, & ol': { pl: 6, mb: 4 },
            '& li': { mb: 1, color: 'rgba(212,175,55,0.9)' },
            '& hr': { borderColor: 'rgba(212,175,55,0.3)', my: 6 },
          }}
        >
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </Box>
      </VStack>
    </Container>
  );
}
