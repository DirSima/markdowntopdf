import { useState, useRef } from 'react';
import { FileUp, FileText, Loader2, Download, CheckCircle2, RefreshCcw } from 'lucide-react';

function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.md')) {
      setError('Please upload a valid .md (Markdown) file.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setResultUrl(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // In development, the backend runs on port 8000. Use appropriate base URL.
      const baseUrl = 'http://127.0.0.1:8000';
      const response = await fetch(`${baseUrl}/api/convert`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Conversion failed. Please try again.');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      setResultUrl(downloadUrl);

      // Trigger automatic download
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = file.name.replace(/\.md$/, '.pdf');
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-retro-beige p-4 md:p-8 font-sans flex items-center justify-center">
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">

        {/* Header Block */}
        <div className="col-span-1 md:col-span-2 bg-retro-burgundy p-8 text-retro-beige flex flex-col justify-between rounded-none shadow-lg transform transition hover:-translate-y-1">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Markdown to PDF<br />Converter</h1>
            <p className="text-xl opacity-90">Seamlessly transform your markdown documents into beautiful PDFs.</p>
          </div>
          <div className="flex gap-4">
            <span className="w-12 h-2 bg-retro-beige opacity-50 block"></span>
            <span className="w-4 h-2 bg-retro-beige opacity-50 block"></span>
          </div>
        </div>

        {/* Feature Block */}
        <div className="bg-retro-orange p-8 text-retro-dark flex flex-col items-center justify-center rounded-none shadow-lg transform transition hover:-translate-y-1">
          <FileText size={64} strokeWidth={1.5} className="mb-4 text-retro-dark opacity-80" />
          <h2 className="text-2xl font-bold uppercase tracking-widest text-center">Fast & Reliable</h2>
        </div>

        {/* Upload Block (The Main Workhorse) */}
        <div
          className={`col-span-1 md:col-span-2 lg:col-span-2 row-span-2 relative border-4 border-dashed transition-all duration-300 rounded-none shadow-lg flex flex-col items-center justify-center p-8 text-center cursor-pointer overflow-hidden group
            ${isDragging ? 'border-retro-burgundy bg-retro-beige/80' : 'border-retro-brown/20 bg-retro-beige hover:border-retro-orange hover:bg-white/50'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".md"
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center animate-pulse">
              <Loader2 size={80} className="text-retro-burgundy animate-spin mb-6" />
              <h3 className="text-3xl font-bold text-retro-dark mb-2">Converting...</h3>
              <p className="text-retro-brown">Heating up the press</p>
            </div>
          ) : resultUrl ? (
            <div className="flex flex-col items-center">
              <div className="bg-green-100 text-green-800 p-4 rounded-full mb-6 relative">
                <CheckCircle2 size={64} className="animate-bounce" />
              </div>
              <h3 className="text-3xl font-bold text-retro-dark mb-4">PDF Ready!</h3>
              <p className="text-retro-brown mb-6 font-medium">Your download should start automatically.</p>
              <button
                onClick={(e) => { e.stopPropagation(); setResultUrl(null); }}
                className="flex items-center gap-2 px-6 py-3 bg-retro-brown text-retro-beige rounded-sm hover:bg-retro-dark transition-colors font-bold uppercase tracking-wider"
              >
                <RefreshCcw size={20} /> Convert Another
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center opacity-80 group-hover:opacity-100 transition-opacity">
              <div className="w-24 h-24 mb-6 rounded-full bg-retro-orange flex items-center justify-center text-retro-beige shadow-inner transform group-hover:scale-110 transition-transform duration-300">
                <FileUp size={48} />
              </div>
              <h3 className="text-3xl font-bold text-retro-dark mb-2">Drag & Drop</h3>
              <p className="text-xl text-retro-brown">your .md file here</p>
              <div className="mt-8 px-6 py-2 border-2 border-retro-brown text-retro-brown font-bold uppercase tracking-widest text-sm hover:bg-retro-brown hover:text-retro-beige transition-colors">
                Or Browse
              </div>
            </div>
          )}

          {error && (
            <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white p-3 font-medium flex justify-between items-center animate-in slide-in-from-bottom-full">
              <span>{error}</span>
              <button onClick={(e) => { e.stopPropagation(); setError(null); }} className="text-white hover:text-red-200 uppercase font-bold text-sm tracking-wider">Dismiss</button>
            </div>
          )}
        </div>

        {/* Small Decorative Block */}
        <div className="bg-retro-dark bg-opacity-95 p-8 text-retro-beige flex items-end justify-start rounded-none shadow-lg transform transition hover:-translate-y-1">
          <Download size={48} strokeWidth={1} className="opacity-50" />
        </div>

        {/* Info Block */}
        <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-retro-brown p-8 text-retro-beige rounded-none shadow-lg transform transition hover:-translate-y-1">
          <h3 className="text-xl font-bold uppercase tracking-widest mb-4 opacity-90 border-b-2 border-retro-beige border-opacity-20 pb-2">Privacy First</h3>
          <p className="opacity-80 leading-relaxed font-medium">Files are processed in memory and never stored permanently on our servers. Your data stays yours.</p>
        </div>

      </div>
    </div>
  );
}

export default App;
