import { useEffect, useState } from 'react';
import {
  Badge, Box, Container, Heading, HStack, Select, Spinner, Table,
  Tbody, Td, Text, Th, Thead, Tr, VStack, useToast,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

const ROLES = ['OWNER', 'WRITER', 'READER'];

const roleBadgeColor = { OWNER: 'red', WRITER: 'yellow', READER: 'gray' };

export default function Admin() {
  const { getToken, user: me } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // id of user being updated

  useEffect(() => {
    fetch('/api/admin/users', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load users');
        return r.json();
      })
      .then((data) => setUsers(data.users ?? []))
      .catch(() => toast({ title: 'Could not load users', status: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdating(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      toast({ title: `Role updated to ${newRole}`, status: 'success', duration: 2000 });
    } catch (err) {
      toast({ title: err.message, status: 'error' });
    } finally {
      setUpdating(null);
    }
  };

  return (
    <Container maxW="900px" py={8} px={6}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" fontFamily="heading">User Management</Heading>

        {loading ? (
          <HStack justify="center" py={12}><Spinner color="brand.gold" size="lg" /></HStack>
        ) : (
          <Box
            bg="rgba(84,56,37,0.6)"
            borderRadius="12px"
            border="1px solid rgba(212,175,55,0.3)"
            overflow="hidden"
          >
            <Table variant="unstyled" size="sm">
              <Thead bg="rgba(0,0,0,0.2)">
                <Tr>
                  <Th color="rgba(212,175,55,0.6)" fontSize="xs" py={3} pl={5}>Name</Th>
                  <Th color="rgba(212,175,55,0.6)" fontSize="xs" py={3}>Email</Th>
                  <Th color="rgba(212,175,55,0.6)" fontSize="xs" py={3}>Joined</Th>
                  <Th color="rgba(212,175,55,0.6)" fontSize="xs" py={3} pr={5}>Role</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((u, i) => (
                  <Tr key={u.id} borderTop={i > 0 ? '1px solid rgba(212,175,55,0.1)' : undefined}>
                    <Td pl={5} py={4}>
                      <HStack spacing={2}>
                        <Text color="brand.gold" fontWeight="600" fontSize="sm">{u.displayName}</Text>
                        {u.id === me?.id && (
                          <Badge fontSize="xs" colorScheme="yellow" variant="subtle">you</Badge>
                        )}
                      </HStack>
                    </Td>
                    <Td>
                      <Text color="rgba(212,175,55,0.7)" fontSize="sm">{u.email}</Text>
                    </Td>
                    <Td>
                      <Text color="rgba(212,175,55,0.5)" fontSize="xs">
                        {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                    </Td>
                    <Td pr={5}>
                      {u.id === me?.id ? (
                        // Owner can't change their own role via this UI
                        <Badge colorScheme={roleBadgeColor[u.role]} fontSize="xs">{u.role}</Badge>
                      ) : (
                        <Select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          isDisabled={updating === u.id}
                          size="sm"
                          maxW="130px"
                          bg="rgba(84,56,37,0.8)"
                          border="1px solid rgba(212,175,55,0.35)"
                          color="brand.gold"
                          _hover={{ borderColor: 'brand.gold' }}
                          sx={{
                            option: { background: '#543825', color: '#D4AF37' },
                          }}
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </Select>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}

        <Text color="rgba(212,175,55,0.4)" fontSize="xs">
          Note: role changes take effect on the user's next login.
        </Text>
      </VStack>
    </Container>
  );
}
