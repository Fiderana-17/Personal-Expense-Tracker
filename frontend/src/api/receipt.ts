const API_URL = import.meta.env.VITE_API_URL;

export const uploadReceipt = async (file: File, expenseId: number) => {
  const formData = new FormData();
  formData.append("receipt", file);
  formData.append("expenseId", String(expenseId));

  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/receipts/upload`, {
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

export const downloadReceipt = async (id: string) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/receipts/${id}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to download receipt");
  return await res.blob();
};

export const viewReceipt = async (id: string) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/receipts/${id}/view`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to view receipt");
  const blob = await res.blob();
  return URL.createObjectURL(blob);
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
