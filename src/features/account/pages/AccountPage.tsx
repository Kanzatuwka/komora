import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { useUserOrders, useUserAddresses, useUpdateProfile } from '../hooks/useAccountData';
import { Navbar } from '@/shared/components/Navbar';
import { Button } from '@/shared/components/Button';
import { PageLoader } from '@/shared/components/Loader';
import { Link, useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { User, Package, MapPin, LogOut, ChevronRight, Store, Truck, Clock, Lock, X } from 'lucide-react';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { auth } from '@/shared/lib/firebase';
import { cn } from '@/shared/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '@/shared/contexts/ToastContext';
import { useTranslation } from 'react-i18next';
import { OrderListItem } from '../components/OrderListItem';
import { AddressList } from '../components/AddressList';
import { ProfileForm } from '../components/ProfileForm';

export default function AccountPage() {
  const { user, profile, logout, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') as 'orders' | 'addresses' | 'profile') || 'orders';
  const { showToast } = useToast();
  const { t } = useTranslation(['account', 'common']);
  
  const { orders, loading: ordersLoading } = useUserOrders(user?.uid || '');
  const { addresses, removeAddress, addAddress } = useUserAddresses(user?.uid || '');
  const { updateProfile, loading: updatingProfile } = useUpdateProfile(user?.uid || '');
  
  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');

  const isGoogleUser = user?.providerData.some(p => p.providerId === 'google.com') || false;

  if (authLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordError(t('account:passwordChange.passwordsNoMatch'));
      return;
    }

    if (passwordForm.new.length < 6) {
      setPasswordError(t('account:passwordChange.passwordMin'));
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email!, passwordForm.current);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordForm.new);
      
      setIsChangingPassword(false);
      setPasswordForm({ current: '', new: '', confirm: '' });
      showToast({ message: t('account:passwordChange.successToast'), type: 'success' });
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        setPasswordError(t('account:passwordChange.currentInvalid'));
      } else {
        setPasswordError(t('account:passwordChange.updateError'));
      }
    }
  };

  return (
    <div className="min-h-screen bg-farm-cream/30">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-24">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm sticky top-32">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-farm-green rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-farm-green truncate">{user.displayName || profile?.name || t('account:user')}</p>
                  <p className="text-xs text-farm-wood opacity-50 truncate">{user.email}</p>
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={cn(
                    "w-full flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm transition-all",
                    activeTab === 'orders' ? "bg-farm-green text-white shadow-md" : "text-farm-wood hover:bg-black/5"
                  )}
                >
                  <Package className="w-4 h-4" /> {t('account:tabs.orders')}
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={cn(
                    "w-full flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm transition-all",
                    activeTab === 'addresses' ? "bg-farm-green text-white shadow-md" : "text-farm-wood hover:bg-black/5"
                  )}
                >
                  <MapPin className="w-4 h-4" /> {t('account:tabs.addresses')}
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={cn(
                    "w-full flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm transition-all",
                    activeTab === 'profile' ? "bg-farm-green text-white shadow-md" : "text-farm-wood hover:bg-black/5"
                  )}
                >
                  <User className="w-4 h-4" /> {t('account:tabs.profile')}
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-sm text-farm-berry hover:bg-farm-berry/5 mt-8 transition-all"
                >
                  <LogOut className="w-4 h-4" /> {t('common:nav.logout')}
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-farm-green mb-8">{t('account:orders.title')}</h2>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-32 bg-white animate-pulse rounded-3xl" />
                    ))}
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <OrderListItem key={order.id} order={order} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-16 rounded-[3rem] text-center">
                    <Package className="w-16 h-16 text-farm-wood/10 mx-auto mb-6" />
                    <p className="text-farm-wood opacity-50 mb-8">{t('account:orders.empty')}</p>
                    <Link to="/shop">
                      <Button variant="outline">{t('account:orders.toShop')}</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <AddressList 
                addresses={addresses} 
                removeAddress={removeAddress} 
                addAddress={addAddress} 
              />
            )}

            {activeTab === 'profile' && (
              <ProfileForm 
                profile={profile} 
                user={user} 
                updateProfile={updateProfile} 
                loading={updatingProfile} 
                onPasswordChange={() => setIsChangingPassword(true)}
                isGoogleUser={isGoogleUser}
              />
            )}
          </div>
        </div>
      </main>

      {/* Password Modal */}
      <AnimatePresence>
        {isChangingPassword && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChangingPassword(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl"
            >
              <button 
                onClick={() => setIsChangingPassword(false)}
                className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>

              <h2 className="text-2xl font-bold text-farm-green mb-8">{t('account:passwordChange.title')}</h2>
              
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-farm-wood mb-2 ml-4">{t('account:passwordChange.currentPassword')}</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.current}
                    onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    className="w-full px-6 py-3 rounded-full border border-farm-wood/10 focus:border-farm-green outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-farm-wood mb-2 ml-4">{t('account:passwordChange.newPassword')}</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.new}
                    onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    className="w-full px-6 py-3 rounded-full border border-farm-wood/10 focus:border-farm-green outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-farm-wood mb-2 ml-4">{t('account:passwordChange.confirmPassword')}</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirm}
                    onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    className="w-full px-6 py-3 rounded-full border border-farm-wood/10 focus:border-farm-green outline-none"
                  />
                </div>

                {passwordError && (
                  <p className="text-red-500 text-sm font-medium text-center">{passwordError}</p>
                )}

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1">{t('account:passwordChange.update')}</Button>
                  <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsChangingPassword(false)}>{t('account:passwordChange.cancel')}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
