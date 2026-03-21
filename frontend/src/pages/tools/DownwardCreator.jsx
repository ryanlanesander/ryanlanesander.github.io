import { useState } from 'react';
import {
  VStack, Heading, FormControl, FormLabel, Input, Textarea,
  Button, NumberInput, NumberInputField, HStack, IconButton, Divider,
} from '@chakra-ui/react';
import OutputBox from './OutputBox';

export default function DownwardCreator() {
  const [clue, setClue] = useState('');
  const [correctWords, setCorrectWords] = useState('');
  const [distractors, setDistractors] = useState('');
  const [emojiWords, setEmojiWords] = useState(['']);
  const [randomizeSeed, setRandomizeSeed] = useState('');
  const [maxHealth, setMaxHealth] = useState('12');
  const [output, setOutput] = useState('');

  const csv = (str) => str.split(',').map((s) => s.trim()).filter(Boolean);

  const generate = () => {
    const goalWords = [
      ...csv(correctWords).map((word) => ({ word, isBad: false })),
      ...csv(distractors).map((word) => ({ word, isBad: true })),
    ];
    const emojiObj = emojiWords.reduce((acc, w, i) => {
      acc[`emoji${i + 1}Word`] = w || `emoji${i + 1}`;
      return acc;
    }, {});
    setOutput(JSON.stringify({
      clue,
      goalWords,
      maxHealth: Number(maxHealth) || 12,
      ...emojiObj,
      randomizeSeed: Number(randomizeSeed) || 123,
    }, null, 2));
  };

  return (
    <VStack spacing={5} align="stretch">
      <Heading size="lg" fontFamily="heading">Downward Creator</Heading>

      <FormControl>
        <FormLabel>Clue</FormLabel>
        <Input value={clue} onChange={(e) => setClue(e.target.value)} placeholder="Sea Creatures" />
      </FormControl>

      <FormControl>
        <FormLabel>Correct Answers (comma-separated)</FormLabel>
        <Textarea value={correctWords} onChange={(e) => setCorrectWords(e.target.value)}
          placeholder="starfish, tigershark, seal" />
      </FormControl>

      <FormControl>
        <FormLabel>Distractors (comma-separated)</FormLabel>
        <Textarea value={distractors} onChange={(e) => setDistractors(e.target.value)}
          placeholder="hague, leeds, madrid" />
      </FormControl>

      <FormControl>
        <FormLabel>Emoji Words</FormLabel>
        <VStack align="stretch" spacing={2}>
          {emojiWords.map((w, i) => (
            <HStack key={i}>
              <Input value={w} placeholder={`emoji${i + 1}Word`} size="sm"
                onChange={(e) => setEmojiWords((p) => p.map((x, j) => j === i ? e.target.value : x))} />
              {emojiWords.length > 1 && (
                <Button size="xs" variant="outline"
                  onClick={() => setEmojiWords((p) => p.filter((_, j) => j !== i))}>−</Button>
              )}
            </HStack>
          ))}
        </VStack>
        <Button size="xs" mt={2} variant="outline"
          onClick={() => setEmojiWords((p) => [...p, ''])}>+ Emoji Word</Button>
      </FormControl>

      <HStack spacing={4}>
        <FormControl w="160px">
          <FormLabel>Randomize Seed</FormLabel>
          <NumberInput value={randomizeSeed} onChange={setRandomizeSeed}>
            <NumberInputField placeholder="123" />
          </NumberInput>
        </FormControl>
        <FormControl w="140px">
          <FormLabel>Max Health</FormLabel>
          <NumberInput value={maxHealth} onChange={setMaxHealth}>
            <NumberInputField placeholder="12" />
          </NumberInput>
        </FormControl>
      </HStack>

      <Divider borderColor="rgba(212,175,55,0.3)" />
      <Button variant="solid" onClick={generate}>Generate JSON</Button>
      <OutputBox value={output} />
    </VStack>
  );
}
