import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/shared/lib/firebase';
import { Button } from '@/shared/components/Button';
import { useToast } from '@/shared/contexts/ToastContext';
import { Save, Loader2, Plus, MapPin, Clock, Trash2, Edit2 } from 'lucide-react';
import { usePickupAddresses } from '../../shop/hooks/useShopData';
import { Modal } from '@/shared/components/Modal';
import { cn } from '@/shared/lib/utils';
import { LocalizedField } from '../components/LocalizedField';
import { SUPPORTED_LANGUAGES } from '@/i18n/config';
import { useTranslation } from 'react-i18next';

import { ImageUploader } from '../components/ImageUploader';

interface LandingSettings {
  hero: {
    title: Record<string, string>;
    subtitle: Record<string, string>;
    ctaText: Record<string, string>;
    imageUrl: string;
  };
  about: {
    text: Record<string, string>;
    imageUrl: string;
  };
}

export default function AdminSettingsPage() {
  const { t, i18n } = useTranslation('admin');
  const [settings, setSettings] = useState<LandingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  
  const { addresses: pickupPoints, loading: pickupLoading } = usePickupAddresses();
  const [isPointModalOpen, setIsPointModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState<any>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [pointForm, setPointForm] = useState({
    label: { uk: '', en: '', de: '' } as Record<string, string>,
    address: { uk: '', en: '', de: '' } as Record<string, string>,
    workingHours: { uk: '', en: '', de: '' } as Record<string, string>
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'landing'));
        if (snap.exists()) {
          const data = snap.data() as any;
          
          // Normalize legacy data
          const normalized: LandingSettings = {
            hero: {
              title: typeof data.hero?.title === 'string' ? { uk: data.hero.title, en: '', de: '' } : data.hero?.title || { uk: '', en: '', de: '' },
              subtitle: typeof data.hero?.subtitle === 'string' ? { uk: data.hero.subtitle, en: '', de: '' } : data.hero?.subtitle || { uk: '', en: '', de: '' },
              ctaText: typeof data.hero?.ctaText === 'string' ? { uk: data.hero.ctaText, en: '', de: '' } : data.hero?.ctaText || { uk: '', en: '', de: '' },
              imageUrl: data.hero?.imageUrl || '',
            },
            about: {
              text: typeof data.about?.text === 'string' ? { uk: data.about.text, en: '', de: '' } : data.about?.text || { uk: '', en: '', de: '' },
              imageUrl: data.about?.imageUrl || '',
            }
          };
          setSettings(normalized);
        } else {
          setSettings({
            hero: {
              title: { uk: 'Справжні смаки природи', en: '', de: '' },
              subtitle: { uk: 'Сімейні рецепти, зібрані з любов’ю на наших полях та садах.', en: '', de: '' },
              ctaText: { uk: 'До магазину', en: '', de: '' },
              imageUrl: '',
            },
            about: {
              text: { uk: 'Ласкаво просимо до Комори! Ми – сімейна ферма, що присвятила себе створенню натуральних продуктів.', en: '', de: '' },
              imageUrl: '',
            }
          });
        }
      } catch (err) {
        console.error(err);
        showToast({ message: t('settings.toasts.loadError'), type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [showToast, t]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'landing'), settings);
      showToast({ message: t('settings.toasts.saved'), type: 'success' });
    } catch (err) {
      console.error(err);
      showToast({ message: t('settings.toasts.saveError'), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePoint = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingPoint) {
        await updateDoc(doc(db, 'pickupAddresses', editingPoint.id), pointForm);
        showToast({ message: t('settings.toasts.pointUpdated'), type: 'success' });
      } else {
        await addDoc(collection(db, 'pickupAddresses'), pointForm);
        showToast({ message: t('settings.toasts.pointAdded'), type: 'success' });
      }
      setIsPointModalOpen(false);
      setEditingPoint(null);
      setPointForm({ 
        label: { uk: '', en: '', de: '' }, 
        address: { uk: '', en: '', de: '' }, 
        workingHours: { uk: '', en: '', de: '' } 
      });
    } catch (err) {
      showToast({ message: t('settings.toasts.pointSaveError'), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePoint = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'pickupAddresses', id));
      showToast({ message: t('settings.toasts.pointDeleted'), type: 'success' });
      setConfirmDeleteId(null);
    } catch (err) {
      showToast({ message: t('settings.toasts.deleteError'), type: 'error' });
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-farm-green" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">{t('settings.title.main')} <br/><span className="text-farm-green">{t('settings.title.sub')}</span></h1>
        <Button onClick={handleSaveSettings} disabled={saving} className="flex items-center gap-2 px-8">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {t('settings.saveAll')}
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-8 text-farm-green flex items-center gap-3">
              <span className="w-2 h-2 bg-farm-berry rounded-full animate-pulse" /> {t('settings.sections.hero')}
            </h2>
            <div className="space-y-6">
              <LocalizedField 
                label={t('settings.labels.title')}
                value={settings.hero.title}
                onChange={title => setSettings({ ...settings, hero: { ...settings.hero, title } })}
              />
              <LocalizedField 
                label={t('settings.labels.subtitle')}
                type="textarea"
                value={settings.hero.subtitle}
                onChange={subtitle => setSettings({ ...settings, hero: { ...settings.hero, subtitle } })}
              />
              <LocalizedField 
                label={t('settings.labels.ctaText')}
                value={settings.hero.ctaText}
                onChange={ctaText => setSettings({ ...settings, hero: { ...settings.hero, ctaText } })}
              />
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-2">{t('settings.labels.heroImage')}</label>
                <ImageUploader 
                  single 
                  images={settings.hero.imageUrl ? [settings.hero.imageUrl] : []} 
                  onChange={imgs => setSettings({ ...settings, hero: { ...settings.hero, imageUrl: imgs[0] || '' } })} 
                  folder="settings"
                />
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-8 text-farm-green flex items-center gap-3">
              <span className="w-2 h-2 bg-farm-green rounded-full animate-pulse" /> {t('settings.sections.about')}
            </h2>
            <div className="space-y-6">
              <LocalizedField 
                label={t('settings.labels.aboutText')}
                type="textarea"
                value={settings.about.text}
                onChange={text => setSettings({ ...settings, about: { ...settings.about, text } })}
              />
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-2">{t('settings.labels.aboutImage')}</label>
                <ImageUploader 
                  single 
                  images={settings.about.imageUrl ? [settings.about.imageUrl] : []} 
                  onChange={imgs => setSettings({ ...settings, about: { ...settings.about, imageUrl: imgs[0] || '' } })} 
                  folder="settings"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pickup Addresses */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 h-fit">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-farm-green">{t('settings.sections.pickup')}</h2>
            <button 
              onClick={() => {
                setEditingPoint(null);
                setPointForm({ 
                  label: { uk: '', en: '', de: '' }, 
                  address: { uk: '', en: '', de: '' }, 
                  workingHours: { uk: '', en: '', de: '' } 
                });
                setIsPointModalOpen(true);
              }}
              className="w-10 h-10 bg-farm-green/5 text-farm-green rounded-full flex items-center justify-center hover:bg-farm-green hover:text-white transition-all shadow-sm"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {pickupLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-6 h-6 animate-spin text-farm-green" />
              </div>
            ) : pickupPoints.length > 0 ? (
              pickupPoints.map(point => (
                <div key={point.id} className="group p-6 bg-gray-50 rounded-[2rem] hover:bg-white hover:ring-2 hover:ring-farm-green/10 transition-all border border-transparent hover:border-farm-green/5 relative">
                  <div className="flex items-start gap-4 pr-12">
                    <div className="w-10 h-10 bg-farm-green/10 rounded-2xl flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-farm-green" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{typeof point.label === 'string' ? point.label : point.label?.[i18n.language] || point.label?.uk}</p>
                      <p className="text-sm text-gray-500 mb-2">{typeof point.address === 'string' ? point.address : point.address?.[i18n.language] || point.address?.uk}</p>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-farm-berry uppercase tracking-wider">
                        <Clock className="w-3 h-3" /> {typeof point.workingHours === 'string' ? point.workingHours : point.workingHours?.[i18n.language] || point.workingHours?.uk}
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditingPoint(point);
                        setPointForm({ 
                          label: point.raw?.label || (typeof point.label === 'string' ? { uk: point.label, en: '', de: '' } : point.label), 
                          address: point.raw?.address || (typeof point.address === 'string' ? { uk: point.address, en: '', de: '' } : point.address), 
                          workingHours: point.raw?.workingHours || (typeof point.workingHours === 'string' ? { uk: point.workingHours, en: '', de: '' } : point.workingHours) 
                        });
                        setIsPointModalOpen(true);
                      }}
                      className="p-2 text-farm-wood hover:text-farm-green"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeletePoint(point.id)}
                      className={cn(
                        "p-2 transition-all",
                        confirmDeleteId === point.id 
                          ? "bg-red-500 text-white rounded-xl px-4 animate-pulse flex items-center gap-2" 
                          : "text-farm-wood hover:text-farm-berry"
                      )}
                    >
                      {confirmDeleteId === point.id ? (
                        <span className="text-[10px] font-bold uppercase whitespace-nowrap">{t('settings.points.confirmDelete')}</span>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-12 text-gray-400 italic">{t('settings.points.empty')}</p>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isPointModalOpen}
        onClose={() => setIsPointModalOpen(false)}
        title={editingPoint ? t('settings.points.editTitle') : t('settings.points.addTitle')}
      >
        <form onSubmit={handleSavePoint} className="space-y-6">
          <LocalizedField 
            label={t('settings.points.labelName')}
            value={pointForm.label}
            onChange={label => setPointForm({ ...pointForm, label })}
          />
          <LocalizedField 
            label={t('settings.points.labelAddress')}
            value={pointForm.address}
            onChange={address => setPointForm({ ...pointForm, address })}
          />
          <LocalizedField 
            label={t('settings.points.labelHours')}
            value={pointForm.workingHours}
            onChange={workingHours => setPointForm({ ...pointForm, workingHours })}
          />
          <div className="pt-4">
            <Button disabled={saving} className="w-full py-4">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : t('settings.points.saveButton')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
