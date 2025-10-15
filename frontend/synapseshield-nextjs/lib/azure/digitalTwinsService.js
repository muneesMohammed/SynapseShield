// lib/azure/digitalTwinsService.js
import { DigitalTwinsClient } from "@azure/digital-twins-core";
import { DefaultAzureCredential } from "@azure/identity";

class DigitalTwinsService {
  constructor() {
    this.client = null;
    this.credential = new DefaultAzureCredential();
    this.endpoint = process.env.AZURE_DIGITAL_TWINS_URL;
  }

  async initialize() {
    try {
      this.client = new DigitalTwinsClient(this.endpoint, this.credential);
      console.log('Azure Digital Twins client initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize ADT client:', error);
      throw error;
    }
  }

  async createTwin(twinId, modelId, properties) {
    const twin = {
      $dtId: twinId,
      $metadata: {
        $model: modelId
      },
      ...properties
    };

    return await this.client.upsertDigitalTwin(twinId, JSON.stringify(twin));
  }

  async queryTwins(query) {
    try {
      const queryResult = this.client.queryTwins(query);
      const results = [];
      for await (const item of queryResult) {
        results.push(item);
      }
      return results;
    } catch (error) {
      console.error('Query failed:', error);
      throw error;
    }
  }

  async updateTwin(twinId, patch) {
    return await this.client.updateDigitalTwin(twinId, patch);
  }

  async deleteTwin(twinId) {
    return await this.client.deleteDigitalTwin(twinId);
  }

  // Network-specific methods
  async getNetworkDevices() {
    return await this.queryTwins(`
      SELECT * FROM digitaltwins 
      WHERE IS_OF_MODEL('dtmi:com:synapseshield:Device;1')
    `);
  }

  async getAttackSimulations() {
    return await this.queryTwins(`
      SELECT * FROM digitaltwins 
      WHERE IS_OF_MODEL('dtmi:com:synapseshield:AttackSimulation;1')
      ORDER BY timestamp DESC
    `);
  }
}

export const digitalTwinsService = new DigitalTwinsService();