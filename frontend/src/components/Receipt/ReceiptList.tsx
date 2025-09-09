import React, { useEffect, useState } from "react";
import { Eye, Download, Trash2, Search } from "lucide-react";
import {
  getAllReceipts,
  downloadReceipt,
  deleteReceipt,
} from "../../api/receipt";
import { type Receipt } from "../../types";

const ReceiptList: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const data = await getAllReceipts();
      setReceipts(data);
    } catch (error) {
      console.error("Erreur lors du chargement des reçus", error);
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (id: number) => {
    try {
      const blob = await downloadReceipt(String(id));
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Erreur lors de l’ouverture du reçu", error);
    }
  };

  const handleDownload = async (id: number, fileName?: string) => {
    try {
      const blob = await downloadReceipt(String(id));
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || `receipt-${id}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors du téléchargement du reçu", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this receipt?")) return;

    try {
      const res = await deleteReceipt(String(id));
      setMessage(res.message || "Receipt deleted successfully!");
      fetchReceipts();
    } catch (error) {
      console.error("Erreur lors de la suppression du reçu", error);
    }
  };

  const filteredReceipts = receipts.filter((r) =>
    r.filePath.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-5 bg-white shadow-md h-full m-0">
      <h2 className="text-3xl font-bold mb-4">Receipts</h2>

      {message && (
        <p className="mb-3 text-green-600 font-medium">{message}</p>
      )}

      <div className="bg-page rounded-xl shadow-md border duration-500 border-border p-6 my-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search receipts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 text-title pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Chargement des reçus...</p>
      ) : filteredReceipts.length === 0 ? (
        <p className="text-gray-500 text-xl text-center">No receipt found</p>
      ) : (
        <ul className="space-y-4">
          {filteredReceipts.map((receipt) => (
            <li
              key={receipt.id}
              className="flex items-center justify-between p-3 border-b-2 hover:bg-gray-50"
            >
              <div>
                <p className="font-medium">{receipt.filePath.split("/").pop()}</p>
                <p className="text-sm text-gray-500">
                  {new Date(receipt.uploadedAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500 my-1">
                  Expense #{receipt.expenseId}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleView(receipt.id)}
                  className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() =>
                    handleDownload(receipt.id, receipt.filePath.split("/").pop())
                  }
                  className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={() => handleDelete(receipt.id)}
                  className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReceiptList;
