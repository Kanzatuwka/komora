import { useState } from 'react';
import { db } from '@/shared/lib/firebase';
import { useTranslation } from 'react-i18next';
import { 
  collection, 
  getDocs, 
  writeBatch, 
  doc, 
  updateDoc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { 
  Play, 
  FileSearch, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  History,
  Languages,
  Banknote,
  Tags
} from 'lucide-react';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { useToast } from '@/shared/contexts/ToastContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/shared/lib/utils';

interface MigrationLog {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
}

interface MigrationProgress {
  total: number;
  current: number;
  collection: string;
}

export default function AdminMigratePage() {
  const { t } = useTranslation('admin');
  const { showToast } = useToast();
  const [isMigrating, setIsMigrating] = useState(false);
  const [logs, setLogs] = useState<MigrationLog[]>([]);
  const [progress, setProgress] = useState<MigrationProgress | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const addLog = (message: string, type: MigrationLog['type'] = 'info') => {
    setLogs(prev => [{ message, type, timestamp: new Date() }, ...prev].slice(0, 500));
  };

  const runMigration = async (dryRun: boolean = true) => {
    setIsMigrating(true);
    setLogs([]);
    setProgress(null);
    addLog(t('migration.logs.start', { type: dryRun ? t('migration.types.dry') : t('migration.types.real') }), dryRun ? 'info' : 'warning');

    try {
      // ... (migration logic stays mostly the same but could use translated logs)
      
      // 1. Products
      await migrateCollection('products', (data) => {
        const updates: any = {};
        if (typeof data.name === 'string') updates.name = { uk: data.name, en: '', de: '' };
        if (typeof data.description === 'string') updates.description = { uk: data.description, en: '', de: '' };
        if (typeof data.price === 'number') updates.price = { UAH: data.price, EUR: 0, USD: 0 };
        return Object.keys(updates).length > 0 ? updates : null;
      }, dryRun);

      // 2. Articles
      await migrateCollection('articles', (data) => {
        const updates: any = {};
        if (typeof data.title === 'string') updates.title = { uk: data.title, en: '', de: '' };
        if (typeof data.body === 'string') updates.body = { uk: data.body, en: '', de: '' };
        if (typeof data.excerpt === 'string') updates.excerpt = { uk: data.excerpt, en: '', de: '' };
        return Object.keys(updates).length > 0 ? updates : null;
      }, dryRun);

      // 3. Settings/landing
      await migrateDocument('settings', 'landing', (data) => {
        const updates: any = {};
        if (data.hero) {
          updates.hero = { ...data.hero };
          if (typeof data.hero.title === 'string') updates.hero.title = { uk: data.hero.title, en: '', de: '' };
          if (typeof data.hero.subtitle === 'string') updates.hero.subtitle = { uk: data.hero.subtitle, en: '', de: '' };
          if (typeof data.hero.ctaText === 'string') updates.hero.ctaText = { uk: data.hero.ctaText, en: '', de: '' };
        }
        if (data.about) {
          updates.about = { ...data.about };
          if (typeof data.about.text === 'string') updates.about.text = { uk: data.about.text, en: '', de: '' };
        }
        return Object.keys(updates).length > 0 ? updates : null;
      }, dryRun);

      // 4. PickupAddresses
      await migrateCollection('pickupAddresses', (data) => {
        const updates: any = {};
        if (typeof data.label === 'string') updates.label = { uk: data.label, en: '', de: '' };
        if (typeof data.address === 'string') updates.address = { uk: data.address, en: '', de: '' };
        if (typeof data.workingHours === 'string') updates.workingHours = { uk: data.workingHours, en: '', de: '' };
        return Object.keys(updates).length > 0 ? updates : null;
      }, dryRun);

      // 5. BlogCategories
      await migrateCollection('blogCategories', (data) => {
        const updates: any = {};
        if (typeof data.name === 'string') updates.name = { uk: data.name, en: '', de: '' };
        return Object.keys(updates).length > 0 ? updates : null;
      }, dryRun);

      // 6. Tags (aggregate and create)
      await migrateTags(dryRun);

      // 7. Users
      await migrateCollection('users', (data) => {
        const updates: any = {};
        if (data.language === undefined) updates.language = 'uk';
        if (data.preferredCurrency === undefined) updates.preferredCurrency = 'UAH';
        return Object.keys(updates).length > 0 ? updates : null;
      }, dryRun);

      // 8. Subscribers
      await migrateCollection('subscribers', (data) => {
        const updates: any = {};
        if (data.language === undefined) updates.language = 'uk';
        return Object.keys(updates).length > 0 ? updates : null;
      }, dryRun);

      // 9. Orders
      await migrateCollection('orders', (data) => {
        const updates: any = {};
        if (data.userLanguage === undefined) updates.userLanguage = 'uk';
        if (data.currency === undefined) updates.currency = 'UAH';
        return Object.keys(updates).length > 0 ? updates : null;
      }, dryRun);

      addLog(t('migration.logs.success', { type: dryRun ? t('migration.types.dry') : '' }), 'success');
      showToast({ message: t('migration.toasts.success', { type: dryRun ? t('migration.types.dry') : '' }), type: 'success' });
    } catch (error) {
      console.error('Migration error:', error);
      addLog(t('migration.logs.error', { error: error instanceof Error ? error.message : String(error) }), 'error');
      showToast({ message: t('migration.toasts.error'), type: 'error' });
    } finally {
      setIsMigrating(false);
      setProgress(null);
    }
  };

  const migrateCollection = async (collName: string, transform: (data: any) => any, dryRun: boolean) => {
    addLog(t('migration.logs.checkingColl', { collName }));
    const snapshot = await getDocs(collection(db, collName));
    const total = snapshot.size;
    let current = 0;
    
    setProgress({ total, current, collection: collName });

    const CHUNK_SIZE = 500;
    const docs = snapshot.docs;

    for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
      const chunk = docs.slice(i, i + CHUNK_SIZE);
      const batch = dryRun ? null : writeBatch(db);
      let countInBatch = 0;

      for (const d of chunk) {
        const updates = transform(d.data());
        if (updates) {
          if (!dryRun) {
            batch!.update(d.ref, updates);
          }
          const fields = Object.keys(updates).join(', ');
          addLog(`${dryRun ? '[DRY RUN] ' : ''}Migrated ${collName} ${d.id}: ${fields}`, 'info');
          countInBatch++;
        }
        current++;
        setProgress(prev => prev ? { ...prev, current } : null);
      }

      if (!dryRun && countInBatch > 0) {
        try {
          await batch!.commit();
          addLog(`Committed batch for ${collName}`, 'success');
        } catch (err) {
          addLog(`ERROR in batch for ${collName}: ${err instanceof Error ? err.message : String(err)}`, 'error');
          throw err;
        }
      }
    }
    addLog(t('migration.logs.collProcessed', { collName }), 'success');
  };

  const migrateDocument = async (collName: string, docId: string, transform: (data: any) => any, dryRun: boolean) => {
    addLog(t('migration.logs.checkingDoc', { path: `${collName}/${docId}` }));
    const docRef = doc(db, collName, docId);
    const d = await getDoc(docRef);
    
    if (d.exists()) {
      const updates = transform(d.data());
      if (updates) {
        if (!dryRun) {
          await updateDoc(docRef, updates);
        }
        addLog(`${dryRun ? '[DRY RUN] ' : ''}Migrated ${collName}/${docId}: ${Object.keys(updates).join(', ')}`, 'info');
      }
    }
    addLog(t('migration.logs.docProcessed', { path: `${collName}/${docId}` }), 'success');
  };

  const migrateTags = async (dryRun: boolean) => {
    addLog(t('migration.logs.collectingTags'));
    const tagsMap = new Map<string, 'product' | 'article' | 'both'>();

    // Get product tags
    const prodSnap = await getDocs(collection(db, 'products'));
    prodSnap.docs.forEach(d => {
      const tags = d.data().tags;
      if (Array.isArray(tags)) {
        tags.forEach(t => {
          if (typeof t === 'string' && t.trim()) {
            tagsMap.set(t.trim(), 'product');
          }
        });
      }
    });

    // Get article tags
    const artSnap = await getDocs(collection(db, 'articles'));
    artSnap.docs.forEach(d => {
      const tags = d.data().tags;
      if (Array.isArray(tags)) {
        tags.forEach(t => {
          const slug = typeof t === 'string' ? t.trim() : null;
          if (slug) {
            if (tagsMap.has(slug)) {
              tagsMap.set(slug, 'both');
            } else {
              tagsMap.set(slug, 'article');
            }
          }
        });
      }
    });

    const total = tagsMap.size;
    addLog(t('migration.logs.foundTags', { count: total }));
    setProgress({ total, current: 0, collection: 'tags' });

    let current = 0;
    const CHUNK_SIZE = 500;
    const entries = Array.from(tagsMap.entries());

    for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
      const chunk = entries.slice(i, i + CHUNK_SIZE);
      const batch = dryRun ? null : writeBatch(db);
      let countInBatch = 0;

      for (const [slug, scope] of chunk) {
        // Check if exists
        const tagRef = doc(db, 'tags', slug);
        const tagDoc = await getDoc(tagRef);
        
        if (!tagDoc.exists()) {
          const tagData = {
            slug,
            name: { uk: slug, en: '', de: '' },
            scope,
            createdAt: new Date() // User didn't specify, but good to have
          };

          if (!dryRun) {
            batch!.set(tagRef, tagData);
          }
          addLog(`${dryRun ? '[DRY RUN] ' : ''}Created tag: ${slug} (${scope})`, 'info');
          countInBatch++;
        }
        current++;
        setProgress(prev => prev ? { ...prev, current } : null);
      }

      if (!dryRun && countInBatch > 0) {
        await batch!.commit();
        addLog(`Committed batch for tags`, 'success');
      }
    }
    addLog(t('migration.logs.collProcessed', { collName: 'tags' }), 'success');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-farm-green mb-2">{t('migration.title')}</h1>
        <p className="text-farm-wood/70">{t('migration.subtitle')}</p>
      </div>

      <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8 rounded-r-2xl">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
          <h2 className="text-xl font-bold text-red-600 uppercase tracking-tight">{t('migration.warning.title')}</h2>
        </div>
        <ul className="list-disc list-inside space-y-2 text-red-800 font-medium">
          <li>{t('migration.warning.step1')}</li>
          <li>{t('migration.warning.step2')}</li>
          <li>{t('migration.warning.step3')}</li>
        </ul>
      </div>

      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-wrap gap-4 mb-8">
          <Button 
            variant="outline" 
            className="flex-1 min-w-[200px] border-2 border-farm-green text-farm-green hover:bg-farm-green hover:text-white"
            onClick={() => runMigration(true)}
            disabled={isMigrating}
          >
            <FileSearch className="w-5 h-5 mr-2" />
            {t('migration.buttons.dry')}
          </Button>
          <Button 
            className="flex-1 min-w-[200px] bg-red-600 hover:bg-red-700 border-red-600"
            onClick={() => setShowConfirmModal(true)}
            disabled={isMigrating}
          >
            <Play className="w-5 h-5 mr-2" />
            {t('migration.buttons.real')}
          </Button>
        </div>

        {/* Confirmation Modal */}
        <Modal 
          isOpen={showConfirmModal} 
          onClose={() => setShowConfirmModal(false)}
          title={t('migration.modal.title')}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-farm-green mb-4">{t('migration.modal.question')}</h3>
            <p className="text-gray-600 mb-8">
              {t('migration.modal.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setShowConfirmModal(false)}
              >
                {t('migration.modal.cancel')}
              </Button>
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700 border-red-600" 
                onClick={() => {
                  setShowConfirmModal(false);
                  runMigration(false);
                }}
              >
                {t('migration.modal.confirm')}
              </Button>
            </div>
          </div>
        </Modal>

        {progress && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-farm-green">{t('migration.progress.processing', { collection: progress.collection })}</span>
              <span className="text-farm-green font-black">{progress.current} / {progress.total}</span>
            </div>
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-farm-green"
                initial={{ width: 0 }}
                animate={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-farm-green flex items-center gap-2">
              <History className="w-5 h-5" />
              {t('migration.logsTitle')}
            </h3>
            {logs.length > 0 && <span className="text-xs text-farm-wood/50">{t('migration.logsCount', { count: logs.length })}</span>}
          </div>
          
          <div className="h-[400px] bg-gray-900 rounded-2xl p-4 overflow-y-auto font-mono text-sm">
            <div className="flex flex-col gap-1">
              <AnimatePresence initial={false}>
                {logs.length === 0 ? (
                  <div className="text-gray-500 italic py-8 text-center">{t('migration.logsEmpty')}</div>
                ) : logs.map((log, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "flex gap-2",
                      log.type === 'error' ? "text-red-400" :
                      log.type === 'success' ? "text-green-400" :
                      log.type === 'warning' ? "text-amber-400" :
                      "text-blue-300"
                    )}
                  >
                    <span className="text-gray-600 shrink-0">[{log.timestamp.toLocaleTimeString()}]</span>
                    <span>{log.message}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
