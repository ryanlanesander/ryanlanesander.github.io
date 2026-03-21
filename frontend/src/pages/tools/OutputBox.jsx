import { Box, Text, Button, useClipboard } from '@chakra-ui/react';

export default function OutputBox({ value }) {
  const { hasCopied, onCopy } = useClipboard(value || '');

  if (!value) return null;

  return (
    <Box mt={2}>
      <Box
        as="pre"
        bg="#f7f7f7"
        color="#111"
        borderRadius="6px"
        border="1px solid #ccc"
        p={4}
        overflowX="auto"
        fontSize="sm"
        fontFamily="monospace"
        maxH="400px"
        whiteSpace="pre"
      >
        {value}
      </Box>
      <Button size="sm" mt={2} variant="outline" onClick={onCopy}>
        {hasCopied ? 'Copied!' : 'Copy JSON'}
      </Button>
    </Box>
  );
}
