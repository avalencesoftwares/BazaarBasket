// packages/admin/src/pages/Settings.tsx
// Store Settings Page — persisted to Firestore, light theme

import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Store,
  Truck,
  Clock,
  Save,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Loader2,
  Megaphone,
  ImagePlus,
  X,
  Tag,
} from 'lucide-react';
import { getStoreSettings, updateStoreSettings, uploadBannerImage } from '../services/adminService';

export const Settings: React.FC = () => {
  const queryClient = useQueryClient();

  // Fetch settings from Firestore
  const { data: settings, isLoading } = useQuery({
    queryKey: ['storeSettings'],
    queryFn: getStoreSettings,
    staleTime: 5 * 60 * 1000,
  });

  // General Store Info
  const [storeName, setStoreName] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [storeAddress, setStoreAddress] = useState('');

  // Delivery Configurations
  const [minOrder, setMinOrder] = useState('');
  const [minOrderLimit, setMinOrderLimit] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [freeThreshold, setFreeThreshold] = useState('');

  // Banner Configurations
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerOffer, setBannerOffer] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [bannerImagePublicId, setBannerImagePublicId] = useState('');
  const [ribbonLabel, setRibbonLabel] = useState('');
  const [ribbonPercent, setRibbonPercent] = useState('');
  const [ribbonSubLabel, setRibbonSubLabel] = useState('');
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState('');

  // Delivery Slots
  const [slots, setSlots] = useState<any[]>([]);

  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Populate form when settings load
  useEffect(() => {
    if (settings) {
      setStoreName(settings.storeName);
      setStorePhone(settings.storePhone);
      setStoreEmail(settings.storeEmail);
      setStoreAddress(settings.storeAddress);
      setMinOrder(settings.minOrderAmount.toString());
      setMinOrderLimit((settings.minOrderLimit ?? 0).toString());
      setDeliveryFee(settings.deliveryFee.toString());
      setFreeThreshold(settings.freeDeliveryThreshold.toString());
      setBannerTitle(settings.bannerTitle);
      setBannerSubtitle(settings.bannerSubtitle);
      setBannerOffer(settings.bannerOffer);
      setBannerImageUrl(settings.bannerImageUrl || '');
      setBannerImagePublicId(settings.bannerImagePublicId || '');
      setRibbonLabel(settings.ribbonLabel || '');
      setRibbonPercent(settings.ribbonPercent || '');
      setRibbonSubLabel(settings.ribbonSubLabel || '');
      setBannerImagePreview(settings.bannerImageUrl || '');
      setSlots(settings.deliverySlots || []);
    }
  }, [settings]);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSection('general');
    try {
      await updateStoreSettings({ storeName, storePhone, storeEmail, storeAddress });
      queryClient.invalidateQueries({ queryKey: ['storeSettings'] });
      triggerToast('General store parameters updated successfully.');
    } catch (err) {
      triggerToast('Failed to save store details.');
    } finally {
      setSavingSection(null);
    }
  };

  const handleSaveDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSection('delivery');
    try {
      await updateStoreSettings({
        deliveryFee: parseFloat(deliveryFee) || 0,
        freeDeliveryThreshold: parseFloat(freeThreshold) || 0,
        minOrderAmount: parseFloat(minOrder) || 0,
        minOrderLimit: parseFloat(minOrderLimit) || 0,
      });
      queryClient.invalidateQueries({ queryKey: ['storeSettings'] });
      triggerToast('Delivery charges and thresholds updated successfully.');
    } catch (err) {
      triggerToast('Failed to save delivery config.');
    } finally {
      setSavingSection(null);
    }
  };

  const handleBannerImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setBannerImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveBannerImage = () => {
    setBannerImageFile(null);
    setBannerImagePreview('');
    setBannerImageUrl('');
    setBannerImagePublicId('');
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSection('banner');
    try {
      let finalImageUrl = bannerImageUrl;
      let finalImagePublicId = bannerImagePublicId;

      // Upload new image if selected
      if (bannerImageFile) {
        const result = await uploadBannerImage(bannerImageFile);
        finalImageUrl = result.url;
        finalImagePublicId = result.publicId;
      }

      // If image was removed
      if (!bannerImagePreview) {
        finalImageUrl = '';
        finalImagePublicId = '';
      }

      await updateStoreSettings({
        bannerTitle,
        bannerSubtitle,
        bannerOffer,
        bannerImageUrl: finalImageUrl,
        bannerImagePublicId: finalImagePublicId,
        ribbonLabel,
        ribbonPercent,
        ribbonSubLabel,
      });
      setBannerImageUrl(finalImageUrl);
      setBannerImagePublicId(finalImagePublicId);
      setBannerImageFile(null);
      queryClient.invalidateQueries({ queryKey: ['storeSettings'] });
      triggerToast('Banner content updated successfully.');
    } catch (err) {
      triggerToast('Failed to save banner content.');
    } finally {
      setSavingSection(null);
    }
  };

  const handleSaveSlots = async () => {
    setSavingSection('slots');
    try {
      await updateStoreSettings({ deliverySlots: slots });
      queryClient.invalidateQueries({ queryKey: ['storeSettings'] });
      triggerToast('Delivery time slots updated successfully.');
    } catch (err) {
      triggerToast('Failed to save delivery slots.');
    } finally {
      setSavingSection(null);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3000);
  };

  const toggleSlotActive = (id: string) => {
    setSlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, active: !slot.active } : slot))
    );
  };

  const deleteSlot = (id: string) => {
    if (confirm('Delete this delivery slot?')) {
      setSlots((prev) => prev.filter((slot) => slot.id !== id));
    }
  };

  const [newSlotLabel, setNewSlotLabel] = useState('');
  const [newSlotStart, setNewSlotStart] = useState('09:00');
  const [newSlotEnd, setNewSlotEnd] = useState('12:00');

  const addSlot = () => {
    if (!newSlotLabel) return;
    const newId = newSlotLabel.toLowerCase().replace(/\s+/g, '-');
    setSlots((prev) => [
      ...prev,
      {
        id: newId,
        label: newSlotLabel,
        startTime: newSlotStart,
        endTime: newSlotEnd,
        active: true,
      },
    ]);
    setNewSlotLabel('');
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure operations, delivery fees, slot availabilities, and shop details.
        </p>
      </div>

      {/* Floating Success Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white font-semibold px-6 py-4 rounded-xl shadow-2xl flex items-center gap-2 border border-emerald-400 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <Check className="w-5 h-5" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        
        {/* 1. General Settings Form */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
            <Store className="w-5 h-5 text-primary" />
            General Store Details
          </h2>
          <form onSubmit={handleSaveGeneral} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Store Name</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Store Phone</label>
                <input
                  type="text"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Support Email</label>
              <input
                type="email"
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
                className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Store Address</label>
              <textarea
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                rows={2}
                className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingSection === 'general'}
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2.5 rounded-xl text-sm flex items-center gap-1.5 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {savingSection === 'general' ? 'Saving...' : <><Save size={16} /> Save Store Details</>}
              </button>
            </div>
          </form>
        </div>

        {/* 2. Banner Configuration */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
            <Megaphone className="w-5 h-5 text-primary" />
            Mobile App Banner
          </h2>
          <form onSubmit={handleSaveBanner} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Banner Title</label>
                <input
                  type="text"
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="e.g. Fresh Groceries"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Banner Subtitle</label>
                <input
                  type="text"
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="e.g. Delivered in minutes"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Banner Offer Text</label>
              <input
                type="text"
                value={bannerOffer}
                onChange={(e) => setBannerOffer(e.target.value)}
                className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                placeholder="e.g. Free delivery on orders above ₹499"
              />
            </div>

            {/* Promotional Image Upload */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <ImagePlus size={14} /> Promotional Image
              </label>
              <div className="flex items-start gap-4">
                {bannerImagePreview ? (
                  <div className="relative group">
                    <img
                      src={bannerImagePreview}
                      alt="Banner preview"
                      className="w-32 h-32 object-cover rounded-xl border border-border shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveBannerImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : null}
                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                  <ImagePlus className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-[10px] text-muted-foreground font-medium">Upload Image</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleBannerImageSelect}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-[10px] text-muted-foreground">Recommended: 400×500px, JPG/PNG/WebP, max 5MB</p>
            </div>

            {/* Ribbon Tag Configuration */}
            <div className="space-y-3 border-t border-border pt-4">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Tag size={14} /> Ribbon Tag
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">Label</label>
                  <input
                    type="text"
                    value={ribbonLabel}
                    onChange={(e) => setRibbonLabel(e.target.value)}
                    className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    placeholder="e.g. DISCOUNT"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">Percentage</label>
                  <input
                    type="text"
                    value={ribbonPercent}
                    onChange={(e) => setRibbonPercent(e.target.value)}
                    className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    placeholder="e.g. 40%"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">Sub-Label</label>
                  <input
                    type="text"
                    value={ribbonSubLabel}
                    onChange={(e) => setRibbonSubLabel(e.target.value)}
                    className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    placeholder="e.g. ALL PRODUCT"
                  />
                </div>
              </div>
            </div>

            {/* Banner Preview */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-5 text-white">
              <p className="text-xs uppercase tracking-wider opacity-75 mb-1">Banner Preview</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold">{bannerTitle || 'Banner Title'}</p>
                  <p className="text-xl font-extrabold">{bannerOffer || 'Offer text'}</p>
                  <p className="text-sm opacity-85 mt-1">{bannerSubtitle || 'Banner Subtitle'}</p>
                  <span className="inline-block mt-2 bg-white/20 rounded-full px-3 py-1 text-xs font-semibold">
                    Get Now →
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {ribbonLabel && (
                    <div className="bg-white/90 rounded-lg px-2 py-2 text-center">
                      <p className="text-[8px] font-bold text-red-500 tracking-wide">{ribbonLabel}</p>
                      <p className="text-lg font-extrabold text-gray-800 leading-tight">{ribbonPercent || '0%'}</p>
                      <p className="text-[7px] font-semibold text-gray-600">Off</p>
                      <p className="text-[7px] font-bold text-red-500">{ribbonSubLabel}</p>
                    </div>
                  )}
                  {bannerImagePreview && (
                    <img src={bannerImagePreview} alt="Promo" className="w-16 h-20 object-cover rounded-lg opacity-80" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingSection === 'banner'}
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2.5 rounded-xl text-sm flex items-center gap-1.5 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {savingSection === 'banner' ? 'Saving...' : <><Save size={16} /> Save Banner</>}
              </button>
            </div>
          </form>
        </div>

        {/* 3. Order & Shipping Charges */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
            <Truck className="w-5 h-5 text-primary" />
            Order & Logistics Configuration
          </h2>
          <form onSubmit={handleSaveDelivery} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Minimum Order Limit (₹)</label>
                <input
                  type="number"
                  value={minOrderLimit}
                  onChange={(e) => setMinOrderLimit(e.target.value)}
                  className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Minimum Order for Delivery (₹)</label>
                <input
                  type="number"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Delivery Fee (₹)</label>
                <input
                  type="number"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Free Delivery Threshold (₹)</label>
                <input
                  type="number"
                  value={freeThreshold}
                  onChange={(e) => setFreeThreshold(e.target.value)}
                  className="w-full bg-gray-50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-xs text-blue-700 flex gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p>
                Orders below ₹{minOrderLimit || '0'} will be blocked from placement entirely. Orders below ₹{minOrder || '0'} will be blocked from Home Delivery (only Self Pickup allowed). Orders equal to or exceeding ₹{freeThreshold || '0'} will enjoy a waived delivery fee of ₹{deliveryFee || '0'}.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingSection === 'delivery'}
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2.5 rounded-xl text-sm flex items-center gap-1.5 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {savingSection === 'delivery' ? 'Saving...' : <><Save size={16} /> Save Charges</>}
              </button>
            </div>
          </form>
        </div>

        {/* 4. Delivery Slots */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
            <Clock className="w-5 h-5 text-primary" />
            Delivery Time Slots
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className={`p-4 border rounded-xl flex items-center justify-between transition-all ${
                    slot.active
                      ? 'bg-white border-border'
                      : 'bg-gray-50 border-gray-200 opacity-50'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-sm">{slot.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {slot.startTime} - {slot.endTime}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleSlotActive(slot.id)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${
                        slot.active
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-gray-100 text-gray-500 border-transparent'
                      }`}
                    >
                      {slot.active ? 'Active' : 'Disabled'}
                    </button>
                    <button
                      onClick={() => deleteSlot(slot.id)}
                      className="p-1 text-muted-foreground hover:text-destructive rounded-lg hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Slot Form */}
            <div className="p-4 border border-dashed border-border rounded-xl space-y-4">
              <p className="text-xs font-bold text-muted-foreground uppercase">Add Custom Slot</p>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Slot Label (e.g. Early Morning)"
                    value={newSlotLabel}
                    onChange={(e) => setNewSlotLabel(e.target.value)}
                    className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <input
                    type="time"
                    value={newSlotStart}
                    onChange={(e) => setNewSlotStart(e.target.value)}
                    className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <div>
                  <input
                    type="time"
                    value={newSlotEnd}
                    onChange={(e) => setNewSlotEnd(e.target.value)}
                    className="w-full bg-gray-50 border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={addSlot}
                disabled={!newSlotLabel}
                className="bg-gray-100 border border-border text-foreground hover:bg-primary hover:text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1 transition-all disabled:opacity-40"
              >
                <Plus size={14} /> Add Time Slot
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveSlots}
                disabled={savingSection === 'slots'}
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2.5 rounded-xl text-sm flex items-center gap-1.5 shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {savingSection === 'slots' ? 'Saving...' : <><Save size={16} /> Save Delivery Slots</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
