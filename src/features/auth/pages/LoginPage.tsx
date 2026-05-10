import { LoginForm } from '../components/LoginForm';
import { Navbar } from '@/shared/components/Navbar';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-farm-cream flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 pt-24">
        <LoginForm />
      </main>
    </div>
  );
}
