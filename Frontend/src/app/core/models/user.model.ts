export interface User {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  birthDate: string;
  description: string;
  avatarUrl: string;
  role: 'usuario' | 'administrador';
}