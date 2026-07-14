import { Box, Text } from '@chakra-ui/react';
import { getMemberColor } from '../../data/team';

export default function EventCard({ event, onClick, compact = false }) {
  const color = getMemberColor(event.people?.[0]?.teamMemberId);

  return (
    <Box
      onClick={() => onClick(event)}
      cursor="pointer"
      bg={`${color}22`}
      borderLeft="3px solid"
      borderColor={color}
      borderRadius="6px"
      px={compact ? 1.5 : 2}
      py={compact ? 0.5 : 1}
      mb={1}
      _hover={{ bg: `${color}40`, transform: 'translateX(2px)' }}
      transition="all 0.15s ease"
      overflow="hidden"
    >
      {event.time && (
        <Text fontSize="10px" color={color} fontWeight="700" letterSpacing="0.04em" lineHeight="1.2">
          {event.time}
        </Text>
      )}
      <Text
        fontSize={compact ? '11px' : '12px'}
        color="brand.gold"
        fontWeight="600"
        lineHeight="1.3"
        noOfLines={compact ? 1 : 2}
      >
        {event.title}
      </Text>
    </Box>
  );
}
