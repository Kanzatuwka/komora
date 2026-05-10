import { RegisterForm } from '../components/RegisterForm';
import { Navbar } from '@/shared/components/Navbar';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-farm-cream flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 pt-24">
        <RegisterForm />
      </main>
    </div>
  );
}
