import { Box, Grid, Text, VStack } from '@chakra-ui/react';
import EventCard from './EventCard';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toDateKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export default function MonthView({ year, month, events, onEventClick }) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const eventMap = {};
  events.forEach((e) => {
    if (!eventMap[e.date]) eventMap[e.date] = [];
    eventMap[e.date].push(e);
  });

  const cells = [];
  // leading empty cells
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (d) =>
    d && today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  return (
    <Box>
      {/* Day-of-week header */}
      <Grid templateColumns="repeat(7, 1fr)" mb={1}>
        {DOW.map((d) => (
          <Text key={d} textAlign="center" fontSize="11px" fontWeight="700"
            color="rgba(212,175,55,0.5)" letterSpacing="0.08em" textTransform="uppercase" py={1}>
            {d}
          </Text>
        ))}
      </Grid>

      {/* Calendar grid */}
      <Grid templateColumns="repeat(7, 1fr)" gap={1}>
        {cells.map((d, i) => {
          const key = d ? toDateKey(year, month, d) : `empty-${i}`;
          const dayEvents = d ? (eventMap[toDateKey(year, month, d)] || []) : [];
          const todayStyle = isToday(d);

          return (
            <Box
              key={key}
              minH={{ base: '70px', md: '90px' }}
              bg={d ? 'rgba(84,56,37,0.35)' : 'transparent'}
              border="1px solid"
              borderColor={todayStyle ? 'brand.gold' : d ? 'rgba(212,175,55,0.1)' : 'transparent'}
              borderRadius="8px"
              p={1.5}
              position="relative"
            >
              {d && (
                <Text
                  fontSize="12px"
                  fontWeight={todayStyle ? '800' : '500'}
                  color={todayStyle ? 'brand.gold' : 'rgba(212,175,55,0.5)'}
                  mb={1}
                  lineHeight="1"
                >
                  {d}
                </Text>
              )}
              <VStack spacing={0} align="stretch">
                {dayEvents.slice(0, 3).map((e) => (
                  <EventCard key={e.id} event={e} onClick={onEventClick} compact />
                ))}
                {dayEvents.length > 3 && (
                  <Text fontSize="10px" color="rgba(212,175,55,0.4)" pl={1}>
                    +{dayEvents.length - 3} more
                  </Text>
                )}
              </VStack>
            </Box>
          );
        })}
      </Grid>
    </Box>
  );
}
