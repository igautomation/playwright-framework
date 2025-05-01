// src/tests/api/rest/reqres-crud.spec.js

import { test, expect } from '../../../../fixtures/combined.js';
import ApiUtils from '../../../../utils/api/apiUtils.js';
import { readYaml } from '../../../../utils/common/dataOrchestrator.js';

// Schema for POST /api/users response
const createUserSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    job: { type: 'string' },
    createdAt: { type: 'string' }
  },
  required: ['id', 'name', 'job', 'createdAt']
};

// Schema for PUT /api/users response
const updateUserSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    job: { type: 'string' },
    updatedAt: { type: 'string' }
  },
  required: ['name', 'job', 'updatedAt']
};

test.describe.parallel('Reqres.in API CRUD Tests', () => {
  test('Create User', async ({ apiClient, retryDiagnostics }, testInfo) => {
    const apiUtils = new ApiUtils(apiClient);

    try {
      const userData = readYaml('src/data/testData.yaml').user;

      const { status, body } = await apiUtils.sendRequest('POST', '/api/users', userData);

      expect(status).toBe(201);
      expect(body.name).toBe(userData.name);
      expect(body.job).toBe(userData.job);

      apiUtils.validateSchema(body, createUserSchema, 'POST /api/users');

      testInfo.annotations.push({ type: 'user_id', description: body.id });
    } catch (error) {
      await retryDiagnostics(error);
      throw new Error('Create user failed: ' + error.message);
    }
  });

  test('Read User List', async ({ apiClient, retryDiagnostics }, testInfo) => {
    const apiUtils = new ApiUtils(apiClient);

    try {
      const { status, body } = await apiUtils.sendRequest('GET', '/api/users?page=2&delay=1');

      expect(status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    } catch (error) {
      await retryDiagnostics(error);
      throw new Error('Read user list failed: ' + error.message);
    }
  });

  test('Update User', async ({ apiClient, retryDiagnostics }, testInfo) => {
    const apiUtils = new ApiUtils(apiClient);

    try {
      const userData = readYaml('src/data/testData.yaml').user;

      const createResponse = await apiUtils.sendRequest('POST', '/api/users', userData);
      const userId = createResponse.body.id;

      const updatePayload = { name: 'Updated User', job: 'QA Lead' };

      const { status, body } = await apiUtils.sendRequest(
        'PUT',
        `/api/users/${userId}`,
        updatePayload
      );

      expect(status).toBe(200);
      expect(body.name).toBe(updatePayload.name);
      expect(body.job).toBe(updatePayload.job);

      apiUtils.validateSchema(body, updateUserSchema, `PUT /api/users/${userId}`);
    } catch (error) {
      await retryDiagnostics(error);
      throw new Error('Update user failed: ' + error.message);
    }
  });

  test('Delete User', async ({ apiClient, retryDiagnostics }, testInfo) => {
    const apiUtils = new ApiUtils(apiClient);

    try {
      const userData = readYaml('src/data/testData.yaml').user;

      const createResponse = await apiUtils.sendRequest('POST', '/api/users', userData);
      const userId = createResponse.body.id;

      const deleteResponse = await apiUtils.sendRequest('DELETE', `/api/users/${userId}`);
      expect(deleteResponse.status).toBe(204);

      const repeatDelete = await apiUtils.sendRequest('DELETE', `/api/users/${userId}`);
      expect(repeatDelete.status).toBe(204);
    } catch (error) {
      await retryDiagnostics(error);
      throw new Error('Delete user failed: ' + error.message);
    }
  });
});
