import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const DivisaContext = createContext(null);

export const DivisaProvider = ({ children }) => {
    const [divisaActual, setDivisaActual] = useState('COP');
    const [tasas, setTasas] = useState({ COP: 1.0 });
    const [loading, setLoading] = useState(true);
    const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
    
    // Cargar tasas al inicio y cada hora
    useEffect(() => {
        cargarTasas();
        const interval = setInterval(cargarTasas, 60 * 60 * 1000); // 1 hora
        return () => clearInterval(interval);
    }, []);
    
    // Cargar divisa guardada del usuario
    useEffect(() => {
        const divisaGuardada = localStorage.getItem('divisa_preferida') || 'COP';
        setDivisaActual(divisaGuardada);
    }, []);
    
    const cargarTasas = async () => {
        try {
            const res = await api.get('/divisas/tasas');
            const tasasData = {};
            const sourceTasas = res.tasas || res;
            
            Object.entries(sourceTasas).forEach(([key, val]) => {
                tasasData[key] = val && typeof val === 'object' && 'tasa' in val ? val.tasa : val;
            });
            
            // Asegurarse de tener COP
            tasasData['COP'] = 1.0;
            
            setTasas(tasasData);
            setUltimaActualizacion(new Date());
        } catch (e) {
            console.error('Error cargando tasas:', e);
        } finally {
            setLoading(false);
        }
    };
    
    const cambiarDivisa = (nuevaDivisa) => {
        setDivisaActual(nuevaDivisa);
        localStorage.setItem('divisa_preferida', nuevaDivisa);
        // Si hay usuario autenticado, guardar en DB
        const token = localStorage.getItem('token');
        if (token) {
            api.patch('/usuarios/divisa', { divisa: nuevaDivisa }).catch(() => {});
        }
    };
    
    // Función de conversión que se usa en TODA la app
    const convertir = (precioCOP) => {
        if (!precioCOP) return 0;
        const tasa = tasas[divisaActual] || 1;
        return precioCOP * tasa;
    };
    
    // Formatear precio con símbolo de divisa
    const formatearPrecio = (precioCOP) => {
        const valor = convertir(precioCOP);
        const simbolos = {
            COP: { simbolo: '$', decimales: 0 },
            USD: { simbolo: 'US$', decimales: 2 },
            EUR: { simbolo: '€', decimales: 2 },
            GBP: { simbolo: '£', decimales: 2 },
            BRL: { simbolo: 'R$', decimales: 2 },
            MXN: { simbolo: 'MX$', decimales: 2 },
            CLP: { simbolo: 'CLP$', decimales: 0 },
            JPY: { simbolo: '¥', decimales: 0 },
            CNY: { simbolo: '¥', decimales: 2 },
            PEN: { simbolo: 'S/', decimales: 2 },
            ARS: { simbolo: 'AR$', decimales: 2 },
            CAD: { simbolo: 'CA$', decimales: 2 }
        };
        const config = simbolos[divisaActual] || { simbolo: divisaActual, decimales: 2 };
        const formatted = new Intl.NumberFormat('es-CO', {
            minimumFractionDigits: config.decimales,
            maximumFractionDigits: config.decimales,
        }).format(valor);
        return `${config.simbolo} ${formatted}`;
    };
    
    return (
        <DivisaContext.Provider value={{
            divisaActual, cambiarDivisa, convertir, formatearPrecio,
            tasas, loading, ultimaActualizacion, cargarTasas
        }}>
            {children}
        </DivisaContext.Provider>
    );
};

export const useDivisa = () => {
    const context = useContext(DivisaContext);
    if (!context) {
        throw new Error('useDivisa debe ser usado dentro de un DivisaProvider');
    }
    return context;
};
