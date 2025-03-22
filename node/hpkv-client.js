const axios = require('axios');

class HPKVClient {
  /**
   * Creates a new HPKV client
   * @param {string} baseUrl - The base URL for the HPKV API
   * @param {string} apiKey - Your HPKV API key
   */
  constructor(baseUrl, apiKey) {
    if (!baseUrl) throw new Error('baseUrl is required');
    if (!apiKey) throw new Error('apiKey is required');
    
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      }
    });
  }

  /**
   * Insert or update a record
   * @param {string} key - Key to store
   * @param {string|object} value - Value to store
   * @param {boolean} [partialUpdate=false] - Whether to perform a partial update
   * @returns {Promise<object>} - The API response
   */
  async set(key, value, partialUpdate = false) {
    try {
      const response = await this.client.post('/record', {
        key:encodeURIComponent(key),
        value: typeof value === 'object' ? JSON.stringify(value) : value,
        partialUpdate
      });
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Get a record by key
   * @param {string} key - Key to retrieve
   * @returns {Promise<object>} - The record
   */
  async get(key) {
    try {
      const response = await this.client.get(`/record/${encodeURIComponent(key)}`);
      
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Delete a record
   * @param {string} key - Key to delete
   * @returns {Promise<object>} - The API response
   */
  async delete(key) {
    try {
      const response = await this.client.delete(`/record/${encodeURIComponent(key)}`);
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Increment or decrement a numeric value
   * @param {string} key - Key to increment/decrement
   * @param {number} increment - Value to add (positive) or subtract (negative)
   * @returns {Promise<object>} - The API response with the new value
   */
  async increment(key, increment = 1) {
    try {
      const response = await this.client.post('/record/atomic', {
        key:encodeURIComponent(key),
        increment
      });
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Query records within a key range
   * @param {string} startKey - Starting key (inclusive)
   * @param {string} endKey - Ending key (inclusive)
   * @param {number} [limit=100] - Maximum number of records to return
   * @returns {Promise<object>} - Records in the range
   */
  async query(startKey, endKey, limit = 100) {
    try {
      const response = await this.client.get('/records', {
        params: {
          startKey:encodeURIComponent(startKey),
          endKey:encodeURIComponent(endKey),
          limit
        }
      });
      return response.data;
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * Handle API errors
   * @private
   * @param {Error} error - The error object
   */
  _handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      const message = data.error || `HTTP error ${status}`;
      
      const err = new Error(message);
      err.status = status;
      err.data = data;
      throw err;
    } else if (error.request) {
      throw new Error('No response received from server');
    } else {
      throw error;
    }
  }
}

module.exports = HPKVClient; 