'use client';

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [roast, setRoast] = useState('');

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  // 把图片转成 Base64 格式，这样才能发给 API
  const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  // 点击“开始吐槽”
  const handleRoast = async () => {
    if (!file) return alert('先上传张截图啊！');

    setLoading(true);
    setRoast('');

    try {
      const base64Image = await toBase64(file);

      const res = await fetch('/api/roast', {
        method: 'POST',
        body: JSON.stringify({ image: base64Image }),
      });

      const data = await res.json();
      if (data.roast) {
        setRoast(data.roast);
      }
    } catch (error) {
      alert('出错了，可能是图片太大了，换张小的试试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">🔥 AI 网页毒舌吐槽助手</h1>

      <div className="w-full max-w-md space-y-4">
        {/* 上传区域 */}
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          {file ? (
            <p className="text-green-400">已选择: {file.name}</p>
          ) : (
            <p className="text-gray-400">点击上传你的网页截图 (支持 .png .jpg)</p>
          )}
        </div>

        {/* 按钮 */}
        <button
          onClick={handleRoast}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'AI 正在酝酿毒舌语录...' : '开始吐槽'}
        </button>

        {/* 结果显示 */}
        {roast && (
          <div className="mt-8 p-6 bg-gray-800 rounded-xl border border-gray-700">
            <h3 className="text-xl font-bold mb-2 text-yellow-400">吐槽结果：</h3>
            <p className="leading-relaxed">{roast}</p>
          </div>
        )}
      </div>
    </div>
  );
}