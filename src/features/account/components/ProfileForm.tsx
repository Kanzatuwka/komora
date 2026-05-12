import { useState } from 'react';
import { Button } from '@/shared/components/Button';
import { Lock, Globe, CircleDollarSign } from 'lucide-react';
import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
import { CurrencySwitcher } from '@/shared/components/CurrencySwitcher';
import { useTranslation } from 'react-i18next';

interface ProfileFormProps {
  profile: any;
  user: any;
  updateProfile: (data: any) => Promise<boolean>;
  loading: boolean;
  onPasswordChange: () => void;
  isGoogleUser: boolean;
}

export function ProfileForm({ profile, user, updateProfile, loading, onPasswordChange, isGoogleUser }: ProfileFormProps) {
  const { t } = useTranslation(['account', 'common']);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
  });

  const handleEdit = () => {
    setForm({
      name: profile?.name || '',
      phone: profile?.phone || '',
    });
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateProfile(form);
    if (success) setIsEditing(false);
  };

  return (
    <div className="bg-white p-12 rounded-[3.5rem] shadow-sm">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-3xl font-bold text-farm-green">{t('account:profile.title')}</h2>
        {!isEditing && (
          <Button onClick={handleEdit} size="sm">{t('account:profile.edit')}</Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-4">{t('account:profile.fullName')}</label>
              <input 
                type="text" 
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-8 py-4 bg-gray-50 border-none rounded-full focus:ring-2 focus:ring-farm-green/20 outline-none font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-4">{t('account:profile.phone')}</label>
              <input 
                type="tel" 
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-8 py-4 bg-gray-50 border-none rounded-full focus:ring-2 focus:ring-farm-green/20 outline-none font-bold"
              />
            </div>
            <div className="flex gap-4 pt-4">
              <Button disabled={loading}>
                {loading ? t('account:profile.saving') : t('account:profile.save')}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>{t('common:cancel')}</Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-farm-wood/40 mb-2 ml-4">{t('account:profile.fullName')}</p>
              <div className="px-8 py-4 bg-farm-cream/50 rounded-full font-bold text-farm-green">
                {profile?.name || t('account:profile.notSpecified')}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-farm-wood/40 mb-2 ml-4">{t('account:profile.phone')}</p>
              <div className="px-8 py-4 bg-farm-cream/50 rounded-full font-bold text-farm-green">
                {profile?.phone || t('account:profile.notSpecified')}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-farm-wood/40 mb-2 ml-4">Email</p>
              <div className="px-8 py-4 bg-farm-cream/50 rounded-full font-bold text-farm-green">
                {user.email}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8 bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100/50">
          <div>
            <h3 className="text-sm font-bold text-farm-green uppercase tracking-widest mb-6 flex items-center gap-2">
              <Globe className="w-4 h-4 text-farm-green/40" /> {t('common:nav.language')}
            </h3>
            <div className="flex items-center gap-2 bg-white p-2 rounded-full shadow-sm border border-gray-100">
              <LanguageSwitcher variant="inline" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-farm-green uppercase tracking-widest mb-6 flex items-center gap-2">
              <CircleDollarSign className="w-4 h-4 text-farm-green/40" /> {t('common:nav.currency')}
            </h3>
            <div className="flex items-center gap-2 bg-white p-2 rounded-full shadow-sm border border-gray-100">
              <CurrencySwitcher variant="inline" />
            </div>
          </div>

          <div className="pt-6 border-t border-farm-wood/10">
            <h3 className="text-sm font-bold text-farm-green uppercase tracking-widest mb-4">{t('account:profile.security')}</h3>
            {isGoogleUser ? (
              <p className="text-xs text-farm-wood opacity-70 italic">
                {t('account:profile.googleAuthNote')}
              </p>
            ) : (
              <Button 
                variant="outline" 
                onClick={onPasswordChange}
                className="w-full flex items-center gap-2 justify-center rounded-full py-3"
              >
                <Lock className="w-4 h-4" /> {t('account:profile.changePassword')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
