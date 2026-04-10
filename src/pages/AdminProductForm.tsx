import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase, hasSupabaseConfig } from '../supabase';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Loader2, ArrowLeft, Plus, Trash2, Upload, Image as ImageIcon, Tag, DollarSign, FileText, GripVertical, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import SEO from '../components/SEO';

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
              images: data.images && data.images.length > 0 ? data.images.map((url: string) => ({ url })) : [{ url: '' }],
              specifications: data.specifications && (Array.isArray(data.specifications) ? data.specifications.length > 0 : Object.keys(data.specifications).length > 0)
                ? (Array.isArray(data.specifications)
                    ? data.specifications.map((s: { key: string; value: string }) => ({ key: s.key, value: s.value }))
                    : Object.entries(data.specifications).map(([key, value]) => ({ key, value: value as string })))
                : [{ key: '', value: '' }]
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

        // Upload to Supabase Storage
        const { error } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            cacheControl: '31536000',
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
        specifications: data.specifications
          .filter(curr => curr.key.trim() && curr.value.trim())
          .map(curr => ({ key: curr.key.trim(), value: curr.value.trim() })),
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
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-stone-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <SEO title="Admin Product Form | BOLEN Mirror" noindex={true} />
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/admin')} 
                className="p-2 -ml-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold text-stone-900 tracking-tight">
                {id ? t('admin.productForm.editProduct') : t('admin.productForm.addProduct')}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button 
                type="button" 
                onClick={() => navigate('/admin')} 
                className="px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-xl shadow-sm hover:bg-stone-50 transition-colors"
              >
                {t('admin.productForm.cancel')}
              </button>
              <button 
                onClick={handleSubmit(onSubmit)}
                disabled={saving || uploading} 
                className="inline-flex items-center justify-center px-5 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {t('admin.productForm.saveProduct')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!hasSupabaseConfig && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600 shrink-0">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">{t('admin.productForm.supabaseSetupTitle')}</h4>
              <p className="mt-1 text-sm text-amber-800 leading-relaxed">
                {t('admin.productForm.supabaseSetupDesc')}
              </p>
            </div>
          </div>
        )}
        
        <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-8">
          {/* Main Column */}
          <div className="flex-1 space-y-8">
            {/* Basic Info */}
            <div className="bg-white shadow-sm border border-stone-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/50">
                <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-stone-400" />
                  Basic Information
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">{t('admin.productForm.productTitle')}</label>
                  <input 
                    type="text" 
                    {...register('title', { required: t('admin.productForm.errors.titleRequired') })} 
                    className="block w-full rounded-xl border-stone-200 py-2.5 px-4 text-stone-900 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-stone-50 transition-colors" 
                    placeholder="e.g. Premium LED Vanity Mirror"
                  />
                  {errors.title && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">{t('admin.productForm.shortDesc')}</label>
                  <textarea 
                    rows={3} 
                    {...register('description', { required: t('admin.productForm.errors.descRequired') })} 
                    className="block w-full rounded-xl border-stone-200 py-2.5 px-4 text-stone-900 focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-stone-50 transition-colors resize-none" 
                    placeholder="A brief description of the product for catalog views..."
                  />
                  {errors.description && <p className="mt-1.5 text-sm text-red-600 font-medium">{errors.description.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">{t('admin.productForm.longDetails')}</label>
                  <div className="border border-stone-200 rounded-xl overflow-hidden">
                    <Controller
                      name="details"
                      control={control}
                      render={({ field }) => (
                        <div data-color-mode="light">
                          <MDEditor
                            value={field.value || ''}
                            onChange={field.onChange}
                            preview="edit"
                            height={400}
                            className="w-full !border-0"
                            textareaProps={{
                              placeholder: "Detailed product description, features, and installation guide..."
                            }}
                          />
                        </div>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white shadow-sm border border-stone-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
                <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                  <Settings className="h-4 w-4 text-stone-400" />
                  {t('admin.productForm.specifications')}
                </h3>
                <button 
                  type="button" 
                  onClick={() => appendSpec({ key: '', value: '' })} 
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Row
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {specFields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-3 group">
                      <div className="pt-2.5 text-stone-300 cursor-grab active:cursor-grabbing">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input 
                          type="text" 
                          {...register(`specifications.${index}.key` as const)} 
                          placeholder="e.g. Dimensions" 
                          className="col-span-1 block w-full rounded-xl border-stone-200 py-2 px-3 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-stone-50" 
                        />
                        <input 
                          type="text" 
                          {...register(`specifications.${index}.value` as const)} 
                          placeholder="e.g. 24'' x 36''" 
                          className="col-span-1 sm:col-span-2 block w-full rounded-xl border-stone-200 py-2 px-3 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-stone-50" 
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeSpec(index)} 
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Remove specification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {specFields.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-stone-200 rounded-xl">
                      <p className="text-sm text-stone-500">No specifications added yet.</p>
                      <button 
                        type="button" 
                        onClick={() => appendSpec({ key: '', value: '' })} 
                        className="mt-2 text-sm font-medium text-stone-900 hover:underline"
                      >
                        Add your first specification
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="w-full lg:w-80 flex flex-col gap-8">
            
            {/* Organization */}
            <div className="bg-white shadow-sm border border-stone-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/50">
                <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-stone-400" />
                  Organization
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">{t('admin.productForm.category')}</label>
                  <select 
                    {...register('category')} 
                    className="block w-full rounded-xl border-stone-200 py-2.5 px-4 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-stone-50"
                  >
                    <option value="">{t('products.allCategories')}</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{t(`products.categories.${cat}`, cat)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white shadow-sm border border-stone-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/50">
                <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-stone-400" />
                  Pricing
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">{t('admin.productForm.priceRange')}</label>
                  <input 
                    type="text" 
                    {...register('price_range')} 
                    placeholder="e.g. $20 - $40" 
                    className="block w-full rounded-xl border-stone-200 py-2.5 px-4 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-stone-50" 
                  />
                  <p className="mt-1.5 text-xs text-stone-500">Shown to B2B customers</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">{t('admin.productForm.msrp')}</label>
                  <input 
                    type="text" 
                    {...register('msrp')} 
                    placeholder="e.g. $59.99" 
                    className="block w-full rounded-xl border-stone-200 py-2.5 px-4 text-sm focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-stone-50" 
                  />
                  <p className="mt-1.5 text-xs text-stone-500">Manufacturer's Suggested Retail Price</p>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white shadow-sm border border-stone-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
                <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-stone-400" />
                  {t('admin.productForm.images')}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                
                {/* Upload Zone */}
                <div 
                  className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:bg-stone-50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  <div className="mx-auto h-12 w-12 text-stone-400 bg-stone-100 rounded-full flex items-center justify-center mb-3">
                    {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                  </div>
                  <p className="text-sm font-medium text-stone-900">
                    {uploading ? t('admin.productForm.uploading') : 'Click to upload images'}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
                </div>

                {/* Image List */}
                <div className="space-y-3">
                  {imageFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-3 bg-stone-50 p-2 rounded-xl border border-stone-200 group">
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-stone-200 shrink-0 border border-stone-300">
                        {control._formValues.images?.[index]?.url ? (
                          <img src={control._formValues.images[index].url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-stone-400">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                        {index === 0 && (
                          <div className="absolute inset-x-0 bottom-0 bg-stone-900/80 text-white text-[9px] font-bold text-center py-0.5">
                            MAIN
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <input 
                          type="text" 
                          {...register(`images.${index}.url` as const, { required: t('admin.productForm.errors.urlRequired') })} 
                          placeholder="Image URL" 
                          className="block w-full rounded-lg border-stone-200 py-1.5 px-2 text-xs focus:border-stone-900 focus:ring-1 focus:ring-stone-900 bg-white" 
                        />
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        {index !== 0 && (
                          <button 
                            type="button" 
                            onClick={() => moveImage(index, 0)} 
                            className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-200 rounded-md transition-colors"
                            title="Set as main image"
                          >
                            <ArrowLeft className="h-3.5 w-3.5 rotate-90" />
                          </button>
                        )}
                        <button 
                          type="button" 
                          onClick={() => removeImage(index)} 
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Remove image"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    type="button" 
                    onClick={() => appendImage({ url: '' })} 
                    className="w-full py-2 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
                  >
                    + Add image from URL
                  </button>
                </div>

              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
