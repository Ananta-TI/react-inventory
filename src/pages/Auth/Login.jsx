import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ImSpinner2 } from 'react-icons/im';
import { BsFillExclamationDiamondFill } from 'react-icons/bs';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import supabase from '../../supabaseClient';
export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // 1. Login dengan Supabase Auth
      const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (loginError) {
        setError(loginError.message);
        setLoading(false);
        return;
      }
      const { user } = authData;
      // 2. Ambil role terbaru dari database users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, aktif, nama')
        .eq('email', user.email)
        .single();
      if (userError) {
        console.error('Error fetching user data:', userError);
        setError('Gagal mengambil data pengguna');
        setLoading(false);
        return;
      }
      // 3. Periksa apakah user aktif
      if (!userData.aktif) {
        setError('Akun Anda tidak aktif. Silakan hubungi administrator.');
        await supabase.auth.signOut(); // Logout jika tidak aktif
        setLoading(false);
        return;
      }
      // 4. Sinkronisasi role di auth metadata dengan role di database
      const currentRole = user.user_metadata?.role;
      const dbRole = userData.role;
      if (currentRole !== dbRole) {
        // Update user metadata dengan role terbaru dari database
        const { error: updateError } = await supabase.auth.updateUser({
          data: { 
            role: dbRole,
            nama: userData.nama 
          }
        });
        if (updateError) {
          console.error('Error updating user metadata:', updateError);
          // Lanjutkan login meski gagal update metadata
        }
      }
      // 5. Redirect berdasarkan role yang benar dari database
      const finalRole = dbRole || currentRole;
      switch (finalRole) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'moderator':
          navigate('/moderator/dashboard');
          break;
        case 'guest':
          navigate('/guest/dashboard');
          break;
        default:
          setError('Role tidak dikenali: ' + finalRole);
          await supabase.auth.signOut();
          break;
      }
        } catch (error) {
      console.error('Login error:', error);
      setError('Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Login</h2>
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 flex items-center gap-2">
            <BsFillExclamationDiamondFill /> {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FaEnvelope className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
              className="w-full pl-10 pr-4 py-2  text-gray-500 rounded focus:outline-none bg-gray-100 border-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <FaLock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="w-full pl-10 pr-4 py-2  rounded text-gray-500 focus:outline-none focus:ring-2  bg-gray-100 border-none focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-blue-500 hover:bg-blue-700 text-white py-2 rounded flex justify-center items-center"
          >
            {loading ? (
              <>
                <ImSpinner2 className="animate-spin mr-2" /> Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
        <p className="mt-4 text-center text-black text-sm">
          Belum punya akun?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
