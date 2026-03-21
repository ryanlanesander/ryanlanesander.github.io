import { useState } from 'react';
import {
  VStack, Heading, FormControl, FormLabel, Input, Button, HStack,
  Select, Divider, SimpleGrid, Text, NumberInput, NumberInputField,
} from '@chakra-ui/react';
import OutputBox from './OutputBox';

const HOLES = ['Hole 1', 'Hole 2', 'Hole 3'];
const EMPTY_CLUE = () => ({ clue: '', answer: 0 });
const EMPTY_SPECIAL = () => ({ speed: 1, roundType: 'bomb', roundIndex: 0 });

export default function PuttPuttCreator() {
  const [holes, setHoles] = useState(['', '', '']);
  const [clues, setClues] = useState(Array.from({ length: 9 }, EMPTY_CLUE));
  const [specials, setSpecials] = useState([EMPTY_SPECIAL()]);
  const [output, setOutput] = useState('');

  const updateClue = (i, field, val) =>
    setClues((p) => p.map((c, j) => j === i ? { ...c, [field]: val } : c));

  const updateSpecial = (i, field, val) =>
    setSpecials((p) => p.map((s, j) => j === i ? { ...s, [field]: val } : s));

  const generate = () => {
    setOutput(JSON.stringify({
      clues: clues.map((c) => ({ clue: c.clue, answer: Number(c.answer) })),
      answers: holes.map((name) => ({ name })),
      specialRounds: specials.map((s) => ({
        speed: Number(s.speed),
        roundType: s.roundType,
        roundIndex: Number(s.roundIndex),
      })),
    }, null, 2));
  };

  return (
    <VStack spacing={5} align="stretch">
      <Heading size="lg" fontFamily="heading">Putt Putt Creator</Heading>

      <SimpleGrid columns={3} spacing={3}>
        {holes.map((h, i) => (
          <FormControl key={i}>
            <FormLabel fontSize="sm">Hole {i + 1} Answer</FormLabel>
            <Input size="sm" value={h} placeholder={`e.g. Cats`}
              onChange={(e) => setHoles((p) => p.map((x, j) => j === i ? e.target.value : x))} />
          </FormControl>
        ))}
      </SimpleGrid>

      <Text fontWeight="600" color="brand.gold">Clues (9 rounds)</Text>
      <VStack spacing={2} align="stretch">
        {clues.map((c, i) => (
          <HStack key={i}>
            <Text fontSize="sm" w="70px" color="rgba(212,175,55,0.7)" flexShrink={0}>
              Round {i + 1}
            </Text>
            <Input flex={2} size="sm" value={c.clue} placeholder={`Clue ${i + 1}`}
              onChange={(e) => updateClue(i, 'clue', e.target.value)} />
            <Select flex={1} size="sm" value={c.answer}
              onChange={(e) => updateClue(i, 'answer', Number(e.target.value))}>
              {HOLES.map((h, hi) => <option key={hi} value={hi}>{h}</option>)}
            </Select>
          </HStack>
        ))}
      </VStack>

      <Text fontWeight="600" color="brand.gold">Special Rounds</Text>
      <VStack spacing={2} align="stretch">
        {specials.map((s, i) => (
          <HStack key={i}>
            <NumberInput size="sm" w="120px" min={1} max={5} value={s.speed}
              onChange={(v) => updateSpecial(i, 'speed', v)}>
              <NumberInputField placeholder="Speed 1-5" />
            </NumberInput>
            <Select size="sm" w="120px" value={s.roundType}
              onChange={(e) => updateSpecial(i, 'roundType', e.target.value)}>
              <option value="bomb">Bomb</option>
              <option value="heart">Heart</option>
            </Select>
            <NumberInput size="sm" w="160px" min={0} max={8} value={s.roundIndex}
              onChange={(v) => updateSpecial(i, 'roundIndex', v)}>
              <NumberInputField placeholder="Round index (0-8)" />
            </NumberInput>
            {specials.length > 1 && (
              <Button size="xs" variant="outline"
                onClick={() => setSpecials((p) => p.filter((_, j) => j !== i))}>−</Button>
            )}
          </HStack>
        ))}
      </VStack>
      <Button size="sm" variant="outline"
        onClick={() => setSpecials((p) => [...p, EMPTY_SPECIAL()])}>+ Special Round</Button>

      <Divider borderColor="rgba(212,175,55,0.3)" />
      <Button variant="solid" onClick={generate}>Generate JSON</Button>
      <OutputBox value={output} />
    </VStack>
  );
}
