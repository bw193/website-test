import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { Loader2, Save, Image as ImageIcon, Upload, Plus, Trash2, Settings as SettingsIcon, LayoutTemplate, Tags } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AdminSettings() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [heroBgs, setHeroBgs] = useState<string[]>(['']);
  const [categories, setCategories] = useState<string[]>([
    "New Arrival",
    "Hot Sale",
    "Led Lighted Mirror",
    "Bathroom Mirror without led",
    "Full Length Dressing Mirror",
    "Irregular Mirror"
  ]);
  const [error, setError] = useState<string | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['hero_bg', 'categories']);

      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST205') { // relation does not exist or not in schema cache
          setNeedsSetup(true);
        } else if (error.code !== 'PGRST116') { // not found is okay
          throw error;
        }
      } else if (data) {
        const heroBgData = data.find(d => d.key === 'hero_bg');
        if (heroBgData && heroBgData.value) {
          try {
            const parsed = JSON.parse(heroBgData.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setHeroBgs(parsed);
            } else if (typeof heroBgData.value === 'string' && heroBgData.value.length > 0 && !heroBgData.value.startsWith('[')) {
              setHeroBgs([heroBgData.value]);
            }
          } catch (e) {
            if (typeof heroBgData.value === 'string' && heroBgData.value.length > 0) {
              setHeroBgs([heroBgData.value]);
            }
          }
        }

        const categoriesData = data.find(d => d.key === 'categories');
        if (categoriesData && categoriesData.value) {
          try {
            const parsed = JSON.parse(categoriesData.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCategories(parsed);
            }
          } catch (e) {
            console.error("Error parsing categories", e);
          }
        }
      }
    } catch (err: any) {
      console.error("Error fetching settings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const validBgs = heroBgs.filter(bg => bg.trim() !== '');
      const validCategories = categories.filter(cat => cat.trim() !== '');
      
      const { error } = await supabase
        .from('site_settings')
        .upsert([
          { key: 'hero_bg', value: JSON.stringify(validBgs) },
          { key: 'categories', value: JSON.stringify(validCategories) }
        ]);

      if (error) throw error;
      alert(t('admin.dashboard.settings.saveSuccess'));
    } catch (err: any) {
      console.error("Error saving settings:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `site-assets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '31536000',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      const newBgs = [...heroBgs];
      newBgs[index] = publicUrl;
      setHeroBgs(newBgs);
    } catch (err: any) {
      console.error("Error uploading image:", err);
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddBg = () => {
    setHeroBgs([...heroBgs, '']);
  };

  const handleRemoveBg = (index: number) => {
    const newBgs = [...heroBgs];
    newBgs.splice(index, 1);
    if (newBgs.length === 0) {
      newBgs.push('');
    }
    setHeroBgs(newBgs);
  };

  const handleBgChange = (index: number, value: string) => {
    const newBgs = [...heroBgs];
    newBgs[index] = value;
    setHeroBgs(newBgs);
  };

  const handleAddCategory = () => {
    setCategories([...categories, '']);
  };

  const handleRemoveCategory = (index: number) => {
    const newCats = [...categories];
    newCats.splice(index, 1);
    if (newCats.length === 0) {
      newCats.push('');
    }
    setCategories(newCats);
  };

  const handleCategoryChange = (index: number, value: string) => {
    const newCats = [...categories];
    newCats[index] = value;
    setCategories(newCats);
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-stone-400" /></div>;
  }

  if (needsSetup) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 text-red-600 rounded-lg">
            <SettingsIcon className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-red-900">{t('admin.dashboard.settings.setupRequired')}</h3>
        </div>
        <p className="text-stone-600 mb-6 leading-relaxed">{t('admin.dashboard.settings.setupDesc')}</p>
        <pre className="bg-stone-900 text-stone-100 p-6 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed">
{`CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist to avoid errors on re-run
DROP POLICY IF EXISTS "Allow public read access" ON site_settings;
DROP POLICY IF EXISTS "Allow admin write access" ON site_settings;

CREATE POLICY "Allow public read access" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Allow admin write access" ON site_settings FOR ALL USING (auth.role() = 'authenticated');

-- Force schema cache reload to fix PGRST205 errors
NOTIFY pgrst, 'reload schema';`}
        </pre>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-6 py-2.5 bg-stone-900 text-white rounded-xl hover:bg-stone-800 font-medium transition-colors"
        >
          {t('admin.dashboard.settings.setupBtn')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Hero Backgrounds */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
          <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-stone-400" />
            {t('admin.dashboard.settings.heroBgLabel')}
          </h3>
          <button
            type="button"
            onClick={handleAddBg}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            {t('admin.dashboard.settings.addImage')}
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-stone-500 mb-6">
            {t('admin.dashboard.settings.heroBgHelp')}
          </p>
          
          <div className="space-y-4">
            {heroBgs.map((bg, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex-1 w-full">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ImageIcon className="h-4 w-4 text-stone-400" />
                    </div>
                    <input
                      type="text"
                      value={bg}
                      onChange={(e) => handleBgChange(index, e.target.value)}
                      placeholder={t('admin.dashboard.settings.heroBgPlaceholder')}
                      className="block w-full pl-10 rounded-xl border-stone-200 py-2 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-white"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id={`file-upload-${index}`}
                    onChange={(e) => handleImageUpload(e, index)}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById(`file-upload-${index}`)?.click()}
                    disabled={uploading}
                    className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 border border-stone-200 rounded-xl shadow-sm text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 transition-colors disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2 text-stone-400" />}
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveBg(index)}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={t('admin.dashboard.settings.removeImage')}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {heroBgs.some(bg => bg.trim() !== '') && (
            <div className="mt-8 pt-6 border-t border-stone-100">
              <p className="text-sm font-semibold text-stone-900 mb-4">{t('admin.dashboard.settings.preview')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {heroBgs.filter(bg => bg.trim() !== '').map((bg, index) => (
                  <div key={index} className="aspect-video w-full rounded-xl overflow-hidden border border-stone-200 bg-stone-100 relative group">
                    <img src={bg} alt={`Hero Background Preview ${index + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors"></div>
                    <div className="absolute top-2 left-2 bg-stone-900/80 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm">
                      Slide {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
          <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
            <Tags className="h-5 w-5 text-stone-400" />
            Product Categories
          </h3>
          <button
            type="button"
            onClick={handleAddCategory}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Category
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-stone-500 mb-6">
            Manage product categories shown in the catalog and product form.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, index) => (
              <div key={index} className="flex items-center gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200">
                <input
                  type="text"
                  value={cat}
                  onChange={(e) => handleCategoryChange(index, e.target.value)}
                  placeholder="Category Name"
                  className="block w-full rounded-lg border-transparent py-1.5 px-3 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-white shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(index)}
                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                  title="Remove Category"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {saving ? t('admin.dashboard.settings.saving') : t('admin.dashboard.settings.save')}
        </button>
      </div>
    </div>
  );
}
