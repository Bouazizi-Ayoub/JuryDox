/**
 * Pinata IPFS Utility
 * Handles file upload to IPFS via Pinata and retrieval via gateway.
 */

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;
const IPFS_GATEWAY = import.meta.env.VITE_IPFS_GATEWAY || 'https://gateway.pinata.cloud';

/**
 * Check if Pinata is configured with valid API keys
 */
export const isPinataConfigured = () => {
  return !!(PINATA_API_KEY && PINATA_SECRET_KEY);
};

/**
 * Upload a file to IPFS via Pinata
 * @param {File} file - The file to upload
 * @param {object} metadata - Optional metadata (name, description, etc.)
 * @returns {Promise<{hash: string, url: string, size: number}>}
 */
export const uploadToIPFS = async (file, metadata = {}) => {
  if (!isPinataConfigured()) {
    console.warn('Pinata not configured — using mock hash');
    return {
      hash: generateMockHash(),
      url: '#',
      size: file.size,
      mock: true,
    };
  }

  const formData = new FormData();
  formData.append('file', file);

  // Add metadata
  const pinataMetadata = JSON.stringify({
    name: metadata.name || file.name,
    keyvalues: {
      uploadedBy: metadata.uploadedBy || 'unknown',
      app: 'JuryDoX',
      timestamp: new Date().toISOString(),
      ...metadata.keyvalues,
    },
  });
  formData.append('pinataMetadata', pinataMetadata);

  // Pin options
  const pinataOptions = JSON.stringify({
    cidVersion: 1,
  });
  formData.append('pinataOptions', pinataOptions);

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.details || `Pinata upload failed: ${response.status}`);
    }

    const data = await response.json();

    return {
      hash: data.IpfsHash,
      url: getIPFSUrl(data.IpfsHash),
      size: data.PinSize,
      mock: false,
    };
  } catch (error) {
    console.error('IPFS upload failed:', error);
    throw error;
  }
};

/**
 * Upload JSON metadata to IPFS via Pinata
 * @param {object} jsonData - JSON object to upload
 * @param {string} name - Name for the pin
 * @returns {Promise<{hash: string, url: string}>}
 */
export const uploadJSONToIPFS = async (jsonData, name = 'metadata') => {
  if (!isPinataConfigured()) {
    return { hash: generateMockHash(), url: '#', mock: true };
  }

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
      body: JSON.stringify({
        pinataContent: jsonData,
        pinataMetadata: { name },
      }),
    });

    if (!response.ok) {
      throw new Error(`Pinata JSON upload failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      hash: data.IpfsHash,
      url: getIPFSUrl(data.IpfsHash),
      mock: false,
    };
  } catch (error) {
    console.error('IPFS JSON upload failed:', error);
    throw error;
  }
};

/**
 * Get the gateway URL for an IPFS hash
 * @param {string} hash - IPFS CID/hash
 * @returns {string} Full gateway URL
 */
export const getIPFSUrl = (hash) => {
  if (!hash) return '#';
  return `${IPFS_GATEWAY}/ipfs/${hash}`;
};

/**
 * Test Pinata connection
 * @returns {Promise<boolean>}
 */
export const testPinataConnection = async () => {
  if (!isPinataConfigured()) return false;

  try {
    const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_KEY,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Fallback mock hash generator (when Pinata is not configured)
 */
const generateMockHash = () => {
  return 'Qm' + Array.from({ length: 44 }, () =>
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 62)]
  ).join('');
};
