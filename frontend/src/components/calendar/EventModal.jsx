import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  Box, Text, HStack, VStack, Badge, Divider,
} from '@chakra-ui/react';
import { getMemberColor } from '../../data/team';

function formatTime(t) {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function formatDate(dateStr) {
  const [y, mo, d] = dateStr.split('-').map(Number);
  return new Date(y, mo - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

export default function EventModal({ event, isOpen, onClose }) {
  if (!event) return null;

  const ownerColor = getMemberColor(event.people?.[0]?.teamMemberId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent
        bg="brand.redDark"
        border="1px solid"
        borderColor={ownerColor}
        borderRadius="12px"
        mx={4}
      >
        <Box h="4px" bg={ownerColor} borderTopRadius="11px" />
        <ModalHeader pb={1} pt={4}>
          <Text fontFamily="heading" fontSize="xl" color="brand.gold">
            {event.title}
          </Text>
        </ModalHeader>
        <ModalCloseButton color="brand.gold" />

        <ModalBody pb={6}>
          <VStack align="stretch" spacing={4}>
            {/* Date / Time */}
            <HStack spacing={3} flexWrap="wrap">
              <Badge
                bg={`${ownerColor}33`}
                color={ownerColor}
                border="1px solid"
                borderColor={`${ownerColor}66`}
                borderRadius="6px"
                px={2} py={1}
                fontSize="12px"
                fontWeight="600"
              >
                📅 {formatDate(event.date)}
              </Badge>
              {event.time && (
                <Badge
                  bg="rgba(212,175,55,0.1)"
                  color="brand.gold"
                  border="1px solid rgba(212,175,55,0.3)"
                  borderRadius="6px"
                  px={2} py={1}
                  fontSize="12px"
                  fontWeight="600"
                >
                  🕐 {formatTime(event.time)}{event.endTime ? ` – ${formatTime(event.endTime)}` : ''}
                </Badge>
              )}
            </HStack>

            {/* Location */}
            {event.location && (
              <HStack spacing={2}>
                <Text fontSize="13px" color="rgba(212,175,55,0.6)">📍</Text>
                <Text fontSize="13px" color="brand.gold">{event.location}</Text>
              </HStack>
            )}

            {/* Description */}
            {event.description && (
              <>
                <Divider borderColor="rgba(212,175,55,0.15)" />
                <Text fontSize="14px" color="rgba(212,175,55,0.85)" lineHeight="1.6">
                  {event.description}
                </Text>
              </>
            )}

            {/* People */}
            {event.people?.length > 0 && (
              <>
                <Divider borderColor="rgba(212,175,55,0.15)" />
                <Text fontSize="11px" color="rgba(212,175,55,0.5)" fontWeight="700" letterSpacing="0.08em" textTransform="uppercase">
                  People
                </Text>
                <VStack align="stretch" spacing={2}>
                  {event.people.map((p, i) => {
                    const c = getMemberColor(p.teamMemberId);
                    return (
                      <HStack key={i} justify="space-between">
                        <HStack spacing={2}>
                          <Box w="8px" h="8px" borderRadius="full" bg={c} flexShrink={0} />
                          <Text fontSize="13px" color="brand.gold" fontWeight="500">{p.name}</Text>
                        </HStack>
                        <Text fontSize="12px" color="rgba(212,175,55,0.5)">{p.role}</Text>
                      </HStack>
                    );
                  })}
                </VStack>
              </>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
