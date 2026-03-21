import { useState } from 'react';
import {
  VStack, Heading, FormControl, FormLabel, Input, Checkbox, Button,
  HStack, Text, Divider, Box, SimpleGrid,
} from '@chakra-ui/react';
import OutputBox from './OutputBox';

const EMPTY_ANSWER = () => ({ answer: '', isLie: false });
const EMPTY_LEVEL = (i) => ({
  guardName: '',
  guardClue: '',
  guardIndex: i,
  answers: [EMPTY_ANSWER(), EMPTY_ANSWER(), EMPTY_ANSWER(), EMPTY_ANSWER()],
});

export default function LiarsQuestCreator() {
  const [levels, setLevels] = useState([0, 1, 2, 3].map(EMPTY_LEVEL));
  const [output, setOutput] = useState('');

  const updateLevel = (li, field, val) =>
    setLevels((p) => p.map((l, i) => i === li ? { ...l, [field]: val } : l));

  const updateAnswer = (li, ai, field, val) =>
    setLevels((p) => p.map((l, i) => {
      if (i !== li) return l;
      return {
        ...l,
        answers: l.answers.map((a, j) => j === ai ? { ...a, [field]: val } : a),
      };
    }));

  const generate = () => {
    setOutput(JSON.stringify({ levels }, null, 2));
  };

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg" fontFamily="heading">Liar's Quest Creator</Heading>

      {levels.map((level, li) => (
        <Box key={li} border="1px solid rgba(212,175,55,0.3)" borderRadius="8px" p={4}>
          <Heading size="md" fontFamily="heading" mb={4}>Level {li + 1}</Heading>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
            <FormControl>
              <FormLabel fontSize="sm">Guard Name</FormLabel>
              <Input size="sm" value={level.guardName} placeholder="Spicy Spartan"
                onChange={(e) => updateLevel(li, 'guardName', e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Guard Clue</FormLabel>
              <Input size="sm" value={level.guardClue} placeholder="Chilaquiles is made with..."
                onChange={(e) => updateLevel(li, 'guardClue', e.target.value)} />
            </FormControl>
          </SimpleGrid>

          <Text fontSize="sm" fontWeight="600" mb={2} color="brand.gold">Answers</Text>
          <VStack spacing={2} align="stretch">
            {level.answers.map((a, ai) => (
              <HStack key={ai}>
                <Input flex={1} size="sm" value={a.answer} placeholder={`Answer ${ai + 1}`}
                  onChange={(e) => updateAnswer(li, ai, 'answer', e.target.value)} />
                <Checkbox isChecked={a.isLie}
                  onChange={(e) => updateAnswer(li, ai, 'isLie', e.target.checked)}>
                  <Text fontSize="xs">Lie</Text>
                </Checkbox>
              </HStack>
            ))}
          </VStack>
        </Box>
      ))}

      <Divider borderColor="rgba(212,175,55,0.3)" />
      <Button variant="solid" onClick={generate}>Generate JSON</Button>
      <OutputBox value={output} />
    </VStack>
  );
}
