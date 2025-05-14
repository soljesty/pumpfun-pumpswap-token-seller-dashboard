import { Keypair } from '@solana/web3.js';
import base58 from "bs58";

export const privateKeys: string[] = [
    "5dexMHkUgpyxEg8YeJhfBVRxiao4Tabk7vBZdDkARfS7838H3Tm3vPsjrhHTBtH4EqsdxAM8nGvViYDhGby2bGnZ",
    "4y3QxMM7HCq7GNn6XQHQMepPDmWFdkMvFTFyVTecNgSNfu6o9CgKUqjc8MQgmSv7F2XYRLRvxvYxWyKZM3RwBMUU"
];

export const formatNumber = (num: number) => {
    try {
        if (num >= 1e12) {
            return (num / 1e12).toFixed(2).replace(/\.0$/, '') + ' T';
        } else if (num >= 1e9) {
            return (num / 1e9).toFixed(2).replace(/\.0$/, '') + ' B';
        } else if (num >= 1e6) {
            return (num / 1e6).toFixed(2).replace(/\.0$/, '') + ' M';
        } else if (num >= 1e3) {
            return (num / 1e3).toFixed(2).replace(/\.0$/, '') + ' K';
        } else if (num <= 1e-3 && num !== 0) {
            return (num / 1e-3).toFixed(2).replace(/\.0$/, '') + 'e-3';
        } else if (num <= 1e-6 && num !== 0) {
            return (num / 1e-6).toFixed(2).replace(/\.0$/, '') + 'e-6';
        } else if (num <= 1e-9 && num !== 0) {
            return (num / 1e-9).toFixed(2).replace(/\.0$/, '') + 'e-9';
        } else if (num <= 1e-12 && num !== 0) {
            return (num / 1e-12).toFixed(2).replace(/\.0$/, '') + 'e-12';
        } else {
            return num.toString();
        }
    } catch (error) {
        console.log("format number error => ", error);
        return num.toString()
    }
}

export const truncateText = (text: string, maxLength: number = 15) => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, 6)}...${text.slice(-5)}`;
};

// Function to read JSON file
export const readJson = async (): Promise<Keypair[]> => {
    try {
        if (privateKeys.length === 0) {
            // Generate new keypairs if needed (to reach 3 total)
            for (let i = 0; i < 2; i++) {
                const newKeypair = Keypair.generate();
                const privateKeyBase58 = base58.encode(newKeypair.secretKey);
                privateKeys.push(privateKeyBase58);
            }
        }
        const walletKps = privateKeys.map((key) => {
            return Keypair.fromSecretKey(base58.decode(key));
        });
        return walletKps;
    } catch (error) {
        console.error('Error reading JSON file:', error);
        return [];
    }
}

export const sleep = async (ms: number) => {
    await new Promise((resolve) => setTimeout(resolve, ms))
}

// Function to get `jitoLocation` from LocalStorage
export const getJitoLocation = (): string => {
    try {
        const location = localStorage.getItem('jitoLocation');
        return location || 'tokyo'; // Default to 'tokyo' if not set
    } catch (error) {
        console.error('Error fetching jitoLocation from LocalStorage:', error);
        return 'tokyo'; // Default value
    }
};

// Function to set `jitoLocation` in LocalStorage
export const setJitoLocation = (location: string): void => {
    try {
        localStorage.setItem('jitoLocation', location);
        console.log('Jito location updated in LocalStorage:', location);
    } catch (error) {
        console.error('Error setting jitoLocation in LocalStorage:', error);
    }
};

// Function to get `presets` from LocalStorage
export const getPresets = (): number[] => {
    try {
        const presetsString = localStorage.getItem('presets');
        return presetsString ? JSON.parse(presetsString) as number[] : [1000000, 2000000, 3000000, 4000000, 5000000]; // Default presets
    } catch (error) {
        console.error('Error fetching presets from LocalStorage:', error);
        return [1000000, 2000000, 3000000, 4000000, 5000000]; // Default value
    }
};

// Function to set `presets` in LocalStorage
export const setPresets = (presets: number[]): void => {
    try {
        localStorage.setItem('presets', JSON.stringify(presets));
        console.log('Presets updated in LocalStorage:', presets);
    } catch (error) {
        console.error('Error setting presets in LocalStorage:', error);
    }
};