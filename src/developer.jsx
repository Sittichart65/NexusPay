import React from 'react';
import { Link } from 'react-router-dom';

const Developer = () => {
  const developers = [
    { name: "สิทธิชาติ แดงตนุ", id: "65041014", img: "/65041014.png" },
    { name: "ปฐมพร โตกล่ำ", id: "65072528", img: "/65072528.jpg" },
    { name: "นวรัตน์ พัชร์นันทพร", id: "65072713", img: "/65072713.jpg" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-100 via-indigo-100 to-purple-200 flex flex-col items-center py-10 px-6">
      <div className="w-full max-w-6xl space-y-8">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 text-transparent bg-clip-text">
            👩‍💻 นักพัฒนาระบบ
          </h1>
          <p className="mt-2 text-gray-600">ผู้พัฒนาโปรเจกต์ NexusPay</p>
        </div>

        {/* Developer Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {developers.map((dev, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center"
            >
              <img
                src={dev.img}
                alt={dev.name}
                className="w-40 h-40 object-cover rounded-full shadow-md mb-4 hover:scale-105 transition-transform duration-300"
              />
              <h2 className="text-lg font-semibold text-gray-700">{dev.id}</h2>
              <h2 className="text-xl font-bold text-indigo-600">{dev.name}</h2>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <div className="flex justify-center">
          <Link
            to="/"
            className="mt-8 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-lg font-semibold hover:scale-105 transition-all duration-300 shadow-md"
          >
            กลับหน้าหลัก
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Developer;
