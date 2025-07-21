import React, { useState, useEffect } from 'react';

interface IpfsViewerProps {
  cid: string;
   onJsonLoaded?: (json: any) => void;
}

export const IpfsViewer: React.FC<IpfsViewerProps> = ({ cid }) => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cid) return;

    const fetchData = async () => {
      try {
        const url = `https://ipfs.io/ipfs/${cid}`;
        const res = await fetch(url);
        const contentType = res.headers.get('content-type');

        if (!res.ok) throw new Error('Không tải được dữ liệu');

        if (contentType?.includes('application/json')) {
          const json = await res.json();
          setData({ type: 'json', value: json });
        } else if (contentType?.includes('image')) {
          setData({ type: 'image', value: url });
        } else if (contentType?.includes('application/pdf')) {
          setData({ type: 'pdf', value: url });
        } else if (contentType?.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
          setData({ type: 'docx', value: url });
        } else {
          const text = await res.text();
          setData({ type: 'text', value: text });
        }
      } catch (err) {
        setError('❌ Không thể tải CID từ IPFS.');
      }
    };

    fetchData();
  }, [cid]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!data) return <p>Đang tải dữ liệu từ IPFS...</p>;

  if (data.type === 'image') return <img src={data.value} alt="IPFS File" className="max-w-full" />;
  if (data.type === 'text') return <pre className="bg-gray-100 p-3 rounded">{data.value}</pre>;
  if (data.type === 'json') return <pre className="bg-gray-100 p-3 rounded">{JSON.stringify(data.value, null, 2)}</pre>;

  if (data.type === 'pdf') {
    return (
      <div className="space-y-2">
        <p className="text-sm text-gray-700">Đây là file PDF</p>
        <div className="flex space-x-3">
          <a
            href={data.value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 font-semibold underline"
          >
            Xem trong tab mới
          </a>
          <iframe
            src={data.value}
            width="100%"
            height="600px"
            className="border rounded"
            title="PDF Viewer"
          ></iframe>
        </div>
      </div>
    );
  }

  if (data.type === 'docx') {
    return (
      <div className="space-y-2">
        <p className="text-sm text-gray-700">Đây là file .docx</p>
        <div className="flex space-x-3">
          <a
            href={data.value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 font-semibold underline"
          >
            Xem trong tab mới
          </a>
          <a
            href={`https://docs.google.com/gview?url=${encodeURIComponent(data.value)}&embedded=true`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 font-semibold underline"
          >
            Xem bằng Google Docs
          </a>
        </div>
      </div>
    );
  }

  return <p className="text-gray-500">Không thể hiển thị định dạng file này.</p>;
};
