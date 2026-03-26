import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase, hasSupabaseConfig } from '../supabase';
import { useForm, useFieldArray } from 'react-hook-form';
import { Loader2, ArrowLeft, Plus, Trash2, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ProductForm {
  title: string;
  description: string;
  details: string;
  category: string;
  price_range: string;
  msrp: string;
  images: { url: string }[];
  specifications: { key: string; value: string }[];
}

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<string[]>([
    "New Arrival",
    "Hot Sale",
    "Led Lighted Mirror",
    "Bathroom Mirror without led",
    "Full Length Dressing Mirror",
    "Irregular Mirror"
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, control, handleSubmit, reset, getValues, setValue, formState: { errors } } = useForm<ProductForm>({
    defaultValues: {
      images: [{ url: '' }],
      specifications: [{ key: '', value: '' }]
    }
  });

  const { fields: imageFields, append: appendImage, remove: removeImage, move: moveImage } = useFieldArray({
    control,
    name: "images"
  });

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control,
    name: "specifications"
  });

  const normalizeCategory = (cat: string | undefined | null) => {
    if (!cat) return '';
    return cat.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  useEffect(() => {
    const fetchData = async () => {
      let fetchedCategories = categories;
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'categories')
          .single();

        if (!error && data && data.value) {
          try {
            const parsed = JSON.parse(data.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCategories(parsed);
              fetchedCategories = parsed;
            }
          } catch (e) {
            console.error("Error parsing categories", e);
          }
        }
      } catch (error) {
        console.error("Error fetching categories", error);
      }

      if (id) {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;

          if (data) {
            // Try to match the existing category with the loaded categories
            let matchedCategory = data.category || '';
            if (matchedCategory) {
              const normalized = normalizeCategory(matchedCategory);
              const found = fetchedCategories.find(c => normalizeCategory(c) === normalized);
              if (found) {
                matchedCategory = found;
              }
            }

            reset({
              title: data.title || '',
              description: data.description || '',
              details: data.details || '',
              category: matchedCategory,
              price_range: data.price_range || '',
              msrp: data.msrp || '',
              images: data.images ? data.images.map((url: string) => ({ url })) : [{ url: '' }],
              specifications: data.specifications ? Object.entries(data.specifications).map(([key, value]) => ({ key, value: value as string })) : [{ key: '', value: '' }]
            });
          }
        } catch (error) {
          console.error("Error fetching product", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, reset]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasSupabaseConfig) {
      alert(t('admin.productForm.alerts.supabaseNotConfigured'));
      return;
    }
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        console.log(`Uploading ${file.name} to ${filePath}...`);

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Supabase upload error:', error);
          throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        
        console.log('Upload successful, public URL:', publicUrl);

        const currentImages = getValues('images') || [];
        const emptyIndex = currentImages.findIndex((img: any) => !img.url || !img.url.trim());
        
        if (emptyIndex !== -1) {
          // Replace the first empty field
          setValue(`images.${emptyIndex}.url`, publicUrl);
        } else {
          // Append a new field
          appendImage({ url: publicUrl });
        }
      }
    } catch (error: any) {
      console.error('Error uploading images to Supabase:', error);
      let message = error.message || 'Unknown error';
      if (message.includes('Bucket not found')) {
        message = t('admin.productForm.alerts.bucketNotFound');
      }
      alert(t('admin.productForm.alerts.uploadFailed', { message }));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onSubmit = async (data: ProductForm) => {
    setSaving(true);
    try {
      const productData = {
        title: data.title,
        description: data.description,
        details: data.details,
        category: data.category,
        price_range: data.price_range,
        msrp: data.msrp,
        images: data.images.map(img => img.url).filter(url => url.trim() !== ''),
        specifications: data.specifications.reduce((acc, curr) => {
          if (curr.key.trim() && curr.value.trim()) {
            acc[curr.key] = curr.value;
          }
          return acc;
        }, {} as Record<string, string>),
        updated_at: new Date().toISOString()
      };

      if (id) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert({
            ...productData,
            created_at: new Date().toISOString()
          });
        if (error) throw error;
      }
      navigate('/admin');
    } catch (error) {
      console.error("Error saving product", error);
      alert(t('admin.productForm.alerts.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 text-amber-500 animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => navigate('/admin')} className="flex items-center text-sm text-stone-500 hover:text-stone-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> {t('admin.productForm.backToDashboard')}
      </button>

      {!hasSupabaseConfig && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
          <h4 className="text-sm font-medium text-amber-800">{t('admin.productForm.supabaseSetupTitle')}</h4>
          <p className="mt-1 text-sm text-amber-700">
            {t('admin.productForm.supabaseSetupDesc')}
          </p>
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-stone-200">
          <h3 className="text-lg leading-6 font-medium text-stone-900">
            {id ? t('admin.productForm.editProduct') : t('admin.productForm.addProduct')}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="px-4 py-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label className="block text-sm font-medium text-stone-700">{t('admin.productForm.productTitle')}</label>
              <input type="text" {...register('title', { required: t('admin.productForm.errors.titleRequired') })} className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm" />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-stone-700">{t('admin.productForm.category')}</label>
              <select {...register('category')} className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm">
                <option value="">{t('products.allCategories')}</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{t(`products.categories.${cat}`, cat)}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-stone-700">{t('admin.productForm.priceRange')}</label>
              <input type="text" {...register('price_range')} placeholder="$20 - $40" className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-stone-700">{t('admin.productForm.msrp')}</label>
              <input type="text" {...register('msrp')} placeholder="$59.99" className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm" />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-stone-700">{t('admin.productForm.shortDesc')}</label>
              <textarea rows={2} {...register('description', { required: t('admin.productForm.errors.descRequired') })} className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm" />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-stone-700">{t('admin.productForm.longDetails')}</label>
              <textarea rows={6} {...register('details')} className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm" />
            </div>
          </div>

          <div className="pt-6 border-t border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-stone-900">{t('admin.productForm.images')}</h4>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={uploading}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
                  {uploading ? t('admin.productForm.uploading') : t('admin.productForm.uploadImages')}
                </button>
                <button type="button" onClick={() => appendImage({ url: '' })} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200">
                  <Plus className="h-4 w-4 mr-1" /> {t('admin.productForm.addUrl')}
                </button>
              </div>
            </div>
            {imageFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2 mb-2">
                <input type="text" {...register(`images.${index}.url` as const, { required: t('admin.productForm.errors.urlRequired') })} placeholder="https://..." className="flex-1 border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm" />
                {control._formValues.images?.[index]?.url && (
                  <img src={control._formValues.images[index].url} alt="" className="h-10 w-10 object-cover rounded border border-stone-200" />
                )}
                {index === 0 ? (
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded font-medium whitespace-nowrap">Main</span>
                ) : (
                  <button type="button" onClick={() => moveImage(index, 0)} className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs rounded whitespace-nowrap">Set Main</button>
                )}
                <button type="button" onClick={() => removeImage(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-stone-900">{t('admin.productForm.specifications')}</h4>
              <button type="button" onClick={() => appendSpec({ key: '', value: '' })} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200">
                <Plus className="h-4 w-4 mr-1" /> {t('admin.productForm.addSpec')}
              </button>
            </div>
            {specFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2 mb-2">
                <input type="text" {...register(`specifications.${index}.key` as const)} placeholder={t('admin.productForm.placeholders.specKey')} className="w-1/3 border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm" />
                <input type="text" {...register(`specifications.${index}.value` as const)} placeholder={t('admin.productForm.placeholders.specValue')} className="flex-1 border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm" />
                <button type="button" onClick={() => removeSpec(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-stone-200 flex justify-end">
            <button type="button" onClick={() => navigate('/admin')} className="bg-white py-2 px-4 border border-stone-300 rounded-md shadow-sm text-sm font-medium text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 mr-3">
              {t('admin.productForm.cancel')}
            </button>
            <button type="submit" disabled={saving || uploading} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : t('admin.productForm.saveProduct')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
