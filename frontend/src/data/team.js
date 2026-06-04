export const team = [
  { id: 'ryan',    name: 'Ryan Sander',  color: '#D4AF37' }, // gold
  { id: 'alice',   name: 'Alice Chen',   color: '#6B9BD2' }, // steel blue
  { id: 'marcus',  name: 'Marcus Webb',  color: '#7EC8A0' }, // sage green
  { id: 'priya',   name: 'Priya Nair',   color: '#C97B84' }, // rose
  { id: 'sam',     name: 'Sam Torres',   color: '#A78BD4' }, // lavender
];

export function getMemberById(id) {
  return team.find((m) => m.id === id);
}

export function getMemberColor(id) {
  return getMemberById(id)?.color ?? '#888';
}
