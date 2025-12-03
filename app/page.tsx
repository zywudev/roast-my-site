'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Upload, Link as LinkIcon, ArrowRight, Activity, SplitSquareHorizontal, Loader2 } from 'lucide-react';

type Mode = 'analyze' | 'compare';
type InputType = 'upload' | 'url';

export default function Home() {
  const [mode, setMode] = useState<Mode>('analyze');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  // Input States
  const [inputType1, setInputType1] = useState<InputType>('upload');
  const [file1, setFile1] = useState<File | null>(null);
  const [url1, setUrl1] = useState('');

  const [inputType2, setInputType2] = useState<InputType>('upload');
  const [file2, setFile2] = useState<File | null>(null);
  const [url2, setUrl2] = useState('');

  const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const getBase64FromUrl = async (url: string) => {
    const res = await fetch('/api/screenshot', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.image;
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setResult('');
    try {
      let image1Base64 = '';
      let image2Base64 = '';

      // Process Image 1
      if (inputType1 === 'upload' && file1) {
        image1Base64 = await toBase64(file1);
      } else if (inputType1 === 'url' && url1) {
        image1Base64 = await getBase64FromUrl(url1);
      } else {
        alert('请提供第一个设计图/链接');
        setLoading(false);
        return;
      }

      // Process Image 2 (if compare mode)
      if (mode === 'compare') {
        if (inputType2 === 'upload' && file2) {
          image2Base64 = await toBase64(file2);
        } else if (inputType2 === 'url' && url2) {
          image2Base64 = await getBase64FromUrl(url2);
        } else {
          alert('请提供第二个设计图/链接');
          setLoading(false);
          return;
        }
      }

      const res = await fetch('/api/roast', {
        method: 'POST',
        body: JSON.stringify({
          image: image1Base64,
          image2: mode === 'compare' ? image2Base64 : undefined,
          mode: mode
        }),
      });

      const data = await res.json();
      if (data.result) {
        setResult(data.result);
      }
    } catch (error) {
      console.error(error);
      alert('分析失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Header */}
        <header className="text-center mb-16 space-y-4">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            UI/UX 智能分析实验室
          </h1>
          <p className="text-gray-400 text-lg">
            深度风格分析 · 竞品对比 · 毒舌吐槽
          </p>
        </header>

        {/* Mode Switcher */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-900 p-1 rounded-xl border border-gray-800 flex shadow-xl">
            <button
              onClick={() => setMode('analyze')}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all ${mode === 'analyze'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
            >
              <Activity size={18} />
              风格分析
            </button>
            <button
              onClick={() => setMode('compare')}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all ${mode === 'compare'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
            >
              <SplitSquareHorizontal size={18} />
              竞品对比
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

          {/* Input 1 */}
          <InputSection
            title={mode === 'compare' ? "设计 A" : "目标网页"}
            inputType={inputType1}
            setInputType={setInputType1}
            file={file1}
            setFile={setFile1}
            url={url1}
            setUrl={setUrl1}
          />

          {/* Input 2 (Only for Compare Mode) */}
          {mode === 'compare' && (
            <InputSection
              title="设计 B"
              inputType={inputType2}
              setInputType={setInputType2}
              file={file2}
              setFile={setFile2}
              url={url2}
              setUrl={setUrl2}
            />
          )}

          {/* Action Button (Spans full width if analyze, or sits below inputs) */}
          <div className={`lg:col-span-${mode === 'compare' ? '2' : '1'} flex items-center justify-center`}>
            {mode === 'analyze' ? (
              <div className="hidden lg:flex h-full items-center justify-center text-gray-800">
                <ArrowRight size={48} className="opacity-20" />
              </div>
            ) : null}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`
                w-full lg:w-auto min-w-[200px] py-4 px-8 rounded-xl font-bold text-lg shadow-xl transition-all
                ${loading
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transform hover:scale-105'
                }
                ${mode === 'analyze' ? 'lg:hidden' : 'mt-8'}
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" /> 分析中...
                </span>
              ) : (
                '开始分析'
              )}
            </button>
          </div>
          {/* Desktop Analyze Button (Right side) */}
          {mode === 'analyze' && (
            <div className="hidden lg:flex items-center justify-center">
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className={`
                w-full max-w-xs py-6 px-8 rounded-2xl font-bold text-xl shadow-2xl transition-all
                ${loading
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transform hover:scale-105'
                  }
              `}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" /> 分析中...
                  </span>
                ) : (
                  '开始分析'
                )}
              </button>
            </div>
          )}

        </div>

        {/* Result Section */}
        {result && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-blue-400">
              <Activity className="text-blue-500" /> 分析报告
            </h2>
            <div className="prose prose-invert prose-lg max-w-none">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

interface InputSectionProps {
  title: string;
  inputType: InputType;
  setInputType: (type: InputType) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  url: string;
  setUrl: (url: string) => void;
}

function InputSection({ title, inputType, setInputType, file, setFile, url, setUrl }: InputSectionProps) {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 shadow-lg flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-200">{title}</h3>
        <div className="flex bg-gray-950 rounded-lg p-1 border border-gray-800">
          <button
            onClick={() => setInputType('upload')}
            className={`p-2 rounded-md transition-colors ${inputType === 'upload' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            title="Upload Image"
          >
            <Upload size={16} />
          </button>
          <button
            onClick={() => setInputType('url')}
            className={`p-2 rounded-md transition-colors ${inputType === 'url' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            title="Enter URL"
          >
            <LinkIcon size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {inputType === 'upload' ? (
          <div className="relative border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-blue-500/50 hover:bg-gray-800/50 transition-all group cursor-pointer h-64 flex flex-col items-center justify-center">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && setFile(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="bg-gray-800 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
              <Upload className="text-blue-400" size={32} />
            </div>
            {file ? (
              <p className="text-green-400 font-medium truncate max-w-[200px]">{file.name}</p>
            ) : (
              <>
                <p className="text-gray-300 font-medium mb-1">点击上传截图</p>
                <p className="text-gray-500 text-sm">支持 PNG, JPG</p>
              </>
            )}
          </div>
        ) : (
          <div className="h-64 flex flex-col justify-center">
            <label className="block text-sm font-medium text-gray-400 mb-2">网页链接</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <p className="text-gray-500 text-sm mt-3">
              我们将自动访问该链接并截取首屏进行分析。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}