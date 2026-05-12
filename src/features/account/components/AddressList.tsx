import { useState } from 'react';
import { Button } from '@/shared/components/Button';
import { MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  postalCode: string;
}

interface AddressListProps {
  addresses: Address[];
  removeAddress: (id: string) => Promise<void>;
  addAddress: (data: any) => Promise<void>;
}

export function AddressList({ addresses, removeAddress, addAddress }: AddressListProps) {
  const { t } = useTranslation(['account', 'common']);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ label: '', street: '', city: '', postalCode: '' });
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addAddress(form);
    setIsAdding(false);
    setForm({ label: '', street: '', city: '', postalCode: '' });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-farm-green">{t('account:addresses.title')}</h2>
        <Button onClick={() => setIsAdding(true)} size="sm">{t('account:addresses.addNew')}</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {addresses.map(addr => (
          <div key={addr.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-transparent hover:border-farm-green/20 transition-all flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-farm-green" />
                <span className="font-bold text-farm-green">{addr.label}</span>
              </div>
              <p className="text-sm text-farm-wood opacity-70 mb-1">{addr.street}</p>
              <p className="text-sm text-farm-wood opacity-70">{addr.city}, {addr.postalCode}</p>
            </div>
            <button 
              onClick={() => setIsDeleting(addr.id)}
              className="text-xs font-bold text-farm-berry hover:underline p-2"
            >
              {t('account:addresses.delete')}
            </button>
          </div>
        ))}
        {addresses.length === 0 && (
          <div className="md:col-span-2 bg-white/50 border-2 border-dashed border-farm-wood/10 p-12 rounded-[2.5rem] text-center">
            <p className="text-farm-wood opacity-50">{t('account:addresses.empty')}</p>
          </div>
        )}
      </div>

      {/* Add Address Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-farm-green mb-8">{t('account:addresses.newAddressTitle')}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-farm-wood mb-2 ml-4">{t('account:addresses.labelPlaceholder')}</label>
                  <input
                    type="text"
                    required
                    value={form.label}
                    onChange={e => setForm({ ...form, label: e.target.value })}
                    className="w-full px-6 py-3 rounded-full border border-farm-wood/10 focus:border-farm-green outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-farm-wood mb-2 ml-4">{t('account:addresses.streetPlaceholder')}</label>
                  <input
                    type="text"
                    required
                    value={form.street}
                    onChange={e => setForm({ ...form, street: e.target.value })}
                    className="w-full px-6 py-3 rounded-full border border-farm-wood/10 focus:border-farm-green outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-farm-wood mb-2 ml-4">{t('account:addresses.cityPlaceholder')}</label>
                    <input
                      type="text"
                      required
                      value={form.city}
                      onChange={e => setForm({ ...form, city: e.target.value })}
                      className="w-full px-6 py-3 rounded-full border border-farm-wood/10 focus:border-farm-green outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-farm-wood mb-2 ml-4">{t('account:addresses.postalCodePlaceholder')}</label>
                    <input
                      type="text"
                      required
                      value={form.postalCode}
                      onChange={e => setForm({ ...form, postalCode: e.target.value })}
                      className="w-full px-6 py-3 rounded-full border border-farm-wood/10 focus:border-farm-green outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1">{t('account:profile.save')}</Button>
                  <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsAdding(false)}>{t('common:cancel')}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleting && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleting(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-10 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <X className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-farm-green mb-2">{t('account:addresses.deleteConfirmTitle')}</h3>
              <p className="text-farm-wood opacity-50 mb-8">{t('account:addresses.deleteConfirmDescription')}</p>
              <div className="flex gap-4">
                <Button 
                  onClick={async () => {
                    await removeAddress(isDeleting);
                    setIsDeleting(null);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {t('account:addresses.delete')}
                </Button>
                <Button 
                  variant="ghost" 
                  className="flex-1" 
                  onClick={() => setIsDeleting(null)}
                >
                  {t('common:cancel')}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
