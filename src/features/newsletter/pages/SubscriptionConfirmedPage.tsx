import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import { confirmSubscription } from '@/shared/lib/brevo';
import { PageLoader } from '@/shared/components/Loader';
import { Button } from '@/shared/components/Button';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Navbar } from '@/shared/components/Navbar';
import { useTranslation } from 'react-i18next';

export default function SubscriptionConfirmedPage() {
  const { t } = useTranslation(['newsletter', 'landing', 'common']);
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const email = searchParams.get('email');

  useEffect(() => {
    const confirm = async () => {
      if (!email) {
        setStatus('error');
        return;
      }

      try {
        const emailId = email.toLowerCase().trim();
        const docRef = doc(db, 'subscribers', emailId);
        const snap = await getDoc(docRef);
        
        if (!snap.exists()) {
          setStatus('error');
          return;
        }

        const data = snap.data();
        if (data.status !== 'confirmed') {
          await updateDoc(docRef, {
            status: 'confirmed'
          });
          
          try {
            await confirmSubscription(emailId);
          } catch (brevoErr) {
            console.warn('Brevo confirmation email failed, but subscription confirmed in DB:', brevoErr);
          }
        }
        
        setStatus('success');
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    };

    confirm();
  }, [email]);

  if (status === 'loading') return <PageLoader />;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 pt-24">
        <div className="max-w-md w-full bg-white p-12 rounded-[3.5rem] shadow-xl text-center">
          {status === 'success' ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-farm-green mb-4">{t('newsletter:confirmed.title')}!</h1>
              <p className="text-farm-wood mb-10 opacity-80">
                {t('newsletter:confirmed.description')}
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-farm-berry mb-4">{t('common:toasts.error')}</h1>
              <p className="text-farm-wood mb-10 opacity-80">
                {t('newsletter:subscribe.errorToast')}
              </p>
            </>
          )}
          
          <Link to="/">
            <Button className="w-full">{t('newsletter:confirmed.toHome')}</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
