import React, { useState, useEffect } from 'react';
import type { FuelingRecord, User } from '../types';
import { FuelIcon, DownloadIcon, RoadIcon, CarIcon } from './icons';

interface AdminReportProps {
  records: FuelingRecord[];
  users: User[];
}

const PhotoDetail: React.FC<{ photo: { base64: string, timestamp: string }, label: string }> = ({ photo, label }) => (
    <div className="text-center">
        <h4 className="text-sm font-semibold text-gray-300 mb-1">{label}</h4>
        <img 
            src={photo.base64} 
            alt={label} 
            className="rounded-lg w-full object-cover max-h-48 cursor-pointer hover:opacity-80 transition"
            onClick={() => window.open(photo.base64)}
        />
        <p className="text-xs text-gray-500 mt-1">Tirada em: {new Date(photo.timestamp).toLocaleString()}</p>
    </div>
);


const RecordCard: React.FC<{ record: FuelingRecord }> = ({ record }) => {
    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 md:p-6 space-y-4">
            <div className="flex flex-wrap justify-between items-center border-b border-gray-700 pb-2 gap-2">
                <div>
                    <h3 className="text-xl font-bold text-cyan-400">{record.driverName}</h3>
                     <p className="text-sm text-gray-400 flex items-center gap-2">
                        <CarIcon className="w-4 h-4" /> 
                        {record.vehicle} - <span className="font-mono bg-gray-700 px-2 py-0.5 rounded">{record.vehiclePlate}</span>
                    </p>
                    <p className="text-sm text-gray-400">{new Date(record.recordTimestamp).toLocaleString()}</p>
                </div>
                <div className="text-right">
                   <p className="text-lg font-semibold">{record.mileage} km</p>
                   <p className="text-sm text-gray-400">Quilometragem</p>
                </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <FuelIcon className="w-8 h-8 text-blue-400" />
                    <div>
                        <p className="font-semibold text-lg">R$ {record.cost.toFixed(2)}</p>
                        <p className="text-sm text-gray-300">{record.liters.toFixed(2)} L - {record.fuelType}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                <PhotoDetail photo={record.dashboardPhoto} label="Foto do Painel" />
                <PhotoDetail photo={record.pumpPhoto} label="Foto da Bomba" />
            </div>
        </div>
    );
};

export const AdminReport: React.FC<AdminReportProps> = ({ records, users }) => {
    const [filteredRecords, setFilteredRecords] = useState<FuelingRecord[]>([]);
    const [selectedDriver, setSelectedDriver] = useState<string>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        let result = [...records];
        if (selectedDriver !== 'all') {
            result = result.filter(r => r.driverId === selectedDriver);
        }
        if (startDate) {
            result = result.filter(r => new Date(r.recordTimestamp) >= new Date(startDate));
        }
        if (endDate) {
            result = result.filter(r => new Date(r.recordTimestamp) <= new Date(endDate + 'T23:59:59'));
        }
        setFilteredRecords(result.sort((a,b) => new Date(b.recordTimestamp).getTime() - new Date(a.recordTimestamp).getTime()));
    }, [records, selectedDriver, startDate, endDate]);
    
    const handleExportCSV = () => {
        const headers = ['ID Registro', 'Data Registro', 'Motorista', 'Veículo', 'Placa', 'KM', 'Custo (R$)', 'Litros', 'Tipo Combustível', 'Data Foto Painel', 'Data Foto Bomba'];
        const rows = filteredRecords.map(rec => [
            rec.id,
            new Date(rec.recordTimestamp).toLocaleString(),
            rec.driverName,
            rec.vehicle,
            rec.vehiclePlate,
            rec.mileage,
            rec.cost.toFixed(2),
            rec.liters.toFixed(2),
            rec.fuelType,
            new Date(rec.dashboardPhoto.timestamp).toLocaleString(),
            new Date(rec.pumpPhoto.timestamp).toLocaleString()
        ].join(','));
        
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `relatorio_abastecimentos_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const driverUsers = users.filter(u => u.role === 'driver');

    return (
        <div className="p-4 md:p-6 w-full max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">Relatório de Abastecimentos</h1>
            
            <div className="bg-gray-800 p-4 rounded-lg mb-6 flex flex-wrap gap-4 items-end">
                <div className="flex-grow">
                    <label htmlFor="driver-filter" className="block mb-2 text-sm font-medium text-gray-300">Motorista</label>
                    <select id="driver-filter" value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5">
                        <option value="all">Todos</option>
                        {driverUsers.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                    </select>
                </div>
                <div className="flex-grow">
                    <label htmlFor="start-date" className="block mb-2 text-sm font-medium text-gray-300">Data Início</label>
                    <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5" />
                </div>
                <div className="flex-grow">
                    <label htmlFor="end-date" className="block mb-2 text-sm font-medium text-gray-300">Data Fim</label>
                    <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5" />
                </div>
                <button onClick={handleExportCSV} className="w-full sm:w-auto text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center justify-center gap-2">
                    <DownloadIcon className="w-5 h-5" />
                    Exportar CSV
                </button>
            </div>

            {filteredRecords.length === 0 ? (
                <div className="text-center py-10 bg-gray-800 rounded-lg">
                    <FuelIcon className="mx-auto w-12 h-12 text-gray-500"/>
                    <p className="mt-4 text-gray-400">Nenhum registro encontrado com os filtros selecionados.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredRecords.map(record => (
                        <RecordCard key={record.id} record={record} />
                    ))}
                </div>
            )}
        </div>
    );
};