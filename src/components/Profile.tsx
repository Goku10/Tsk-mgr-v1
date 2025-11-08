import { useState, useEffect, useRef } from 'react';
import { User, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';

function Profile() {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border-2 border-cyan-400/30 rounded-2xl p-6 shadow-2xl shadow-cyan-500/20">
      <h2 className="text-2xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">
        Profile
      </h2>

      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-32 h-32 rounded-full overflow-hidden bg-slate-800/50 border-2 border-cyan-400/30 flex items-center justify-center">
          {profilePicture ? (
            <img
              src={profilePicture}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-16 h-16 text-cyan-400/50" />
          )}
        </div>

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

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full group relative px-4 py-3 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border-2 border-cyan-400/50 rounded-lg text-cyan-300 font-semibold text-sm tracking-wide hover:border-cyan-300 hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          <span className="relative z-10">
            {uploading ? 'Uploading...' : 'Upload Profile Picture'}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/40 group-hover:to-blue-500/40 rounded-lg transition-all duration-300"></div>
        </button>
      </div>
    </div>
  );
}

export default Profile;
