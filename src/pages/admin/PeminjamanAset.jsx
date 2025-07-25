import { useEffect, useState } from "react";
import supabase from "../../supabaseClient";
import HeaderAdmin from "./HeaderAdmin.jsx";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

export default function PeminjamanAsetAdmin() {
  const [peminjaman, setPeminjaman] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState(""); // Tambahan untuk search
  const itemsPerPage = 6;

  const fetchPeminjaman = async () => {
    const { data, error } = await supabase
      .from("peminjaman")
      .select(`
        *,
        assets (
          nama,
          kategori: kategori_id (name)
        ),
        pengguna: id_pengguna (nama)
      `)
      .order("tanggal_pinjam", { ascending: false });

    if (error) console.error("Error fetching peminjaman:", error);
    else setPeminjaman(data);
  };

  const updateStatus = async (id, status) => {
    const updateData =
      status === "dikembalikan"
        ? { status, tanggal_kembali: new Date().toISOString() }
        : { status };

    const { error } = await supabase
      .from("peminjaman")
      .update(updateData)
      .eq("id", id);

    if (!error) fetchPeminjaman();
  };

  const formatTanggal = (tanggal) =>
    tanggal ? new Date(tanggal).toLocaleString() : "-";

  useEffect(() => {
    fetchPeminjaman();
  }, []);

  // Filter berdasarkan searchTerm
  const filteredData = peminjaman.filter((item) => {
    const aset = item.assets?.nama?.toLowerCase() || "";
    const kategori = item.assets?.kategori?.name?.toLowerCase() || "";
    const peminjam = item.pengguna?.nama?.toLowerCase() || "";
    const keyword = searchTerm.toLowerCase();
    return (
      aset.includes(keyword) ||
      kategori.includes(keyword) ||
      peminjam.includes(keyword)
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="relative overflow-x-auto shadow-md text-black sm:rounded-lg p-6 bg-white">
      <HeaderAdmin
        title="📦 Manajemen Peminjaman Aset"
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="px-6 py-3">Aset</th>
            <th className="px-6 py-3">Kategori</th>
            <th className="px-6 py-3">Peminjam</th>
            <th className="px-6 py-3">Jumlah</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Tanggal Pinjam</th>
            <th className="px-6 py-3">Tanggal Kembali</th>
            <th className="px-6 py-3">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center px-6 py-4 text-gray-500">
                Tidak ada data peminjaman.
              </td>
            </tr>
          ) : (
            paginatedData.map((item) => (
              <tr
                key={item.id}
                className="odd:bg-white even:bg-gray-50 border-b border-gray-200"
              >
                <td className="px-6 py-4 font-medium text-gray-900">
                  {item.assets?.nama || "-"}
                </td>
                <td className="px-6 py-4">
                  {item.assets?.kategori?.name || "Tidak diketahui"}
                </td>
                <td className="px-6 py-4">
                  {item.pengguna?.nama || "Tidak diketahui"}
                </td>
                <td className="px-6 py-4">{item.jumlah}</td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      item.status === "menunggu"
                        ? "bg-yellow-100 text-yellow-800"
                        : item.status === "disetujui"
                        ? "bg-blue-100 text-blue-800"
                        : item.status === "pengembalian"
                        ? "bg-purple-100 text-purple-800"
                        : item.status === "ditolak"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {formatTanggal(item.tanggal_pinjam)}
                </td>
                <td className="px-6 py-4">
                  {formatTanggal(item.tanggal_kembali)}
                </td>
                <td className="px-6 py-4 space-x-2">
                  {item.status === "menunggu" && (
                    <>
                      <button
                        onClick={() => updateStatus(item.id, "disetujui")}
                        className="text-green-600 bg-green-100 px-3 py-1 rounded-2xl hover:underline text-sm"
                      >
                        Setujui
                      </button>
                      <button
                        onClick={() => updateStatus(item.id, "ditolak")}
                        className="text-red-600 bg-red-100 px-3 py-1 rounded-2xl hover:underline text-sm"
                      >
                        Tolak
                      </button>
                    </>
                  )}
                  {(item.status === "disetujui" ||
                    item.status === "pengembalian") && (
                    <button
                      onClick={() => updateStatus(item.id, "dikembalikan")}
                      className="text-blue-600 bg-blue-100 px-3 py-1 rounded-2xl hover:underline text-sm"
                    >
                      {item.status === "pengembalian"
                        ? "Konfirmasi Pengembalian"
                        : "Tandai Dikembalikan"}
                    </button>
                  )}
                  {item.status === "dikembalikan" && (
                    <span className="text-blue-600 bg-blue-100 px-3 py-1 rounded-2xl text-sm font-medium">
                      Selesai
                    </span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination with MUI */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Stack spacing={2}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(event, value) => setCurrentPage(value)}
              variant="outlined"
              color="primary"
            />
          </Stack>
        </div>
      )}
    </div>
  );
}
