import { useState } from 'react';
import {
  Box, Container, Heading, SimpleGrid, Card, CardBody, CardHeader,
  Text, Button, VStack, Select,
} from '@chakra-ui/react';

// Creator imports
import QuizClimbCreator from './tools/QuizClimbCreator';
import DownwardCreator from './tools/DownwardCreator';
import StackedCreator from './tools/StackedCreator';
import QuotedCreator from './tools/QuotedCreator';
import PuttPuttCreator from './tools/PuttPuttCreator';
import ChainCreator from './tools/ChainCreator';
import SwapCreator from './tools/SwapCreator';
import LiarsQuestCreator from './tools/LiarsQuestCreator';

const FORMATS = [
  { id: 'quizClimb',       label: 'Quiz Climb',       description: 'Multi-round trivia with bomb & heart rounds.' },
  { id: 'downward',        label: 'Downward',          description: 'Fill-in-the-blank with crossword path finder.' },
  { id: 'stacked',         label: 'Stacked',           description: 'Ranking puzzles — put items in order.' },
  { id: 'quoted',          label: 'Quoted',            description: 'Fill missing words in famous quotes.' },
  { id: 'puttPuttProblems',label: 'Putt Putt Problems',description: '3-hole trivia with 9 clues.' },
  { id: 'chain',           label: 'Chain',             description: 'Word chain puzzles.' },
  { id: 'swap',            label: 'Swap',              description: 'Word replacement game.' },
  { id: 'liarsQuest',      label: "Liar's Quest",      description: 'Multi-level lie-detection challenge.' },
];

const CREATOR_MAP = {
  quizClimb:        QuizClimbCreator,
  downward:         DownwardCreator,
  stacked:          StackedCreator,
  quoted:           QuotedCreator,
  puttPuttProblems: PuttPuttCreator,
  chain:            ChainCreator,
  swap:             SwapCreator,
  liarsQuest:       LiarsQuestCreator,
};

export default function Tools() {
  const [activeFormat, setActiveFormat] = useState(null);

  const ActiveCreator = activeFormat ? CREATOR_MAP[activeFormat] : null;

  return (
    <Container maxW="1100px" py={10} px={6}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="2xl" fontFamily="heading">
          Lil Game Creator
        </Heading>

        {/* Format selector as cards */}
        {!activeFormat && (
          <>
            <Text color="rgba(212,175,55,0.8)">Choose a game format to build:</Text>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
              {FORMATS.map((fmt) => (
                <Card
                  key={fmt.id}
                  onClick={() => setActiveFormat(fmt.id)}
                  cursor="pointer"
                  bg="rgba(84,56,37,0.7)"
                  borderRadius="10px"
                  border="1px solid rgba(212,175,55,0.3)"
                  boxShadow="0 4px 12px rgba(0,0,0,0.2)"
                  _hover={{ borderColor: 'rgba(212,175,55,0.7)', boxShadow: '0 6px 20px rgba(0,0,0,0.3)' }}
                  transition="all 0.3s ease"
                  p={4}
                >
                  <CardHeader p={0} mb={2}>
                    <Heading size="sm" fontFamily="heading" color="brand.gold">{fmt.label}</Heading>
                  </CardHeader>
                  <CardBody p={0}>
                    <Text fontSize="xs" color="rgba(212,175,55,0.7)">{fmt.description}</Text>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </>
        )}

        {/* Active creator */}
        {ActiveCreator && (
          <Box>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setActiveFormat(null)}
              mb={4}
              color="brand.goldDark"
              _hover={{ color: 'brand.gold' }}
            >
              ← Back to formats
            </Button>
            <ActiveCreator />
          </Box>
        )}
      </VStack>
    </Container>
  );
}
