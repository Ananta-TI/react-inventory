import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../../../supabaseClient";
import toast, { Toaster } from "react-hot-toast";

export default function ListBarang() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ✅ Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Jumlah item per halaman

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("assets")
      .select("*, kategori: kategori_id(name)");
    if (error) {
      toast.error("Gagal memuat data!");
    } else {
      setItems(data);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    setLoading(true);
    const { error } = await supabase.from("assets").delete().eq("id", selectedItem.id);

    if (error) {
      toast.error("Gagal menghapus aset!");
    } else {
      toast.success("Aset berhasil dihapus!");
      setItems((prev) => prev.filter((item) => item.id !== selectedItem.id));
    }
    setLoading(false);
    setShowModal(false);
    setSelectedItem(null);
  };

  // ✅ Filter Items
  const filteredItems = items.filter((item) => {
    const keyword = searchTerm.toLowerCase();
    return (
      item.nama?.toLowerCase().includes(keyword) ||
      item.kategori?.name?.toLowerCase().includes(keyword) ||
      String(item.jumlah).toLowerCase().includes(keyword)
    );
  });

  // ✅ Pagination Logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handlePageClick = (page) => setCurrentPage(page);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">📦 Daftar Aset</h1>

        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="🔍 Cari aset..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 text-black rounded-md text-sm w-full md:w-64 focus:ring focus:ring-blue-400"
          />
          <Link
            to="/admin/assets/add"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow transition"
          >
            + Tambah Aset
          </Link>
        </div>
      </div>

      {/* Loading */}
      {loading && <div className="text-center py-4 text-gray-600">⏳ Memuat data...</div>}

      {/* Tabel Data */}
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-white">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs text-gray-800 uppercase bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3">Gambar</th>
              <th className="px-6 py-3">Nama</th>
              <th className="px-6 py-3">Kategori</th>
              <th className="px-6 py-3">Jumlah</th>
              <th className="px-6 py-3">Keterangan</th>
              <th className="px-6 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 && !loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Tidak ada data yang cocok.
                </td>
              </tr>
            ) : (
              currentItems.map((item) => (
                <tr key={item.id} className="odd:bg-white even:bg-gray-50 border-b border-gray-200">
                  <td className="px-6 py-4">
                    {item.gambar ? (
                      <img
                        src={item.gambar}
                        alt={item.nama}
                        className="w-16 h-16 object-cover rounded shadow-sm border"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs italic">Tidak ada</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{item.nama}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {item.kategori?.name || "Tidak diketahui"}
                    </span>
                  </td>
                  <td className="px-6 py-4">{item.jumlah}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {item.keterangan || <i className="text-gray-400">-</i>}
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <Link
                      to={`/admin/assets/edit/${item.id}`}
                      className="text-blue-600 bg-blue-300 py-1 px-4 hover:underline rounded-full font-bold text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowModal(true);
                      }}
                      className="text-red-600 bg-red-200 py-1 px-2 rounded-full hover:underline font-bold text-sm"
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

      {/* ✅ Pagination */}
      {filteredItems.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-600">
            Halaman {currentPage} dari {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-500 rounded hover:bg-gray-300 hover:text-black  disabled:opacity-50"
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageClick(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 hover:bg-gray-300 text-black"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-500 rounded hover:bg-gray-300 hover:text-black disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Konfirmasi Hapus</h2>
            <p className="text-gray-600 mb-4">
              Apakah Anda yakin ingin menghapus aset{" "}
              <span className="font-semibold">{selectedItem?.nama}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded  hover:bg-gray-300"
              >
                Batal
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                {loading ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
