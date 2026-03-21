import { useState } from 'react';
import {
  VStack, Heading, FormControl, FormLabel, Input, Button, HStack,
  NumberInput, NumberInputField, Divider, Text,
} from '@chakra-ui/react';
import OutputBox from './OutputBox';

const EMPTY_REBUS = () => ({ hintIndex: 1, replaceLetter: '' });

export default function SwapCreator() {
  const [creator, setCreator] = useState('');
  const [rebuses, setRebuses] = useState([EMPTY_REBUS()]);
  const [bonusSwapsAdd, setBonusSwapsAdd] = useState(0);
  const [countdownTime, setCountdownTime] = useState(240);
  const [randomizeSeed, setRandomizeSeed] = useState(0);
  const [allowedSwapsAdd, setAllowedSwapsAdd] = useState(0);
  const [output, setOutput] = useState('');

  const updateRebus = (i, field, val) =>
    setRebuses((p) => p.map((r, j) => j === i ? { ...r, [field]: val } : r));

  const generate = () => {
    setOutput(JSON.stringify({
      creator,
      rebuses: rebuses.filter((r) => r.replaceLetter).map((r) => ({
        hintIndex: Number(r.hintIndex),
        replaceLetter: r.replaceLetter,
      })),
      bonusSwapsAdd: Number(bonusSwapsAdd),
      countdownTime: Number(countdownTime),
      randomizeSeed: Number(randomizeSeed),
      allowedSwapsAdd: Number(allowedSwapsAdd),
    }, null, 2));
  };

  return (
    <VStack spacing={5} align="stretch">
      <Heading size="lg" fontFamily="heading">Swap Creator</Heading>

      <FormControl>
        <FormLabel>Creator</FormLabel>
        <Input value={creator} onChange={(e) => setCreator(e.target.value)} placeholder="Your name" />
      </FormControl>

      <FormLabel>Rebuses</FormLabel>
      <VStack spacing={2} align="stretch">
        {rebuses.map((r, i) => (
          <HStack key={i}>
            <FormControl w="140px">
              <FormLabel fontSize="xs">Hint Index</FormLabel>
              <NumberInput size="sm" min={1} value={r.hintIndex}
                onChange={(v) => updateRebus(i, 'hintIndex', v)}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl w="140px">
              <FormLabel fontSize="xs">Replace Letter</FormLabel>
              <Input size="sm" maxLength={1} value={r.replaceLetter} placeholder="@"
                onChange={(e) => updateRebus(i, 'replaceLetter', e.target.value)} />
            </FormControl>
            {rebuses.length > 1 && (
              <Button size="xs" variant="outline" alignSelf="flex-end" mb={1}
                onClick={() => setRebuses((p) => p.filter((_, j) => j !== i))}>−</Button>
            )}
          </HStack>
        ))}
      </VStack>
      <Button size="sm" variant="outline"
        onClick={() => setRebuses((p) => [...p, EMPTY_REBUS()])}>+ Rebus</Button>

      <HStack spacing={4} flexWrap="wrap">
        {[
          ['Bonus Swaps Add', bonusSwapsAdd, setBonusSwapsAdd],
          ['Countdown Time (s)', countdownTime, setCountdownTime],
          ['Randomize Seed', randomizeSeed, setRandomizeSeed],
          ['Allowed Swaps Add', allowedSwapsAdd, setAllowedSwapsAdd],
        ].map(([label, val, setter]) => (
          <FormControl key={label} w="180px">
            <FormLabel fontSize="sm">{label}</FormLabel>
            <NumberInput value={val} onChange={setter}>
              <NumberInputField />
            </NumberInput>
          </FormControl>
        ))}
      </HStack>

      <Divider borderColor="rgba(212,175,55,0.3)" />
      <Button variant="solid" onClick={generate}>Generate JSON</Button>
      <OutputBox value={output} />
    </VStack>
  );
}
