import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import { format } from 'date-fns';
import { FileText, MessageSquare, CheckCircle } from 'lucide-react';

const InProgress = () => {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Actually implementing local search for simplicity after fetch, or fetch all if not paginated on server for search.
  // We'll just fetch normally and filter locally for this scope.
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
      const res = await axios.get(`/projects?status=In Progress&category=billing&page=${page}&limit=100`);
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

  const markComplete = async (id) => {
    try {
      await axios.put(`/projects/${id}/status`, { status: 'Completed' });
      toast.success('Project marked as completed');
      fetchProjects();
    } catch (error) {
      console.error(error);
      toast.error('Error updating project');
    }
  };

  const generateInvoice = async (project) => {
    if (project.invoiceUrl) {
      sendWhatsApp(project);
      return;
    }

    try {
      toast.loading('Generating invoice...', { id: 'invoice' });
      const res = await axios.post(`/projects/${project._id}/invoice`);
      toast.success('Invoice generated!', { id: 'invoice' });
      
      const updatedProject = { ...project, ...res.data };
      sendWhatsApp(updatedProject);
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error generating invoice', { id: 'invoice' });
    }
  };

  const sendWhatsApp = (project) => {
    if (!project.invoiceUrl) {
      toast.error('Please generate invoice first');
      return;
    }
    const encodedMessage = encodeURIComponent(
      `GnanaStack Technologies\n\nInvoice No: ${project.invoiceNo}\nTotal: ₹${project.price}\n\nDownload Invoice:\n${project.invoiceUrl}`
    );
    const waLink = `https://wa.me/${project.customerPhone}?text=${encodedMessage}`;
    window.open(waLink, '_blank');
  };

  const columns = [
    { header: 'Date', accessor: 'createdAt', render: (row) => format(new Date(row.createdAt), 'dd MMM yyyy') },
    { header: 'Project', accessor: 'projectName', render: (row) => <span className="font-medium">{row.projectName}</span> },
    { header: 'Customer', accessor: 'customerName', render: (row) => (
      <div>
        <div>{row.customerName}</div>
        <div className="text-xs text-gray-500">{row.customerPhone}</div>
      </div>
    )},
    { header: 'Price', accessor: 'price', render: (row) => `₹${row.price}` },
    { header: 'Invoice', accessor: 'invoiceNo', render: (row) => row.invoiceNo || <span className="text-gray-400 italic">Not generated</span> },
    { header: 'Actions', render: (row) => (
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => markComplete(row._id)}
          className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-colors"
          title="Mark Completed"
        >
          <CheckCircle size={18} />
        </button>
        <button 
          onClick={() => generateInvoice(row)}
          className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
          title={row.invoiceUrl ? "Send WhatsApp" : "Generate Invoice"}
        >
          {row.invoiceUrl ? <MessageSquare size={18} className="text-[#25D366]" /> : <FileText size={18} />}
        </button>
      </div>
    )}
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">
          <span className="text-gradient pr-2">In Progress</span> Projects
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

export default InProgress;
