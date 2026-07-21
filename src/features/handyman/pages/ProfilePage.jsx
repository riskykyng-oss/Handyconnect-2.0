import React, { useState, useEffect, useRef } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getUserProfile, updateUserProfile } from '@/services/userService';
import { uploadFile } from '@/services/storageService';
import { Loader2, Save, User, Camera, Star } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState({ displayName: '', bio: '', skills: '', hourlyRate: '', photoURL: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUser) {
        const data = await getUserProfile(currentUser.uid);
        if (data) {
          setProfile({
            displayName: data.displayName || '',
            bio: data.bio || '',
            skills: data.skills || '',
            hourlyRate: data.hourlyRate || '',
            photoURL: data.photoURL || ''
          });
        }
        setLoading(false);
      }
    };
    fetchProfile();
  }, [currentUser]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadFile(file);
      setProfile({ ...profile, photoURL: url });
      await updateUserProfile(currentUser.uid, { photoURL: url });
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile(currentUser.uid, profile);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-[#F97316]" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto font-sans text-gray-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.02em; }
      `}</style>

      <div className="mb-8">
        <h1 className="font-display font-extrabold text-3xl tracking-tight">My Profile</h1>
        <p className="text-gray-500 mt-1">Update your details so clients know more about you.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Profile Header (Dark Slate) */}
        <div className="bg-slate-900 p-6 flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border-4 border-slate-800">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-slate-400" />
              )}
            </div>
            <button 
              type="button"
              onClick={() => fileInputRef.current.click()} 
              className="absolute bottom-0 right-0 w-8 h-8 bg-[#F97316] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-orange-600 transition-colors border-2 border-slate-900"
            >
              {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
              accept="image/*"
            />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white">{profile.displayName || 'New Handyman'}</h2>
            <p className="text-slate-400 text-sm">{currentUser?.email}</p>
            <div className="flex items-center gap-1 mt-2 text-amber-400 text-sm">
              <Star size={14} className="fill-amber-400" /> 0.0
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <input 
              type="text" 
              value={profile.displayName}
              onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
              placeholder="e.g., John Doe"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#F97316] focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
            <textarea 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#F97316] focus:border-transparent outline-none transition-all resize-none"
              rows="4"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell clients about your experience and work ethic..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Skills (comma separated)</label>
              <input 
                type="text" 
                value={profile.skills}
                onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
                placeholder="e.g., Plumbing, Electrical"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#F97316] focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hourly Rate ($)</label>
              <input 
                type="number" 
                value={profile.hourlyRate}
                onChange={(e) => setProfile({ ...profile, hourlyRate: e.target.value })}
                placeholder="e.g., 25"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#F97316] focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={saving} className="px-8 py-3 rounded-xl bg-[#F97316] hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 flex items-center gap-2">
              {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}