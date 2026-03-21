import { useState } from 'react';
import {
  VStack, Heading, FormControl, FormLabel, Textarea, Input,
  Button, Divider, HStack, NumberInput, NumberInputField,
} from '@chakra-ui/react';
import OutputBox from './OutputBox';

export default function QuotedCreator() {
  const [hint, setHint] = useState('');
  const [attribute, setAttribute] = useState('');
  const [correctWords, setCorrectWords] = useState('');
  const [incorrectWords, setIncorrectWords] = useState('');
  const [randomizeSeed, setRandomizeSeed] = useState('');
  const [output, setOutput] = useState('');

  const csv = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);

  const generate = () => {
    setOutput(JSON.stringify({
      hint,
      attribute,
      correctWords: csv(correctWords),
      incorrectWords: csv(incorrectWords),
      countdownTime: 120,
      randomizeSeed: Number(randomizeSeed) || 0,
    }, null, 2));
  };

  return (
    <VStack spacing={5} align="stretch">
      <Heading size="lg" fontFamily="heading">Quoted Creator</Heading>

      <FormControl>
        <FormLabel>Hint (the quote with blanks)</FormLabel>
        <Textarea value={hint} onChange={(e) => setHint(e.target.value)}
          placeholder="The only thing we have to fear..." />
      </FormControl>

      <FormControl>
        <FormLabel>Attribute to</FormLabel>
        <Input value={attribute} onChange={(e) => setAttribute(e.target.value)}
          placeholder="President Franklin D. Roosevelt" />
      </FormControl>

      <FormControl>
        <FormLabel>Correct Words (comma-separated)</FormLabel>
        <Input value={correctWords} onChange={(e) => setCorrectWords(e.target.value)}
          placeholder="is, fear, itself" />
      </FormControl>

      <FormControl>
        <FormLabel>Incorrect Words (comma-separated)</FormLabel>
        <Input value={incorrectWords} onChange={(e) => setIncorrectWords(e.target.value)}
          placeholder="has, gone, away, but, rats" />
      </FormControl>

      <FormControl w="180px">
        <FormLabel>Randomize Seed</FormLabel>
        <NumberInput value={randomizeSeed} onChange={setRandomizeSeed}>
          <NumberInputField placeholder="0" />
        </NumberInput>
      </FormControl>

      <Divider borderColor="rgba(212,175,55,0.3)" />
      <Button variant="solid" onClick={generate}>Generate JSON</Button>
      <OutputBox value={output} />
    </VStack>
  );
}
