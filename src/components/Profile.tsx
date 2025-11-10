import { useState, useEffect, useRef } from 'react';
import { User, Camera, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

function Profile() {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserEmail(user.email || '');

      const { data, error } = await supabase
        .from('profiles')
        .select('profile_picture_url')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data?.profile_picture_url) {
        setProfilePicture(data.profile_picture_url);
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err.message);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          profile_picture_url: publicUrl,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (upsertError) throw upsertError;

      setProfilePicture(publicUrl);
      setShowMenu(false);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePicture = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: null, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfilePicture(null);
      setShowMenu(false);
    } catch (err: any) {
      setError(err.message || 'Failed to remove picture');
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border-2 border-cyan-400/30 rounded-2xl p-6 shadow-2xl shadow-cyan-500/20">
      <h2 className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">
        Profile
      </h2>

      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            disabled={uploading}
            className="relative w-32 h-32 rounded-full overflow-hidden bg-slate-800/50 border-2 border-cyan-400/30 flex items-center justify-center hover:border-cyan-400 transition-all duration-300 group cursor-pointer disabled:cursor-not-allowed"
          >
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-16 h-16 text-cyan-400/50" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </button>

          {showMenu && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-slate-800/95 backdrop-blur-xl border-2 border-cyan-400/30 rounded-lg shadow-2xl z-10 min-w-[180px]">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full px-4 py-3 text-left text-cyan-300 hover:bg-cyan-500/20 transition-colors duration-200 flex items-center gap-2 border-b border-cyan-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="w-4 h-4" />
                <span className="text-sm font-medium">{uploading ? 'Uploading...' : profilePicture ? 'Change Picture' : 'Upload Picture'}</span>
              </button>
              {profilePicture && (
                <button
                  onClick={handleRemovePicture}
                  className="w-full px-4 py-3 text-left text-red-300 hover:bg-red-500/20 transition-colors duration-200 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  <span className="text-sm font-medium">Remove Picture</span>
                </button>
              )}
            </div>
          )}
        </div>

        {userEmail && (
          <div className="text-center">
            <p className="text-cyan-300 text-sm font-medium">{userEmail}</p>
          </div>
        )}

        {error && (
          <div className="w-full bg-red-500/20 border border-red-500/50 rounded-lg p-2">
            <p className="text-red-200 text-xs text-center">{error}</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}

export default Profile;
