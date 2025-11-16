import React, { useState, useRef } from 'react';
import type { User, FuelingRecord, PhotoData } from '../types';
import { FuelType } from '../types';
import { CameraIcon, FuelIcon, RoadIcon, CarIcon, CheckCircleIcon } from './icons';

type NewRecordData = Omit<FuelingRecord, 'id' | 'driverId' | 'driverName' | 'vehicle' | 'recordTimestamp'>;

// --- Photo Input Component ---
interface PhotoInputProps {
    onPhotoSelect: (file: File | null) => void;
    id: string;
    label: string;
    photoPreview?: string | null;
}

const PhotoInput: React.FC<PhotoInputProps> = ({ onPhotoSelect, id, label, photoPreview }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        if (file) {
            setFileName(file.name);
        } else {
            setFileName(null)
        }
        onPhotoSelect(file);
    };

    return (
        <div>
            <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                id={id}
            />
            <label className="block mb-2 text-sm font-medium text-gray-300">{label}</label>
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:bg-gray-700 hover:border-gray-500 transition"
            >
                <CameraIcon />
                <span>{fileName || 'Tirar Foto'}</span>
            </button>
            {photoPreview && <img src={photoPreview} alt="Preview" className="mt-2 rounded-lg max-h-32 mx-auto" />}
        </div>
    );
};


// --- Fueling Form Modal ---
interface AddFuelingFormProps {
    onAdd: (data: NewRecordData) => void;
    onCancel: () => void;
}

