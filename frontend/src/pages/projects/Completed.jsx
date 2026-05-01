import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import { format } from 'date-fns';
import { FileText, MessageSquare } from 'lucide-react';

const Completed = () => {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [allData, setAllData] = useState([]);

  const filteredProjects = useMemo(() => {
    if (!searchTerm) return allData;
    const lower = searchTerm.toLowerCase();
    return allData.filter(p => 
      p.projectName.toLowerCase().includes(lower) || 
      p.customerName.toLowerCase().includes(lower) ||
      (p.invoiceNo && p.invoiceNo.toLowerCase().includes(lower))
    );
  }, [searchTerm, allData]);

  const fetchProjects = useCallback(async () => {
    Promise.resolve().then(() => setLoading(true));
    try {
      const res = await axios.get(`/projects?status=Completed&category=billing&page=${page}&limit=100`);
      setAllData(res.data.projects);
      setPages(res.data.pages);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    // eslint-disable-next-line
    fetchProjects();
  }, [fetchProjects]);

  const sendWhatsApp = (project) => {
    if (!project.invoiceUrl) {
      toast.error('No invoice available');
      return;
    }
    const encodedMessage = encodeURIComponent(
      `GnanaStack Technologies\n\nInvoice No: ${project.invoiceNo}\nTotal: ₹${project.price}\n\nDownload Invoice:\n${project.invoiceUrl}`
    );
    const waLink = `https://wa.me/${project.customerPhone}?text=${encodedMessage}`;
    window.open(waLink, '_blank');
  };

  const columns = [
    { header: 'Date', accessor: 'updatedAt', render: (row) => format(new Date(row.updatedAt), 'dd MMM yyyy') },
    { header: 'Project', accessor: 'projectName', render: (row) => <span className="font-medium">{row.projectName}</span> },
    { header: 'Customer', accessor: 'customerName', render: (row) => (
      <div>
        <div>{row.customerName}</div>
        <div className="text-xs text-gray-500">{row.customerPhone}</div>
      </div>
    )},
    { header: 'Price', accessor: 'price', render: (row) => `₹${row.price}` },
    { header: 'Invoice', accessor: 'invoiceNo', render: (row) => (
      row.invoiceUrl ? 
      <a href={row.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center">
        <FileText size={14} className="mr-1" /> {row.invoiceNo}
      </a>
      : <span className="text-gray-400 italic">Not generated</span>
    )},
    { header: 'WhatsApp', render: (row) => (
      <button 
        onClick={() => sendWhatsApp(row)}
        disabled={!row.invoiceUrl}
        className="p-1.5 text-[#25D366] hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Send WhatsApp"
      >
        <MessageSquare size={18} />
      </button>
    )}
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">
          <span className="text-gradient pr-2">Completed</span> Projects
        </h1>
      </div>
      
      <div className="shadow-soft rounded-xl">
        <DataTable 
          columns={columns}
        data={filteredProjects}
        loading={loading}
        page={page}
        pages={pages}
        onPageChange={setPage}
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
      />
      </div>
    </div>
  );
};

export default Completed;
