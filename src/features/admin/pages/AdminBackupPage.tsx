import { useState, useRef } from 'react';
import { db } from '@/shared/lib/firebase';
import { useTranslation } from 'react-i18next';
import { 
  collection, 
  getDocs, 
  writeBatch, 
  doc, 
  Timestamp
} from 'firebase/firestore';

// ... (rest of the imports)
import { Download, Upload, AlertTriangle, Loader2, Database } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { useToast } from '@/shared/contexts/ToastContext';

const COLLECTIONS = [
  'products',
  'articles',
  'blogCategories',
  'orders',
  'users',
  'subscribers',
  'pickupAddresses',
  'addresses',
  'settings',
  'newsletterHistory',
  'notifications'
];

function processForExport(data: any): any {
  if (data === null || typeof data !== 'object') return data;
  
  if (data instanceof Timestamp || (data && typeof data.toDate === 'function')) {
    return {
      __type: 'timestamp',
      value: data.toDate().toISOString()
    };
  }
  
  if (Array.isArray(data)) {
    return data.map(processForExport);
  }
  
  const processed: any = {};
  for (const key in data) {
    processed[key] = processForExport(data[key]);
  }
  return processed;
}

function processForImport(data: any): any {
  if (data === null || typeof data !== 'object') return data;
  
  if (data.__type === 'timestamp' && data.value) {
    return Timestamp.fromDate(new Date(data.value));
  }
  
  if (Array.isArray(data)) {
    return data.map(processForImport);
  }
  
  const processed: any = {};
  for (const key in data) {
    processed[key] = processForImport(data[key]);
  }
  return processed;
}

export default function AdminBackupPage() {
  const { t } = useTranslation('admin');
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importData, setImportData] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const backup: any = {
        exportedAt: new Date().toISOString(),
        collections: {}
      };

      let totalDocs = 0;

      for (const collName of COLLECTIONS) {
        try {
          const snapshot = await getDocs(collection(db, collName));
          backup.collections[collName] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...processForExport(doc.data())
          }));
          totalDocs += snapshot.size;
        } catch (err) {
          console.error(`Error exporting collection ${collName}:`, err);
          throw new Error(t('backup.toasts.exportCollError', { collName, error: err instanceof Error ? err.message : String(err) }));
        }
      }

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
      link.href = url;
      link.download = `komora-backup-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast({ message: t('backup.toasts.exportSuccess', { docsCount: totalDocs, collsCount: COLLECTIONS.length }), type: 'success' });
    } catch (error) {
      console.error('Export error:', error);
      showToast({ 
        message: error instanceof Error ? error.message : t('backup.toasts.exportError'), 
        type: 'error' 
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.collections) {
          throw new Error('Invalid backup format');
        }
        setImportData(json);
        setShowConfirmModal(true);
      } catch (error) {
        showToast({ message: t('backup.toasts.invalidFile'), type: 'error' });
      }
    };
    reader.readAsText(file);
    // Reset input value so same file can be picked again
    e.target.value = '';
  };

  const handleRestore = async () => {
    if (!importData) return;

    setIsImporting(true);
    setShowConfirmModal(false);
    setProgress(0);

    try {
      const collections = importData.collections;
      const allEntries: { collName: string, docData: any }[] = [];

      Object.entries(collections).forEach(([collName, docs]: [string, any]) => {
        docs.forEach((docData: any) => {
          allEntries.push({ collName, docData });
        });
      });

      const totalOperations = allEntries.length;
      let completedOperations = 0;

      // Process in chunks of 500 (Firestore batch limit)
      const CHUNK_SIZE = 500;
      for (let i = 0; i < allEntries.length; i += CHUNK_SIZE) {
        const chunk = allEntries.slice(i, i + CHUNK_SIZE);
        const batch = writeBatch(db);

        chunk.forEach(({ collName, docData }) => {
          const { id, ...data } = docData;
          const docRef = doc(db, collName, id);
          batch.set(docRef, processForImport(data));
        });

        await batch.commit();
        completedOperations += chunk.length;
        setProgress(Math.round((completedOperations / totalOperations) * 100));
      }

      showToast({ message: t('backup.toasts.importSuccess'), type: 'success' });
    } catch (error) {
      console.error('Restore error:', error);
      showToast({ message: t('backup.toasts.importError'), type: 'error' });
    } finally {
      setIsImporting(false);
      setImportData(null);
    }
  };

  const totalImportDocs = importData ? (Object.values(importData.collections) as any[]).reduce((acc: number, docs: any[]) => acc + docs.length, 0) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-farm-green mb-2">{t('backup.title')}</h1>
        <p className="text-farm-wood/70">{t('backup.subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Export Card */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <Download className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-farm-green mb-4">{t('backup.export.title')}</h2>
          <p className="text-gray-500 mb-8 flex-1">
            {t('backup.export.description')}
          </p>
          <Button 
            className="w-full" 
            onClick={handleExport}
            disabled={isExporting || isImporting}
          >
            {isExporting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Download className="w-5 h-5 mr-2" />}
            {isExporting ? t('backup.export.processing') : t('backup.export.button')}
          </Button>
        </div>

        {/* Import Card */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
            <Upload className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-farm-green mb-4">{t('backup.import.title')}</h2>
          <p className="text-gray-500 mb-8 flex-1">
            {t('backup.import.description')}
          </p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="application/json" 
            className="hidden" 
          />
          <Button 
            variant="outline" 
            className="w-full border-2 border-farm-green text-farm-green hover:bg-farm-green hover:text-white"
            onClick={() => fileInputRef.current?.click()}
            disabled={isExporting || isImporting}
          >
            {isImporting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Upload className="w-5 h-5 mr-2" />}
            {isImporting ? `${t('backup.import.processing')} (${progress}%)` : t('backup.import.button')}
          </Button>
        </div>
      </div>

      {isImporting && (
        <div className="mt-8 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm animate-pulse">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-farm-green">{t('backup.import.progressLabel')}</span>
            <span className="text-farm-green font-black">{progress}%</span>
          </div>
          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-farm-green"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal 
        isOpen={showConfirmModal} 
        onClose={() => setShowConfirmModal(false)}
        title={t('backup.modal.title')}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <p className="text-lg text-gray-700 mb-6 font-medium">
            {t('backup.modal.warning', { docsCount: totalImportDocs })}
          </p>
          <div className="p-4 bg-gray-50 rounded-2xl mb-8 text-left text-sm text-gray-500">
            <p className="font-bold mb-2 uppercase tracking-widest text-[10px]">{t('backup.modal.objectsLabel')}</p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
              {importData && Object.entries(importData.collections).map(([name, docs]: [string, any]) => (
                docs.length > 0 && <li key={name}>• {name}: {docs.length}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => setShowConfirmModal(false)}
            >
              {t('backup.modal.cancel')}
            </Button>
            <Button 
              className="flex-1 bg-red-600 hover:bg-red-700 border-red-600" 
              onClick={handleRestore}
            >
              {t('backup.modal.confirm')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
