import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { supabase, hasSupabaseConfig } from '../supabase';
import { useForm, useFieldArray } from 'react-hook-form';
import { Loader2, ArrowLeft, Plus, Trash2, Upload } from 'lucide-react';

interface ProductForm {
  title: string;
  description: string;
  details: string;
  category: string;
  images: { url: string }[];
  specifications: { key: string; value: string }[];
}

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, control, handleSubmit, reset, getValues, setValue, formState: { errors } } = useForm<ProductForm>({
    defaultValues: {
      images: [{ url: '' }],
      specifications: [{ key: '', value: '' }]
    }
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control,
    name: "images"
  });

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    control,
    name: "specifications"
  });

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const docSnap = await getDoc(doc(db, 'products', id));
          if (docSnap.exists()) {
            const data = docSnap.data();
            reset({
              title: data.title || '',
              description: data.description || '',
              details: data.details || '',
              category: data.category || '',
              images: data.images ? data.images.map((url: string) => ({ url })) : [{ url: '' }],
              specifications: data.specifications ? Object.entries(data.specifications).map(([key, value]) => ({ key, value: value as string })) : [{ key: '', value: '' }]
            });
          }
        } catch (error) {
          console.error("Error fetching product", error);
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, reset]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasSupabaseConfig) {
      alert('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to AI Studio Secrets.');
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
        message = 'Storage bucket "product-images" not found. Please create it in your Supabase dashboard and set it to Public.';
      }
      alert(`Failed to upload images: ${message}`);
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
        images: data.images.map(img => img.url).filter(url => url.trim() !== ''),
        specifications: data.specifications.reduce((acc, curr) => {
          if (curr.key.trim() && curr.value.trim()) {
            acc[curr.key] = curr.value;
          }
          return acc;
        }, {} as Record<string, string>),
        updatedAt: serverTimestamp()
      };

      if (id) {
        await updateDoc(doc(db, 'products', id), productData);
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: serverTimestamp()
        });
      }
      navigate('/admin');
    } catch (error) {
      console.error("Error saving product", error);
      alert("Failed to save product. Check console for details.");
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
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
      </button>

      {!hasSupabaseConfig && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
          <h4 className="text-sm font-medium text-amber-800">Supabase Setup Required</h4>
          <p className="mt-1 text-sm text-amber-700">
            To enable image uploads, please add <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong> to your AI Studio Secrets.
          </p>
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-stone-200">
          <h3 className="text-lg leading-6 font-medium text-stone-900">
            {id ? 'Edit Product' : 'Add New Product'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="px-4 py-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label className="block text-sm font-medium text-stone-700">Product Title</label>
              <input type="text" {...register('title', { required: 'Title is required' })} className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm" />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-stone-700">Category</label>
              <input type="text" {...register('category')} className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm" />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-stone-700">Short Description</label>
              <textarea rows={2} {...register('description', { required: 'Description is required' })} className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm" />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-stone-700">Long Details (Rich Text / HTML allowed)</label>
              <textarea rows={6} {...register('details')} className="mt-1 block w-full border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm" />
            </div>
          </div>

          <div className="pt-6 border-t border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-stone-900">Images</h4>
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
                  {uploading ? 'Uploading...' : 'Upload Images'}
                </button>
                <button type="button" onClick={() => appendImage({ url: '' })} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200">
                  <Plus className="h-4 w-4 mr-1" /> Add URL
                </button>
              </div>
            </div>
            {imageFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2 mb-2">
                <input type="text" {...register(`images.${index}.url` as const, { required: 'URL is required' })} placeholder="https://..." className="flex-1 border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm" />
                {control._formValues.images?.[index]?.url && (
                  <img src={control._formValues.images[index].url} alt="" className="h-10 w-10 object-cover rounded border border-stone-200" />
                )}
                <button type="button" onClick={() => removeImage(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-stone-900">Specifications</h4>
              <button type="button" onClick={() => appendSpec({ key: '', value: '' })} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200">
                <Plus className="h-4 w-4 mr-1" /> Add Spec
              </button>
            </div>
            {specFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2 mb-2">
                <input type="text" {...register(`specifications.${index}.key` as const)} placeholder="e.g., Dimensions" className="w-1/3 border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm" />
                <input type="text" {...register(`specifications.${index}.value` as const)} placeholder="e.g., 24x36 inches" className="flex-1 border border-stone-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm" />
                <button type="button" onClick={() => removeSpec(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-stone-200 flex justify-end">
            <button type="button" onClick={() => navigate('/admin')} className="bg-white py-2 px-4 border border-stone-300 rounded-md shadow-sm text-sm font-medium text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 mr-3">
              Cancel
            </button>
            <button type="submit" disabled={saving || uploading} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