const AddFuelingForm: React.FC<AddFuelingFormProps> = ({ onAdd, onCancel }) => {
    const [mileage, setMileage] = useState('');
    const [vehiclePlate, setVehiclePlate] = useState('');
    const [cost, setCost] = useState('');
    const [liters, setLiters] = useState('');
    const [fuelType, setFuelType] = useState<FuelType>(FuelType.Gasoline);
    
    const [dashboardPhotoFile, setDashboardPhotoFile] = useState<File|null>(null);
    const [pumpPhotoFile, setPumpPhotoFile] = useState<File|null>(null);
    
    const [dashboardPreview, setDashboardPreview] = useState<string|null>(null);
    const [pumpPreview, setPumpPreview] = useState<string|null>(null);

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fileToData = (file: File): Promise<PhotoData> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve({
                base64: reader.result as string,
                timestamp: new Date(file.lastModified).toISOString()
            });
            reader.onerror = error => reject(error);
        });
    };
    
    const handlePhotoSelect = (file: File | null, type: 'dashboard' | 'pump') => {
        if (type === 'dashboard') {
            setDashboardPhotoFile(file);
            setDashboardPreview(file ? URL.createObjectURL(file) : null);
        } else {
            setPumpPhotoFile(file);
            setPumpPreview(file ? URL.createObjectURL(file) : null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!mileage || !vehiclePlate || !cost || !liters || !dashboardPhotoFile || !pumpPhotoFile) {
            setError('Todos os campos e fotos são obrigatórios.');
            return;
        }
        setError('');
        setIsLoading(true);

        try {
            const dashboardPhotoData = await fileToData(dashboardPhotoFile);
            const pumpPhotoData = await fileToData(pumpPhotoFile);
            
            onAdd({
                mileage: Number(mileage),
                vehiclePlate: vehiclePlate.toUpperCase(),
                cost: Number(cost),
                liters: Number(liters),
                fuelType,
                dashboardPhoto: dashboardPhotoData,
                pumpPhoto: pumpPhotoData,
            });
        } catch (err) {
            console.error("Error processing files:", err);
            setError("Erro ao processar as imagens. Tente novamente.");
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-cyan-400 mb-4">Registrar Abastecimento</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-2">Dados do Veículo</h3>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Placa do Veículo</label>
                        <input type="text" value={vehiclePlate} onChange={e => setVehiclePlate(e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5" placeholder="Ex: ABC1D23" required />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Quilometragem (KM)</label>
                        <input type="number" value={mileage} onChange={e => setMileage(e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5" placeholder="Ex: 123456" required />
                    </div>
                     <PhotoInput onPhotoSelect={(file) => handlePhotoSelect(file, 'dashboard')} id="dashboard-photo" label="Foto do Painel (KM)" photoPreview={dashboardPreview} />

                    <h3 className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-2 pt-4">Dados do Abastecimento</h3>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Valor Total (R$)</label>
                        <input type="number" step="0.01" value={cost} onChange={e => setCost(e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5" placeholder="Ex: 150.00" required />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Quantidade (Litros)</label>
                        <input type="number" step="0.01" value={liters} onChange={e => setLiters(e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5" placeholder="Ex: 30.5" required />
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">Tipo de Combustível</label>
                        <select value={fuelType} onChange={e => setFuelType(e.target.value as FuelType)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5">
                            {Object.values(FuelType).map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <PhotoInput onPhotoSelect={(file) => handlePhotoSelect(file, 'pump')} id="pump-photo" label="Foto da Bomba (Valor e Litros)" photoPreview={pumpPreview}/>

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onCancel} className="w-full text-gray-300 bg-gray-600 hover:bg-gray-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Cancelar</button>
                        <button type="submit" disabled={isLoading} className="w-full text-white bg-cyan-600 hover:bg-cyan-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center justify-center gap-2 disabled:bg-cyan-800 disabled:cursor-not-allowed">
                           {isLoading ? 'Adicionando...' : <><FuelIcon /> Adicionar Registro</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Record Card Component ---
const RecordCard: React.FC<{ record: FuelingRecord }> = ({ record }) => {
    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-lg font-bold text-cyan-400">R$ {record.cost.toFixed(2)}</p>
                    <p className="text-sm text-gray-400">{new Date(record.recordTimestamp).toLocaleString()}</p>
                </div>
                <div className="text-right">
                    <p className="font-semibold">{record.mileage} km</p>
                     <p className="font-semibold text-gray-300 bg-gray-700 px-2 py-0.5 rounded-md inline-block my-1">{record.vehiclePlate}</p>
                    <p className="text-sm text-gray-400">{record.liters.toFixed(2)} L - {record.fuelType}</p>
                </div>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-700">
                <div className="text-center">
                    <h4 className="text-sm font-semibold text-gray-300 mb-1">Painel</h4>
                    <img src={record.dashboardPhoto.base64} alt="Foto do Painel" className="rounded-lg w-full object-cover max-h-48 cursor-pointer" onClick={() => window.open(record.dashboardPhoto.base64)}/>
                    <p className="text-xs text-gray-500 mt-1">Tirada em: {new Date(record.dashboardPhoto.timestamp).toLocaleString()}</p>
                </div>
                 <div className="text-center">
                    <h4 className="text-sm font-semibold text-gray-300 mb-1">Bomba</h4>
                    <img src={record.pumpPhoto.base64} alt="Foto da Bomba" className="rounded-lg w-full object-cover max-h-48 cursor-pointer" onClick={() => window.open(record.pumpPhoto.base64)}/>
                    <p className="text-xs text-gray-500 mt-1">Tirada em: {new Date(record.pumpPhoto.timestamp).toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}

// --- Main Driver Dashboard ---
interface DriverDashboardProps {
  user: User;
  records: FuelingRecord[];
  onAddFueling: (data: NewRecordData) => void;
  showNotification: (title: string, options?: NotificationOptions) => void;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({ user, records, onAddFueling, showNotification }) => {
    const [showFuelModal, setShowFuelModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleAdd = (data: NewRecordData) => {
        onAddFueling(data);
        setShowFuelModal(false);
        setSuccessMessage('Abastecimento registrado com sucesso!');
        setTimeout(() => setSuccessMessage(''), 3000); // Message disappears after 3 seconds
        
        // Simulate review and notify driver
        setTimeout(() => {
            const isApproved = Math.random() > 0.3; // 70% chance of approval
            if (isApproved) {
                showNotification('Registro Aprovado', {
                    body: `Seu registro de abastecimento para ${data.vehiclePlate} foi aprovado.`,
                });
            } else {
                showNotification('Registro Rejeitado', {
                    body: `Seu registro para ${data.vehiclePlate} foi rejeitado. Verifique os dados.`,
                });
            }
        }, 8000); // Simulate 8 seconds for review
    }
    
    const sortedRecords = [...records].sort((a,b) => new Date(b.recordTimestamp).getTime() - new Date(a.recordTimestamp).getTime());

    return (
        <div className="p-4 md:p-6 w-full max-w-2xl mx-auto">
             {successMessage && (
                <div className="bg-green-600 border border-green-700 text-white px-4 py-3 rounded-lg relative mb-4 flex items-center gap-2" role="alert">
                    <CheckCircleIcon className="w-5 h-5"/>
                    <span className="block sm:inline">{successMessage}</span>
                </div>
             )}
             <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-4">
                <h1 className="text-2xl font-bold mb-1 text-white">Olá, {user.name}</h1>
                <p className="text-gray-400 flex items-center gap-2"><CarIcon className="w-5 h-5" /> {user.vehicle}</p>
             </div>

            <div className="space-y-4">
                 <h2 className="text-xl font-bold text-gray-300">Seus Registros</h2>
                 {sortedRecords.length === 0 ? (
                     <div className="text-center py-10 bg-gray-800 rounded-lg">
                        <FuelIcon className="mx-auto w-12 h-12 text-gray-500"/>
                        <p className="mt-4 text-gray-400">Nenhum abastecimento registrado ainda.</p>
                        <p className="mt-2 text-sm text-gray-500">Clique no botão '+' para adicionar seu primeiro registro.</p>
                    </div>
                 ) : (
                    sortedRecords.map(rec => <RecordCard key={rec.id} record={rec} />)
                 )}
            </div>

            <button 
                onClick={() => setShowFuelModal(true)} 
                title="Registrar Abastecimento"
                className="fixed bottom-6 right-6 w-16 h-16 bg-cyan-600 text-white rounded-full shadow-lg hover:bg-cyan-700 flex items-center justify-center text-3xl font-bold transition-transform hover:scale-110"
            >
                +
            </button>
            
            {showFuelModal && <AddFuelingForm onAdd={handleAdd} onCancel={() => setShowFuelModal(false)} />}
        </div>
    );
};