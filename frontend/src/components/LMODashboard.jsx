import React, { useState } from 'react';

export default function LMODashboard() {
    const [showUrgentOnly, setShowUrgentOnly] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAppId, setCurrentAppId] = useState(null);
    const [selectedOfficer, setSelectedOfficer] = useState('');

    const fieldOfficers = [
        { id: "FO-101", name: "Ramesh Kumar", zone: "District A", load: 4 },
        { id: "FO-102", name: "Sunita Sharma", zone: "District B", load: 2 }
    ];

    const [applications, setApplications] = useState([
        { id: "APP-9021", name: "Reliance Fresh", location: "District A", instrument: "Electronic Scale", priority: "Normal", status: "Pending", assignedOfficer: null },
        { id: "APP-9022", name: "Indian Oil Petrol Pump", location: "District B", instrument: "Fuel Dispenser", priority: "High", status: "Under Review", assignedOfficer: null },
        { id: "APP-9023", name: "Tata Steel Plant", location: "District C", instrument: "Weighbridge", priority: "High", status: "Pending", assignedOfficer: null }
    ]);

    const handleAction = (action, id) => {
        if (action === 'approve') alert(`Application ${id} Approved.`);
        if (action === 'reject') {
            const reason = prompt("Enter reason for rejection:");
            if (reason) alert(`Application ${id} Rejected.`);
        }
    };

    const confirmAssignment = () => {
        if (!selectedOfficer) return alert("Select an officer.");
        setApplications(apps => apps.map(app => 
            app.id === currentAppId ? { ...app, assignedOfficer: selectedOfficer, status: "Assigned" } : app
        ));
        setIsModalOpen(false);
    };

    const filteredApps = applications.filter(app => {
        const matchesSearch = app.id.toLowerCase().includes(searchTerm.toLowerCase()) || app.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
        const matchesUrgent = showUrgentOnly ? app.priority === 'High' : true;
        return matchesSearch && matchesStatus && matchesUrgent;
    }).sort((a, b) => !showUrgentOnly ? (b.priority === 'High') - (a.priority === 'High') : 0);

    return (
        <div className="bg-gray-50 font-sans text-gray-800 min-h-screen p-6">
            <header className="mb-6 flex justify-between items-center bg-white p-4 shadow-sm rounded-lg border border-gray-100">
                <h2 className="text-xl font-semibold">LMO Verification Dashboard</h2>
                <div className="text-sm font-bold text-gray-800">Officer LMO-7482</div>
            </header>

            {/* Controls */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 justify-between">
                <div className="flex gap-4">
                    <input 
                        type="text" 
                        placeholder="Search ID or Name..." 
                        className="pl-3 pr-4 py-2 text-sm border rounded focus:outline-none focus:border-blue-500"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select className="text-sm border rounded px-3 py-2" onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Assigned">Assigned</option>
                    </select>
                </div>
                <button 
                    onClick={() => setShowUrgentOnly(!showUrgentOnly)} 
                    className={`text-sm px-4 py-2 rounded font-semibold transition border ${showUrgentOnly ? 'bg-red-600 text-white border-red-700' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    Priority Queue
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                    <thead>
                        <tr className="bg-slate-50 text-slate-600 uppercase tracking-wider border-b">
                            <th className="p-4 font-semibold">App ID</th>
                            <th className="p-4 font-semibold">Applicant</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredApps.map(app => (
                            <tr key={app.id} className="hover:bg-slate-50 border-b">
                                <td className="p-4 font-semibold text-slate-700">{app.id}</td>
                                <td className="p-4 font-bold text-slate-800">{app.name}</td>
                                <td className="p-4">
                                    <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">{app.status}</span>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    <button onClick={() => handleAction('approve', app.id)} className="px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 rounded">Approve</button>
                                    <button onClick={() => { setCurrentAppId(app.id); setIsModalOpen(true); }} className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded">Assign FO</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Assignment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900 bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Assign Field Officer</h3>
                        <select className="w-full border p-2 mb-4 rounded" onChange={(e) => setSelectedOfficer(e.target.value)}>
                            <option value="">Select an officer...</option>
                            {fieldOfficers.map(fo => (
                                <option key={fo.id} value={fo.id}>{fo.name} ({fo.zone})</option>
                            ))}
                        </select>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                            <button onClick={confirmAssignment} className="px-4 py-2 bg-blue-600 text-white rounded">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}