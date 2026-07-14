import { Box, Grid, Text, VStack } from '@chakra-ui/react';
import EventCard from './EventCard';

const DOW_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfWeek(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export default function WeekView({ currentDate, events, onEventClick }) {
  const weekStart = startOfWeek(currentDate);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const today = new Date();
  const todayKey = toDateKey(today);

  const eventMap = {};
  events.forEach((e) => {
    if (!eventMap[e.date]) eventMap[e.date] = [];
    eventMap[e.date].push(e);
  });

  return (
    <Grid templateColumns="repeat(7, 1fr)" gap={2}>
      {days.map((day) => {
        const key = toDateKey(day);
        const isToday = key === todayKey;
        const dayEvents = eventMap[key] || [];

        return (
          <Box key={key}>
            {/* Day header */}
            <Box
              textAlign="center"
              mb={2}
              py={1.5}
              borderRadius="8px"
              bg={isToday ? 'rgba(212,175,55,0.15)' : 'transparent'}
              border="1px solid"
              borderColor={isToday ? 'brand.gold' : 'rgba(212,175,55,0.1)'}
            >
              <Text fontSize="10px" fontWeight="700" color="rgba(212,175,55,0.5)"
                letterSpacing="0.08em" textTransform="uppercase">
                {DOW_FULL[day.getDay()].slice(0, 3)}
              </Text>
              <Text fontSize="18px" fontWeight={isToday ? '800' : '400'}
                color={isToday ? 'brand.gold' : 'rgba(212,175,55,0.7)'} lineHeight="1.2">
                {day.getDate()}
              </Text>
            </Box>

            {/* Events */}
            <VStack spacing={1} align="stretch" minH="120px">
              {dayEvents.map((e) => (
                <EventCard key={e.id} event={e} onClick={onEventClick} />
              ))}
              {dayEvents.length === 0 && (
                <Box
                  h="100%"
                  minH="80px"
                  border="1px dashed"
                  borderColor="rgba(212,175,55,0.08)"
                  borderRadius="6px"
                />
              )}
            </VStack>
          </Box>
        );
      })}
    </Grid>
  );
}
