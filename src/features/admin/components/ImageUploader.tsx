import { useState, useCallback } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useUploadImage } from '../hooks/useAdminHooks';
import { Upload, X, Loader2, GripVertical } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  folder?: string;
  maxFiles?: number;
  single?: boolean;
}

function SortableItem({ url, onRemove, id }: { url: string; onRemove: () => void; id: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100"
    >
      <img src={url || undefined} className="w-full h-full object-cover" alt="" />
      
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-xl transition-colors cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="p-2 bg-farm-berry text-white rounded-xl hover:scale-110 transition-transform"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export function ImageUploader({ images, onChange, folder = 'products', maxFiles = 10, single = false }: ImageUploaderProps) {
  const { uploadImage, uploading } = useUploadImage();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const urls: string[] = [];
    for (const file of files) {
      if (single || images.length + urls.length < maxFiles) {
        const url = await uploadImage(file, folder);
        urls.push(url);
      }
    }

    if (single) {
      onChange([urls[0]]);
    } else {
      onChange([...images, ...urls]);
    }
  }, [images, onChange, single, folder, maxFiles, uploadImage]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = images.indexOf(active.id as string);
      const newIndex = images.indexOf(over.id as string);
      onChange(arrayMove(images, oldIndex, newIndex));
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {single && images.length > 0 ? (
        <div className="relative aspect-video rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 group">
          <img src={images[0] || undefined} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={() => removeImage(0)}
              className="px-6 py-2 bg-farm-berry text-white rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <X className="w-4 h-4" /> Видалити
            </button>
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <SortableContext 
              items={images}
              strategy={verticalListSortingStrategy}
            >
              {images.map((url, i) => (
                <SortableItem 
                  key={url} 
                  id={url}
                  url={url} 
                  onRemove={() => removeImage(i)} 
                />
              ))}
            </SortableContext>
            
            {(single ? images.length === 0 : images.length < maxFiles) && (
              <label className={cn(
                "aspect-square rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-farm-green/30 hover:bg-farm-green/5 transition-all group",
                uploading && "pointer-events-none opacity-50"
              )}>
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-farm-green animate-spin" />
                ) : (
                  <>
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-center px-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Завантажити</p>
                      <p className="text-[8px] text-gray-300">PNG, JPG до 5MB</p>
                    </div>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple={!single}
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
            )}
          </div>
        </DndContext>
      )}
    </div>
  );
}
