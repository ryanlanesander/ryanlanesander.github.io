import { useEffect, useState } from 'react';
import {
  Container, Heading, SimpleGrid, Card, CardBody, Text, VStack, Box,
  Image, HStack, Skeleton,
} from '@chakra-ui/react';

// Add new links here. `title`, `description` and `image` are optional:
// anything left out is filled in from the page's own preview (Open Graph)
// data, fetched in the browser. Anything written here wins over the fetched data.
const LINKS = [
  {
    url: 'https://ebird.org/species/litbus1?continue',
    title: 'Little Bustard',
    description:
      'Tetrax tetrax, a grassland bird of Europe and Asia. Look up the male\'s display call. You\'ll see.',
  },
];

const PREVIEW_API = 'https://api.microlink.io/?url=';
const CACHE_PREFIX = 'funny-preview:';
const CACHE_MS = 7 * 24 * 60 * 60 * 1000;

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function readCache(url) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + url);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw);
    return Date.now() - at < CACHE_MS ? data : null;
  } catch {
    return null;
  }
}

function writeCache(url, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + url, JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* storage unavailable — fine, we just refetch next time */
  }
}

function usePreview(url) {
  const [preview, setPreview] = useState(() => readCache(url));
  const [loading, setLoading] = useState(!preview);

  useEffect(() => {
    if (preview) return undefined;
    let cancelled = false;
    fetch(PREVIEW_API + encodeURIComponent(url))
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((json) => {
        if (cancelled || json.status !== 'success') return;
        const d = json.data || {};
        const data = {
          title: d.title,
          description: d.description,
          image: d.image?.url || d.screenshot?.url,
          logo: d.logo?.url,
          publisher: d.publisher,
        };
        writeCache(url, data);
        setPreview(data);
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [url, preview]);

  return { preview: preview || {}, loading };
}

function LinkCard({ link }) {
  const { preview, loading } = usePreview(link.url);
  const [imgFailed, setImgFailed] = useState(false);
  const host = hostOf(link.url);
  const title = link.title || preview.title || host;
  const description = link.description || preview.description;
  const image = link.image || preview.image;
  const logo = preview.logo || `https://www.google.com/s2/favicons?domain=${host}&sz=64`;

  return (
    <Card
      as="a"
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      overflow="hidden"
      bg="rgba(84,56,37,0.7)"
      borderRadius="10px"
      border="1px solid rgba(212,175,55,0.3)"
      boxShadow="0 4px 12px rgba(0,0,0,0.2)"
      _hover={{
        boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
        borderColor: 'rgba(212,175,55,0.6)',
        textDecoration: 'none',
        transform: 'translateY(-2px)',
      }}
      transition="all 0.3s ease"
    >
      <Box h="170px" bg="rgba(0,0,0,0.25)" position="relative">
        {image && !imgFailed ? (
          <Image
            src={image}
            alt=""
            w="100%"
            h="100%"
            objectFit="cover"
            onError={() => setImgFailed(true)}
          />
        ) : loading ? (
          <Skeleton h="100%" startColor="rgba(212,175,55,0.1)" endColor="rgba(212,175,55,0.25)" />
        ) : (
          <VStack h="100%" justify="center">
            <Text fontSize="4xl" aria-hidden>🔗</Text>
          </VStack>
        )}
      </Box>
      <CardBody p={4}>
        <VStack align="stretch" spacing={2}>
          <Heading size="md" fontFamily="heading" color="brand.gold" noOfLines={2}>
            {title}
          </Heading>
          {description && (
            <Text fontSize="sm" color="rgba(212,175,55,0.8)" noOfLines={3}>
              {description}
            </Text>
          )}
          <HStack spacing={2} pt={1}>
            <Image src={logo} alt="" boxSize="16px" borderRadius="3px" fallback={<Box />} />
            <Text fontSize="xs" color="rgba(212,175,55,0.6)">{host}</Text>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
}

export default function FunnyStuff() {
  return (
    <Container maxW="900px" py={10} px={6}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="2xl" fontFamily="heading">Funny Stuff</Heading>
        <Text color="rgba(212,175,55,0.8)">
          Things around the internet that made me laugh. Links open in a new tab.
        </Text>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={5}>
          {LINKS.map((link) => (
            <LinkCard key={link.url} link={link} />
          ))}
        </SimpleGrid>
      </VStack>
    </Container>
  );
}
