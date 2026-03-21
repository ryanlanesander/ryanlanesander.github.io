import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Box, Button, Container, FormControl, FormLabel, FormHelperText,
  HStack, Heading, Input, Switch, Tab, TabList, TabPanel, TabPanels,
  Tabs, Tag, TagCloseButton, TagLabel, Text, Textarea, VStack, Wrap,
  WrapItem, useToast, Spinner,
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';

const toSlug = (str) =>
  str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

export default function Write() {
  const { slug: editSlug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { getToken } = useAuth();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [loadingPost, setLoadingPost] = useState(!!editSlug);
  const tagInputRef = useRef(null);

  // Auto-generate slug from title (only when not manually edited)
  useEffect(() => {
    if (!slugTouched && title) {
      setSlug(toSlug(title));
    }
  }, [title, slugTouched]);

  // Load existing post when editing
  useEffect(() => {
    if (!editSlug) return;
    fetch(`/api/posts/${editSlug}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Post not found');
        return r.json();
      })
      .then(({ post }) => {
        setTitle(post.title);
        setSlug(post.slug);
        setSlugTouched(true);
        setContent(post.content);
        setTags(post.tags ?? []);
        setPublished(post.published);
      })
      .catch(() => toast({ title: 'Could not load post', status: 'error' }))
      .finally(() => setLoadingPost(false));
  }, [editSlug]);

  // Load drafts list
  useEffect(() => {
    fetch('/api/posts/drafts', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.ok ? r.json() : { posts: [] })
      .then((data) => setDrafts(data.posts ?? []));
  }, []);

  const addTag = () => {
    const val = tagInput.trim();
    if (val && !tags.includes(val)) {
      setTags([...tags, val]);
    }
    setTagInput('');
  };

  const handleTagKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (tag) => setTags(tags.filter((t) => t !== tag));

  const handleSave = async () => {
    if (!title.trim()) return toast({ title: 'Title is required', status: 'warning' });
    if (!slug.trim()) return toast({ title: 'Slug is required', status: 'warning' });
    if (!content.trim()) return toast({ title: 'Content is required', status: 'warning' });

    setSaving(true);
    try {
      const url = editSlug ? `/api/posts/${editSlug}` : '/api/posts';
      const method = editSlug ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ title, slug, content, tags, published }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.errors?.[0]?.msg || 'Save failed');
      }
      toast({ title: published ? 'Post published!' : 'Draft saved', status: 'success' });
      navigate(`/blog/${data.post.slug}`);
    } catch (err) {
      toast({ title: err.message, status: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loadingPost) {
    return (
      <Container maxW="900px" py={10}>
        <HStack justify="center" py={16}><Spinner color="brand.gold" size="lg" /></HStack>
      </Container>
    );
  }

  return (
    <Container maxW="900px" py={8} px={6}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" align="center">
          <Heading as="h1" size="xl" fontFamily="heading">
            {editSlug ? 'Edit Post' : 'New Post'}
          </Heading>
          <Button as={Link} to="/blog" size="sm" variant="ghost"
            color="brand.goldDark" _hover={{ color: 'brand.gold' }}>
            ← Reflections
          </Button>
        </HStack>

        {/* Title */}
        <FormControl>
          <Input
            placeholder="Post title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fontSize="2xl"
            fontFamily="heading"
            fontWeight="600"
            bg="rgba(84,56,37,0.6)"
            border="1px solid rgba(212,175,55,0.3)"
            color="brand.gold"
            _placeholder={{ color: 'rgba(212,175,55,0.35)' }}
            _focus={{ borderColor: 'brand.gold', boxShadow: '0 0 0 1px var(--chakra-colors-brand-gold)' }}
            py={6}
            px={4}
          />
        </FormControl>

        {/* Slug */}
        <FormControl>
          <FormLabel fontSize="xs" color="rgba(212,175,55,0.6)" mb={1}>URL slug</FormLabel>
          <Input
            placeholder="my-post-slug"
            value={slug}
            onChange={(e) => { setSlugTouched(true); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); }}
            size="sm"
            bg="rgba(84,56,37,0.4)"
            border="1px solid rgba(212,175,55,0.25)"
            color="rgba(212,175,55,0.8)"
            _placeholder={{ color: 'rgba(212,175,55,0.3)' }}
            _focus={{ borderColor: 'brand.gold' }}
          />
          <FormHelperText color="rgba(212,175,55,0.4)" fontSize="xs">
            /blog/{slug || '…'}
          </FormHelperText>
        </FormControl>

        {/* Tags */}
        <FormControl>
          <FormLabel fontSize="xs" color="rgba(212,175,55,0.6)" mb={1}>Tags</FormLabel>
          <Wrap spacing={2} mb={2}>
            {tags.map((tag) => (
              <WrapItem key={tag}>
                <Tag size="md" bg="rgba(212,175,55,0.2)" color="brand.gold"
                  border="1px solid rgba(212,175,55,0.4)" borderRadius="full">
                  <TagLabel>{tag}</TagLabel>
                  <TagCloseButton onClick={() => removeTag(tag)} />
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
          <HStack>
            <Input
              ref={tagInputRef}
              placeholder="Add a tag and press Enter…"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKey}
              onBlur={addTag}
              size="sm"
              bg="rgba(84,56,37,0.4)"
              border="1px solid rgba(212,175,55,0.25)"
              color="rgba(212,175,55,0.9)"
              _placeholder={{ color: 'rgba(212,175,55,0.3)' }}
              _focus={{ borderColor: 'brand.gold' }}
            />
            <Button size="sm" onClick={addTag} variant="outline"
              borderColor="rgba(212,175,55,0.4)" color="brand.gold"
              _hover={{ bg: 'rgba(212,175,55,0.1)' }}>
              Add
            </Button>
          </HStack>
        </FormControl>

        {/* Editor / Preview tabs */}
        <Tabs variant="enclosed" colorScheme="yellow" isFitted>
          <TabList borderColor="rgba(212,175,55,0.3)">
            <Tab color="rgba(212,175,55,0.7)" _selected={{ color: 'brand.gold', borderColor: 'rgba(212,175,55,0.4)', bg: 'rgba(84,56,37,0.6)' }}>
              Write
            </Tab>
            <Tab color="rgba(212,175,55,0.7)" _selected={{ color: 'brand.gold', borderColor: 'rgba(212,175,55,0.4)', bg: 'rgba(84,56,37,0.6)' }}>
              Preview
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel p={0} pt={2}>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post in Markdown…"
                minH="480px"
                bg="rgba(84,56,37,0.5)"
                border="1px solid rgba(212,175,55,0.25)"
                color="rgba(212,175,55,0.95)"
                _placeholder={{ color: 'rgba(212,175,55,0.3)' }}
                _focus={{ borderColor: 'brand.gold', boxShadow: 'none' }}
                fontFamily="monospace"
                fontSize="sm"
                resize="vertical"
              />
            </TabPanel>
            <TabPanel p={0} pt={2}>
              <Box
                minH="480px"
                bg="rgba(84,56,37,0.5)"
                border="1px solid rgba(212,175,55,0.25)"
                borderRadius="md"
                px={6}
                py={5}
                sx={{
                  '& h1, & h2, & h3, & h4': { fontFamily: 'heading', color: 'brand.gold', mt: 6, mb: 3 },
                  '& p': { mb: 4, lineHeight: 1.8, color: 'rgba(212,175,55,0.9)' },
                  '& em': { color: 'brand.gold', fontStyle: 'italic' },
                  '& strong': { color: 'brand.gold', fontWeight: 700 },
                  '& a': { color: 'brand.goldDark', textDecoration: 'underline' },
                  '& blockquote': { borderLeft: '3px solid', borderColor: 'brand.gold', pl: 4, my: 4, color: 'rgba(212,175,55,0.75)', fontStyle: 'italic' },
                  '& ul, & ol': { pl: 6, mb: 4 },
                  '& li': { mb: 1, color: 'rgba(212,175,55,0.9)' },
                  '& hr': { borderColor: 'rgba(212,175,55,0.3)', my: 6 },
                }}
              >
                {content ? <ReactMarkdown>{content}</ReactMarkdown> : (
                  <Text color="rgba(212,175,55,0.3)" fontStyle="italic">Nothing to preview yet…</Text>
                )}
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Bottom toolbar */}
        <HStack justify="space-between" pt={2}>
          <HStack spacing={3} align="center">
            <Switch
              isChecked={published}
              onChange={(e) => setPublished(e.target.checked)}
              colorScheme="yellow"
              id="published-toggle"
            />
            <FormLabel htmlFor="published-toggle" mb={0} cursor="pointer"
              color={published ? 'brand.gold' : 'rgba(212,175,55,0.5)'} fontSize="sm" fontWeight="600">
              {published ? 'Published' : 'Draft'}
            </FormLabel>
          </HStack>
          <Button
            onClick={handleSave}
            isLoading={saving}
            loadingText="Saving…"
            bg="brand.gold"
            color="brand.redDark"
            fontWeight="700"
            _hover={{ bg: 'brand.goldDark' }}
            px={8}
          >
            {published ? 'Publish' : 'Save Draft'}
          </Button>
        </HStack>

        {/* Drafts list */}
        {drafts.length > 0 && (
          <Box mt={4} pt={6} borderTop="1px solid rgba(212,175,55,0.2)">
            <Heading size="sm" fontFamily="heading" color="rgba(212,175,55,0.7)" mb={3}>
              Your Drafts
            </Heading>
            <VStack spacing={2} align="stretch">
              {drafts.map((d) => (
                <HStack
                  key={d.slug}
                  as={Link}
                  to={`/write/${d.slug}`}
                  justify="space-between"
                  px={4}
                  py={3}
                  bg="rgba(84,56,37,0.4)"
                  borderRadius="8px"
                  border="1px solid rgba(212,175,55,0.2)"
                  _hover={{ borderColor: 'rgba(212,175,55,0.5)', textDecoration: 'none' }}
                  transition="border-color 0.2s"
                >
                  <Text color="brand.gold" fontWeight="600" fontSize="sm">{d.title}</Text>
                  <Text color="rgba(212,175,55,0.5)" fontSize="xs">
                    {new Date(d.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        )}
      </VStack>
    </Container>
  );
}
