export default async function Home() {
  // Arka plandan (FastAPI) veriyi çekiyoruz
  const res = await fetch("http://localhost:8000", { cache: "no-store" });
  const data = await res.json();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-gray-900">
      <h1 className="text-4xl font-bold mb-4">P2P Kiralama Platformu</h1>
      <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <p className="text-xl text-green-600 font-semibold">
          {data.mesaj}
        </p>
      </div>
    </div>
  );
}