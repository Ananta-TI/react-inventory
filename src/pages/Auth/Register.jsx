import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import supabase from '../../supabaseClient';
import { ImSpinner2 } from 'react-icons/im';
import { BsFillExclamationDiamondFill } from 'react-icons/bs';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

const handleRegister = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  const { data, error: registerError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: { role: 'guest' }, // ⬅️ ini penting!
    },
  });

  if (registerError) {
    setError(registerError.message);
  } else {
    navigate('/guest/dashboard');
  }

  setLoading(false);
};


  return (
    <section className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white rounded-xl p-8 shadow-xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-orange-500 text-center mb-6">Register Account</h2>

        {error && (
          <div className="text-red-500 mb-4 text-sm bg-red-100 p-2 rounded flex items-center">
            <BsFillExclamationDiamondFill className="mr-2" />
            {error}
          </div>
        )}

        {loading && (
          <div className="text-blue-500 mb-4 text-sm bg-blue-100 p-2 rounded flex items-center">
            <ImSpinner2 className="mr-2 animate-spin" />
            Membuat akun...
          </div>
        )}

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full px-4 py-2 border rounded mb-4 text-gray-400 border-none bg-gray-50"
          required
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full px-4 py-2 border rounded mb-4 text-gray-400 border-none bg-gray-50"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-blue-500 hover:scale-105 text-white py-2 rounded transition"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </section>
  );
}
