// Utility functions and constants for the admin module
export const ADMIN_PASSWORD = 'Coupon123!';

export class AdminUtils {
    static getFiliereFullName(code) {
        const names = {
            '2GT': 'Seconde Generale et Technologique',
            '1ST2S': 'Premiere ST2S',
            'TST2S': 'Terminale ST2S',
            'ASSP': 'ASSP - Accompagnement, Soins et Services',
            'CIEL': 'CIEL - Cybersecurite et Informatique',
            'MELEC': 'MELEC - Metiers de l\'Electricite',
            'TRPM-RSP': 'TRPM-RSP - Technicien Realisation Produits',
            'TMA': 'TMA - Technicien Menuisier Agenceur',
            'MEE': 'MEE - Maintenance Efficacite Energetique',
            'ERA': 'ERA - Etude Realisation Agencement',
            'MFER': 'MFER - Metiers Froid et Energies Renouvelables',
            'AAGA': 'AAGA - Agent Accompagnant Grand Age',
            'CAP-Ebeniste': 'CAP Ebeniste',
            'CAP-MIS': 'CAP Monteur Installations Sanitaires',
            'BMA-Ebeniste': 'BMA Ebeniste',
            'MC-AD': 'MC Aide a Domicile',
            '3PM': '3e Prepa-Metiers',
            'BTS-ESF': 'BTS - Économie Sociale Familiale (ESF)',
            'DPR': 'Dispositifs de Prévention et de Remobilisation (DPR)'
        };
        return names[code] || code;
    }
}