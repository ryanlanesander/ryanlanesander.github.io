import { useState } from 'react';
import {
  VStack, Heading, FormControl, FormLabel, Input, Button, HStack,
  Checkbox, Text, NumberInput, NumberInputField, Divider,
} from '@chakra-ui/react';
import OutputBox from './OutputBox';

const EMPTY_WORD = () => ({ word: '' });

export default function ChainCreator() {
  const [words, setWords] = useState([EMPTY_WORD(), EMPTY_WORD(), EMPTY_WORD()]);
  const [numHearts, setNumHearts] = useState(3);
  const [revealNextLetter, setRevealNextLetter] = useState(false);
  const [output, setOutput] = useState('');

  const updateWord = (i, val) =>
    setWords((p) => p.map((w, j) => j === i ? { word: val } : w));

  const generate = () => {
    const wordsList = words.map((w) => ({ word: w.word.trim() })).filter((w) => w.word);
    setOutput(JSON.stringify({
      words: wordsList,
      numHearts: Number(numHearts),
      revealNextLetter,
    }, null, 2));
  };

  return (
    <VStack spacing={5} align="stretch">
      <Heading size="lg" fontFamily="heading">Chain Creator</Heading>

      <FormLabel>Words (in chain order)</FormLabel>
      <VStack spacing={2} align="stretch">
        {words.map((w, i) => (
          <HStack key={i}>
            <Text fontSize="sm" w="24px" color="rgba(212,175,55,0.7)" flexShrink={0}>{i + 1}</Text>
            <Input flex={1} size="sm" value={w.word} placeholder={`Word ${i + 1}`}
              onChange={(e) => updateWord(i, e.target.value)} />
            {words.length > 2 && (
              <Button size="xs" variant="outline"
                onClick={() => setWords((p) => p.filter((_, j) => j !== i))}>−</Button>
            )}
          </HStack>
        ))}
      </VStack>
      <Button size="sm" variant="outline"
        onClick={() => setWords((p) => [...p, EMPTY_WORD()])}>+ Word</Button>

      <HStack spacing={6}>
        <FormControl w="160px">
          <FormLabel>Hearts</FormLabel>
          <NumberInput min={1} value={numHearts} onChange={setNumHearts}>
            <NumberInputField />
          </NumberInput>
        </FormControl>
        <FormControl pt={8}>
          <Checkbox isChecked={revealNextLetter}
            onChange={(e) => setRevealNextLetter(e.target.checked)}>
            <Text fontSize="sm">Reveal next letter</Text>
          </Checkbox>
        </FormControl>
      </HStack>

      <Divider borderColor="rgba(212,175,55,0.3)" />
      <Button variant="solid" onClick={generate}>Generate JSON</Button>
      <OutputBox value={output} />
    </VStack>
  );
}
