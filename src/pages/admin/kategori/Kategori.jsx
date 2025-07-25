import { useEffect, useState } from "react";
import supabase from "../../../supabaseClient";
import { Link, useNavigate } from "react-router-dom";

export default function Kategori() {
  const [kategori, setKategori] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // ✅ Tambahan untuk search
  const navigate = useNavigate();

  const fetchKategori = async () => {
    const { data, error } = await supabase
      .from("kategori")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Gagal fetch kategori:", error);
    } else {
      setKategori(data);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Apakah kamu yakin ingin menghapus kategori ini?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("kategori")
      .delete()
      .eq("id_kategori", id);

    if (error) {
      console.error("Gagal menghapus:", error);
      alert("Gagal menghapus kategori: " + error.message);
    } else {
      fetchKategori(); // Refresh daftar
    }
  };

  useEffect(() => {
    fetchKategori();
  }, []);

  // ✅ Filter berdasarkan searchTerm
  const filteredKategori = kategori.filter((item) => {
    const nama = item.name?.toLowerCase() || "";
    const id = String(item.id_kategori).toLowerCase();
    const keyword = searchTerm.toLowerCase();
    return nama.includes(keyword) || id.includes(keyword);
  });

  return (
    <div className="min-h-screen p-6 bg-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">📂 Daftar Kategori Aset</h2>

        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="🔍 Cari kategori..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border text-black border-gray-300 rounded-md text-sm w-full md:w-64"
          />
          <Link
            to="/admin/kategori/add"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow"
          >
            + Tambah Kategori
          </Link>
        </div>
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">ID</th>
              <th scope="col" className="px-6 py-3">Nama Kategori</th>
              <th scope="col" className="px-6 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredKategori.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                  Tidak ada data yang cocok.
                </td>
              </tr>
            ) : (
              filteredKategori.map((item) => (
                <tr
                  key={item.id_kategori}
                  className="odd:bg-white even:bg-gray-50 border-b border-gray-200"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">{item.id_kategori}</td>
                  <td className="px-6 py-4">{item.name}</td>
                  <td className="px-6 py-4 space-x-3">
                    <Link
                      to={`/admin/kategori/edit/${item.id_kategori}`}
                      className="text-yellow-600 bg-yellow-100 px-3 py-1 rounded-2xl hover:underline text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id_kategori)}
                      className="text-red-600 hover:underline bg-red-100 px-3 py-1 rounded-2xl text-sm"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
