import { useEffect, useState } from 'react';
import {
  Badge, Box, Button, Container, Heading, HStack, IconButton, Select,
  Spinner, Tab, TabList, TabPanel, TabPanels, Tabs, Table, Tbody, Td,
  Text, Th, Thead, Tr, VStack, useToast,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, useDisclosure,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const ROLES = ['OWNER', 'WRITER', 'READER'];
const roleBadgeColor = { OWNER: 'red', WRITER: 'yellow', READER: 'gray' };

function ConfirmDialog({ isOpen, onClose, onConfirm, title, body, confirmLabel = 'Delete' }) {
  const cancelRef = useRef();
  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
      <AlertDialogOverlay bg="rgba(0,0,0,0.6)">
        <AlertDialogContent bg="rgba(60,30,20,0.97)" border="1px solid rgba(212,175,55,0.3)" borderRadius="12px">
          <AlertDialogHeader fontFamily="heading" color="brand.gold">{title}</AlertDialogHeader>
          <AlertDialogBody color="rgba(212,175,55,0.8)">{body}</AlertDialogBody>
          <AlertDialogFooter gap={3}>
            <Button ref={cancelRef} onClick={onClose} variant="outline"
              borderColor="rgba(212,175,55,0.4)" color="brand.gold" _hover={{ bg: 'rgba(212,175,55,0.1)' }}>
              Cancel
            </Button>
            <Button onClick={onConfirm} bg="red.700" color="white" _hover={{ bg: 'red.600' }}>
              {confirmLabel}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}

export default function Admin() {
  const { getToken, user: me } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [updating, setUpdating] = useState(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [pendingDelete, setPendingDelete] = useState(null); // { type: 'user'|'post', id, label }

  useEffect(() => {
    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => r.ok ? r.json() : { users: [] })
      .then((d) => setUsers(d.users ?? []))
      .catch(() => toast({ title: 'Could not load users', status: 'error' }))
      .finally(() => setLoadingUsers(false));

    fetch('/api/admin/posts', { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => r.ok ? r.json() : { posts: [] })
      .then((d) => setPosts(d.posts ?? []))
      .catch(() => toast({ title: 'Could not load posts', status: 'error' }))
      .finally(() => setLoadingPosts(false));
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdating(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
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

  const confirmDelete = (type, id, label) => {
    setPendingDelete({ type, id, label });
    onOpen();
  };

  const handleConfirmedDelete = async () => {
    const { type, id } = pendingDelete;
    onClose();
    const url = type === 'user' ? `/api/admin/users/${id}` : `/api/admin/posts/${id}`;
    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      if (type === 'user') setUsers((prev) => prev.filter((u) => u.id !== id));
      else setPosts((prev) => prev.filter((p) => p.slug !== id));
      toast({ title: 'Deleted', status: 'success', duration: 2000 });
    } catch (err) {
      toast({ title: err.message, status: 'error' });
    }
  };

  const tabStyle = {
    color: 'rgba(212,175,55,0.7)',
    _selected: { color: 'brand.gold', borderColor: 'rgba(212,175,55,0.4)', bg: 'rgba(84,56,37,0.6)' },
  };

  const tableBox = (
    <Box bg="rgba(84,56,37,0.6)" borderRadius="12px" border="1px solid rgba(212,175,55,0.3)" overflow="hidden" />
  );

  return (
    <Container maxW="960px" py={8} px={6}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" fontFamily="heading">Admin</Heading>

        <Tabs variant="enclosed" colorScheme="yellow">
          <TabList borderColor="rgba(212,175,55,0.25)">
            <Tab {...tabStyle}>Users</Tab>
            <Tab {...tabStyle}>Posts</Tab>
          </TabList>

          <TabPanels>
            {/* ── USERS TAB ─────────────────────────────────────────────── */}
            <TabPanel px={0} pt={4}>
              {loadingUsers ? (
                <HStack justify="center" py={12}><Spinner color="brand.gold" size="lg" /></HStack>
              ) : (
                <Box bg="rgba(84,56,37,0.6)" borderRadius="12px"
                  border="1px solid rgba(212,175,55,0.3)" overflow="hidden">
                  <Table variant="unstyled" size="sm">
                    <Thead bg="rgba(0,0,0,0.2)">
                      <Tr>
                        <Th color="rgba(212,175,55,0.6)" fontSize="xs" py={3} pl={5}>Name</Th>
                        <Th color="rgba(212,175,55,0.6)" fontSize="xs" py={3}>Email</Th>
                        <Th color="rgba(212,175,55,0.6)" fontSize="xs" py={3}>Joined</Th>
                        <Th color="rgba(212,175,55,0.6)" fontSize="xs" py={3}>Role</Th>
                        <Th py={3} pr={4} />
                      </Tr>
                    </Thead>
                    <Tbody>
                      {users.map((u, i) => (
                        <Tr key={u.id} borderTop={i > 0 ? '1px solid rgba(212,175,55,0.1)' : undefined}>
                          <Td pl={5} py={4}>
                            <HStack spacing={2}>
                              <Text color="brand.gold" fontWeight="600" fontSize="sm">{u.displayName}</Text>
                              {u.id === me?.id && <Badge fontSize="xs" colorScheme="yellow" variant="subtle">you</Badge>}
                            </HStack>
                          </Td>
                          <Td><Text color="rgba(212,175,55,0.7)" fontSize="sm">{u.email}</Text></Td>
                          <Td>
                            <Text color="rgba(212,175,55,0.5)" fontSize="xs">
                              {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Text>
                          </Td>
                          <Td>
                            {u.id === me?.id ? (
                              <Badge colorScheme={roleBadgeColor[u.role]} fontSize="xs">{u.role}</Badge>
                            ) : (
                              <Select
                                value={u.role}
                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                isDisabled={updating === u.id}
                                size="sm" maxW="130px"
                                bg="rgba(84,56,37,0.8)" border="1px solid rgba(212,175,55,0.35)"
                                color="brand.gold" _hover={{ borderColor: 'brand.gold' }}
                                sx={{ option: { background: '#543825', color: '#D4AF37' } }}
                              >
                                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                              </Select>
                            )}
                          </Td>
                          <Td pr={4} textAlign="right">
                            {u.id !== me?.id && (
                              <Button size="xs" variant="ghost" color="red.400"
                                _hover={{ bg: 'rgba(255,80,80,0.12)', color: 'red.300' }}
                                onClick={() => confirmDelete('user', u.id, u.displayName)}>
                                Remove
                              </Button>
                            )}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
              <Text color="rgba(212,175,55,0.4)" fontSize="xs" mt={3}>
                Role changes take effect on the user's next login.
              </Text>
            </TabPanel>

            {/* ── POSTS TAB ─────────────────────────────────────────────── */}
            <TabPanel px={0} pt={4}>
              {loadingPosts ? (
                <HStack justify="center" py={12}><Spinner color="brand.gold" size="lg" /></HStack>
              ) : posts.length === 0 ? (
                <Text color="rgba(212,175,55,0.5)">No posts yet.</Text>
              ) : (
                <Box bg="rgba(84,56,37,0.6)" borderRadius="12px"
                  border="1px solid rgba(212,175,55,0.3)" overflow="hidden">
                  <Table variant="unstyled" size="sm">
                    <Thead bg="rgba(0,0,0,0.2)">
                      <Tr>
                        <Th color="rgba(212,175,55,0.6)" fontSize="xs" py={3} pl={5}>Title</Th>
                        <Th color="rgba(212,175,55,0.6)" fontSize="xs" py={3}>Author</Th>
                        <Th color="rgba(212,175,55,0.6)" fontSize="xs" py={3}>Status</Th>
                        <Th color="rgba(212,175,55,0.6)" fontSize="xs" py={3}>Updated</Th>
                        <Th py={3} pr={4} />
                      </Tr>
                    </Thead>
                    <Tbody>
                      {posts.map((p, i) => (
                        <Tr key={p.slug} borderTop={i > 0 ? '1px solid rgba(212,175,55,0.1)' : undefined}>
                          <Td pl={5} py={4} maxW="260px">
                            <Text color="brand.gold" fontWeight="600" fontSize="sm" noOfLines={1}>{p.title}</Text>
                            <Text color="rgba(212,175,55,0.4)" fontSize="xs">/blog/{p.slug}</Text>
                          </Td>
                          <Td>
                            <Text color="rgba(212,175,55,0.7)" fontSize="sm">{p.author?.displayName}</Text>
                          </Td>
                          <Td>
                            <Badge fontSize="xs"
                              colorScheme={p.published ? 'green' : 'gray'}
                              variant="subtle">
                              {p.published ? 'Published' : 'Draft'}
                            </Badge>
                          </Td>
                          <Td>
                            <Text color="rgba(212,175,55,0.5)" fontSize="xs">
                              {new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </Text>
                          </Td>
                          <Td pr={4}>
                            <HStack spacing={2} justify="flex-end">
                              <Button as={Link} to={`/write/${p.slug}`} size="xs" variant="outline"
                                borderColor="rgba(212,175,55,0.35)" color="brand.gold"
                                _hover={{ bg: 'rgba(212,175,55,0.1)' }}>
                                Edit
                              </Button>
                              <Button size="xs" variant="ghost" color="red.400"
                                _hover={{ bg: 'rgba(255,80,80,0.12)', color: 'red.300' }}
                                onClick={() => confirmDelete('post', p.slug, p.title)}>
                                Delete
                              </Button>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      <ConfirmDialog
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirmedDelete}
        title={`Delete ${pendingDelete?.type === 'user' ? 'User' : 'Post'}?`}
        body={`"${pendingDelete?.label}" will be permanently removed. This cannot be undone.`}
      />
    </Container>
  );
}

