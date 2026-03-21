import {
  Container, Heading, SimpleGrid, Card, CardHeader, CardBody,
  Text, VStack, Box,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const GAMES = [
  {
    id: 'beats',
    label: 'Beats',
    description: 'Drag items into order based on "beats what" logic. 3 puzzles.',
    href: '/non-live-games/beats/beats.html',
    external: true,
  },
  {
    id: 'cluecards',
    label: 'Clue Cards',
    description: 'Drag-and-drop suspects into answer slots. Toggle links and X-outs.',
    href: '/lil-tools/cluecards/cluecards.html',
    external: true,
  },
  {
    id: 'tictacktoe',
    label: 'TicSnackToe',
    description: 'Pick snack-themed trivia packs to get 3-in-a-row. Unity WebGL.',
    href: '/non-live-games/tic-snack-toe/tictactoe.html',
    external: true,
  },
];

export default function Games() {
  return (
    <Container maxW="900px" py={10} px={6}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="2xl" fontFamily="heading">Games</Heading>
        <Text color="rgba(212,175,55,0.8)">
          Click a game below to play. Games open in the full browser window.
        </Text>

        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={5}>
          {GAMES.map((game) => (
            <Card
              key={game.id}
              as="a"
              href={game.href}
              bg="rgba(84,56,37,0.7)"
              borderRadius="10px"
              border="1px solid rgba(212,175,55,0.3)"
              boxShadow="0 4px 12px rgba(0,0,0,0.2)"
              _hover={{
                boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                borderColor: 'rgba(212,175,55,0.6)',
                textDecoration: 'none',
              }}
              transition="all 0.3s ease"
              p={5}
            >
              <CardHeader p={0} mb={2}>
                <Heading size="md" fontFamily="heading" color="brand.gold">
                  {game.label}
                </Heading>
              </CardHeader>
              <CardBody p={0}>
                <Text fontSize="sm" color="rgba(212,175,55,0.8)">{game.description}</Text>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </VStack>
    </Container>
  );
}
