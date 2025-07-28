import React from 'react';

interface HeaderProps {
    currentView: 'form' | 'table';
    setView: (view: 'form' | 'table') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
    const baseClasses = "px-4 py-2 rounded-md font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600";
    const activeClasses = "bg-green-700 text-white shadow";
    const inactiveClasses = "bg-white text-green-800 hover:bg-green-100";

    return (
        <header className="bg-white shadow-md sticky top-0 z-10">
            <nav className="max-w-4xl mx-auto p-4 flex justify-between items-center">
                <div className="flex items-center">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Reporte T1</h1>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setView('form')} className={`${baseClasses} ${currentView === 'form' ? activeClasses : inactiveClasses}`}>
                        Registrar
                    </button>
                    <button onClick={() => setView('table')} className={`${baseClasses} ${currentView === 'table' ? activeClasses : inactiveClasses}`}>
                        Consultar
                    </button>
                </div>
            </nav>
        </header>
    );
};

export default Header;