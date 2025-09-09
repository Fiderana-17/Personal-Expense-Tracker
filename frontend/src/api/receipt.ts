const API_URL = import.meta.env.VITE_API_URL;

export const uploadReceipt = async (file: File, expenseId: number) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("expenseId", String(expenseId));

  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/receipts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Upload failed");
  }
  return await res.json();
};

export const getAllReceipts = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/receipts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch receipts");
  return res.json();
};

export const downloadReceipt = async (id: string) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/receipts/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to download receipt");
  return await res.blob();
};

export const deleteReceipt = async (id: string) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/receipts/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to delete receipt");
  return res.json();
};
