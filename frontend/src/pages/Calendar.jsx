import { useState } from 'react';
import {
  Box, Container, HStack, Text, IconButton, ButtonGroup, Button,
  useDisclosure, Wrap, WrapItem, Tooltip,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import MonthView from '../components/calendar/MonthView';
import WeekView from '../components/calendar/WeekView';
import EventModal from '../components/calendar/EventModal';
import { events } from '../data/events';
import { team } from '../data/team';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export default function Calendar() {
  const [view, setView] = useState('month');
  const [current, setCurrent] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const year = current.getFullYear();
  const month = current.getMonth();

  function openEvent(event) {
    setSelectedEvent(event);
    onOpen();
  }

  function prev() {
    const d = new Date(current);
    if (view === 'month') d.setMonth(month - 1);
    else d.setDate(d.getDate() - 7);
    setCurrent(d);
  }

  function next() {
    const d = new Date(current);
    if (view === 'month') d.setMonth(month + 1);
    else d.setDate(d.getDate() + 7);
    setCurrent(d);
  }

  function goToday() {
    setCurrent(new Date());
  }

  function weekLabel() {
    const start = new Date(current);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${fmt(start)} – ${fmt(end)}, ${end.getFullYear()}`;
  }

  return (
    <Container maxW="1200px" px={{ base: 3, md: 6 }} py={6}>
      {/* Header */}
      <HStack justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <HStack spacing={3}>
          <IconButton
            icon={<ChevronLeftIcon />}
            variant="outline"
            size="sm"
            onClick={prev}
            aria-label="Previous"
          />
          <Text fontFamily="heading" fontSize={{ base: 'xl', md: '2xl' }} color="brand.gold" minW="200px" textAlign="center">
            {view === 'month' ? `${MONTHS[month]} ${year}` : weekLabel()}
          </Text>
          <IconButton
            icon={<ChevronRightIcon />}
            variant="outline"
            size="sm"
            onClick={next}
            aria-label="Next"
          />
          <Button variant="ghost" size="sm" onClick={goToday} fontSize="13px">
            Today
          </Button>
        </HStack>

        <ButtonGroup size="sm" isAttached variant="outline">
          <Button
            onClick={() => setView('month')}
            bg={view === 'month' ? 'rgba(212,175,55,0.15)' : 'transparent'}
            borderColor="rgba(212,175,55,0.3)"
            color="brand.gold"
            _hover={{ bg: 'rgba(212,175,55,0.2)' }}
          >
            Month
          </Button>
          <Button
            onClick={() => setView('week')}
            bg={view === 'week' ? 'rgba(212,175,55,0.15)' : 'transparent'}
            borderColor="rgba(212,175,55,0.3)"
            color="brand.gold"
            _hover={{ bg: 'rgba(212,175,55,0.2)' }}
          >
            Week
          </Button>
        </ButtonGroup>
      </HStack>

      {/* Team legend */}
      <Wrap spacing={2} mb={5}>
        {team.map((m) => (
          <WrapItem key={m.id}>
            <Tooltip label={m.name} placement="top" hasArrow>
              <HStack
                spacing={1.5}
                bg="rgba(84,56,37,0.4)"
                border="1px solid rgba(212,175,55,0.15)"
                borderRadius="full"
                px={2.5}
                py={1}
              >
                <Box w="8px" h="8px" borderRadius="full" bg={m.color} />
                <Text fontSize="12px" color="rgba(212,175,55,0.75)">{m.name.split(' ')[0]}</Text>
              </HStack>
            </Tooltip>
          </WrapItem>
        ))}
      </Wrap>

      {/* Calendar */}
      <Box
        bg="rgba(84,56,37,0.25)"
        border="1px solid rgba(212,175,55,0.15)"
        borderRadius="12px"
        p={{ base: 3, md: 4 }}
      >
        {view === 'month' ? (
          <MonthView year={year} month={month} events={events} onEventClick={openEvent} />
        ) : (
          <WeekView currentDate={current} events={events} onEventClick={openEvent} />
        )}
      </Box>

      <EventModal event={selectedEvent} isOpen={isOpen} onClose={onClose} />
    </Container>
  );
}
