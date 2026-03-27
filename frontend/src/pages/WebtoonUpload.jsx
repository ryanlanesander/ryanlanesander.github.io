import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Button, Container, FormControl, FormLabel, Heading, HStack, Input,
  Progress, Select, Spinner, Text, Textarea, VStack, useToast,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

// Compress a File to JPEG, capping width at maxWidth pixels
function compressImage(file, maxWidth = 800, quality = 0.82) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function WebtoonUpload() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef();

  // Series state
  const [seriesList, setSeriesList] = useState([]);
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [seriesMode, setSeriesMode] = useState('existing'); // 'existing' | 'new'
  const [selectedSeriesId, setSelectedSeriesId] = useState(searchParams.get('series') ?? '');
  const [newSeriesTitle, setNewSeriesTitle] = useState('');
  const [newSeriesDesc, setNewSeriesDesc] = useState('');

  // Episode state
  const [episodeTitle, setEpisodeTitle] = useState('');

  // Images
  const [pages, setPages] = useState([]); // { file, preview }[]

  // Upload progress
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ step: '', done: 0, total: 0 });

  useEffect(() => {
    fetch('/api/webtoons')
      .then((r) => r.json())
      .then((d) => {
        setSeriesList(d.series ?? []);
        if (!searchParams.get('series') && d.series?.length > 0) {
          setSelectedSeriesId(d.series[0].id);
        }
        if (d.series?.length === 0) setSeriesMode('new');
      })
      .catch(() => setSeriesMode('new'))
      .finally(() => setLoadingSeries(false));
  }, []);

  const handleFiles = (files) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!imageFiles.length) return;
    const newPages = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPages((prev) => [...prev, ...newPages]);
  };

  const moveUp = (i) => {
    if (i === 0) return;
    setPages((prev) => {
      const next = [...prev];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return next;
    });
  };

  const moveDown = (i) => {
    setPages((prev) => {
      if (i === prev.length - 1) return prev;
      const next = [...prev];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return next;
    });
  };

  const removePage = (i) => {
    setPages((prev) => {
      URL.revokeObjectURL(prev[i].preview);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (!episodeTitle.trim()) {
      toast({ title: 'Episode title required', status: 'error' }); return;
    }
    if (pages.length === 0) {
      toast({ title: 'Add at least one image', status: 'error' }); return;
    }
    if (seriesMode === 'new' && !newSeriesTitle.trim()) {
      toast({ title: 'Series title required', status: 'error' }); return;
    }
    if (seriesMode === 'existing' && !selectedSeriesId) {
      toast({ title: 'Select a series', status: 'error' }); return;
    }

    const token = getToken();
    setUploading(true);

    try {
      // 1. Create series if new
      let seriesId = selectedSeriesId;
      if (seriesMode === 'new') {
        setProgress({ step: 'Creating series…', done: 0, total: pages.length + 2 });
        const res = await fetch('/api/webtoons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title: newSeriesTitle.trim(), description: newSeriesDesc.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create series');
        seriesId = data.series.id;
      }

      // 2. Create episode
      setProgress({ step: 'Creating episode…', done: 1, total: pages.length + 2 });
      const epRes = await fetch(`/api/webtoons/${seriesId}/episodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: episodeTitle.trim() }),
      });
      const epData = await epRes.json();
      if (!epRes.ok) throw new Error(epData.error || 'Failed to create episode');
      const episodeId = epData.episode.id;

      // 3. Upload pages one by one (with compression)
      for (let i = 0; i < pages.length; i++) {
        setProgress({ step: `Uploading page ${i + 1} of ${pages.length}…`, done: i + 2, total: pages.length + 2 });
        const compressed = await compressImage(pages[i].file);
        const formData = new FormData();
        formData.append('page', compressed, `page-${i}.jpg`);
        formData.append('order', i);
        const pageRes = await fetch(`/api/webtoons/${seriesId}/episodes/${episodeId}/pages`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!pageRes.ok) {
          const pd = await pageRes.json();
          throw new Error(pd.error || `Failed to upload page ${i + 1}`);
        }
      }

      toast({ title: 'Episode uploaded!', status: 'success', duration: 3000 });
      navigate(`/webtoons/${seriesId}/episodes/${episodeId}`);
    } catch (err) {
      toast({ title: err.message, status: 'error' });
      setUploading(false);
    }
  };

  if (loadingSeries) {
    return <HStack justify="center" py={20}><Spinner color="brand.gold" size="xl" /></HStack>;
  }

  const inputStyle = {
    bg: 'rgba(84,56,37,0.5)',
    border: '1px solid rgba(212,175,55,0.35)',
    color: 'brand.gold',
    _hover: { borderColor: 'brand.gold' },
    _focus: { borderColor: 'brand.gold', boxShadow: '0 0 0 1px rgba(212,175,55,0.5)' },
    _placeholder: { color: 'rgba(212,175,55,0.35)' },
  };

  return (
    <Container maxW="680px" py={10} px={6}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" fontFamily="heading">Upload Episode</Heading>

        {/* Series */}
        <Box bg="rgba(84,56,37,0.4)" borderRadius="12px" border="1px solid rgba(212,175,55,0.2)" p={5}>
          <Heading size="sm" color="brand.gold" mb={4}>Series</Heading>
          {seriesList.length > 0 && (
            <HStack mb={4} spacing={3}>
              <Button
                size="sm"
                variant={seriesMode === 'existing' ? 'solid' : 'outline'}
                bg={seriesMode === 'existing' ? 'brand.gold' : 'transparent'}
                color={seriesMode === 'existing' ? 'brand.red' : 'brand.gold'}
                borderColor="brand.gold"
                _hover={{ bg: seriesMode === 'existing' ? 'brand.goldDark' : 'rgba(212,175,55,0.1)' }}
                onClick={() => setSeriesMode('existing')}
              >
                Existing Series
              </Button>
              <Button
                size="sm"
                variant={seriesMode === 'new' ? 'solid' : 'outline'}
                bg={seriesMode === 'new' ? 'brand.gold' : 'transparent'}
                color={seriesMode === 'new' ? 'brand.red' : 'brand.gold'}
                borderColor="brand.gold"
                _hover={{ bg: seriesMode === 'new' ? 'brand.goldDark' : 'rgba(212,175,55,0.1)' }}
                onClick={() => setSeriesMode('new')}
              >
                New Series
              </Button>
            </HStack>
          )}

          {seriesMode === 'existing' ? (
            <FormControl>
              <FormLabel color="rgba(212,175,55,0.7)" fontSize="sm">Select Series</FormLabel>
              <Select
                value={selectedSeriesId}
                onChange={(e) => setSelectedSeriesId(e.target.value)}
                {...inputStyle}
                sx={{ option: { background: '#543825', color: '#D4AF37' } }}
              >
                {seriesList.map((s) => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </Select>
            </FormControl>
          ) : (
            <VStack spacing={3} align="stretch">
              <FormControl isRequired>
                <FormLabel color="rgba(212,175,55,0.7)" fontSize="sm">Series Title</FormLabel>
                <Input
                  placeholder="My Amazing Webtoon"
                  value={newSeriesTitle}
                  onChange={(e) => setNewSeriesTitle(e.target.value)}
                  {...inputStyle}
                />
              </FormControl>
              <FormControl>
                <FormLabel color="rgba(212,175,55,0.7)" fontSize="sm">Description (optional)</FormLabel>
                <Textarea
                  placeholder="What's this series about?"
                  value={newSeriesDesc}
                  onChange={(e) => setNewSeriesDesc(e.target.value)}
                  rows={2}
                  resize="none"
                  {...inputStyle}
                />
              </FormControl>
            </VStack>
          )}
        </Box>

        {/* Episode title */}
        <FormControl isRequired>
          <FormLabel color="rgba(212,175,55,0.7)" fontSize="sm">Episode Title</FormLabel>
          <Input
            placeholder="Chapter 1: The Beginning"
            value={episodeTitle}
            onChange={(e) => setEpisodeTitle(e.target.value)}
            {...inputStyle}
          />
        </FormControl>

        {/* Image upload */}
        <Box>
          <Text color="rgba(212,175,55,0.7)" fontSize="sm" mb={2}>Pages (images in order)</Text>
          <Box
            border="2px dashed rgba(212,175,55,0.35)"
            borderRadius="10px"
            p={8}
            textAlign="center"
            cursor="pointer"
            _hover={{ borderColor: 'rgba(212,175,55,0.6)', bg: 'rgba(212,175,55,0.03)' }}
            transition="all 0.2s ease"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <Text color="rgba(212,175,55,0.5)" fontSize="sm">
              Drop images here or click to select
            </Text>
            <Text color="rgba(212,175,55,0.35)" fontSize="xs" mt={1}>
              PNG, JPG, WebP — will be compressed to 800px width
            </Text>
          </Box>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </Box>

        {/* Image preview / reorder */}
        {pages.length > 0 && (
          <VStack spacing={2} align="stretch">
            <Text color="rgba(212,175,55,0.7)" fontSize="sm">{pages.length} page{pages.length !== 1 ? 's' : ''}</Text>
            {pages.map((pg, i) => (
              <HStack
                key={pg.preview}
                bg="rgba(84,56,37,0.5)"
                borderRadius="8px"
                border="1px solid rgba(212,175,55,0.2)"
                px={3} py={2}
                spacing={3}
              >
                <Text color="rgba(212,175,55,0.5)" fontSize="xs" w="24px" textAlign="right">
                  {i + 1}
                </Text>
                <Box
                  w="48px" h="48px"
                  borderRadius="4px"
                  overflow="hidden"
                  flexShrink={0}
                  bg="black"
                >
                  <img
                    src={pg.preview}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
                <Text color="brand.gold" fontSize="sm" flex={1} noOfLines={1}>
                  {pg.file.name}
                </Text>
                <HStack spacing={1}>
                  <Button
                    size="xs" variant="ghost" color="rgba(212,175,55,0.6)"
                    _hover={{ color: 'brand.gold', bg: 'transparent' }}
                    isDisabled={i === 0}
                    onClick={() => moveUp(i)}
                  >
                    ↑
                  </Button>
                  <Button
                    size="xs" variant="ghost" color="rgba(212,175,55,0.6)"
                    _hover={{ color: 'brand.gold', bg: 'transparent' }}
                    isDisabled={i === pages.length - 1}
                    onClick={() => moveDown(i)}
                  >
                    ↓
                  </Button>
                  <Button
                    size="xs" variant="ghost" color="red.400"
                    _hover={{ color: 'red.300', bg: 'transparent' }}
                    onClick={() => removePage(i)}
                  >
                    ×
                  </Button>
                </HStack>
              </HStack>
            ))}
          </VStack>
        )}

        {/* Upload progress */}
        {uploading && (
          <Box>
            <Text color="rgba(212,175,55,0.7)" fontSize="sm" mb={2}>{progress.step}</Text>
            <Progress
              value={progress.total > 0 ? (progress.done / progress.total) * 100 : 0}
              colorScheme="yellow"
              borderRadius="full"
              bg="rgba(84,56,37,0.5)"
            />
          </Box>
        )}

        {/* Submit */}
        <HStack justify="flex-end" spacing={3}>
          <Button
            variant="outline"
            borderColor="rgba(212,175,55,0.35)" color="brand.gold"
            _hover={{ bg: 'rgba(212,175,55,0.08)' }}
            onClick={() => navigate('/webtoons')}
            isDisabled={uploading}
          >
            Cancel
          </Button>
          <Button
            bg="brand.gold" color="brand.red"
            _hover={{ bg: 'brand.goldDark' }}
            onClick={handleSubmit}
            isLoading={uploading}
            loadingText="Uploading…"
            isDisabled={pages.length === 0}
          >
            Upload Episode
          </Button>
        </HStack>
      </VStack>
    </Container>
  );
}
