import { renderHook, act, waitFor } from '@testing-library/react';
import useEnhancedVehicleLookup from './useEnhancedVehicleLookup';
import api from '../services/api';

// Mock the API service
jest.mock('../services/api');

describe('useEnhancedVehicleLookup Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful lookup', () => {
    test('should successfully lookup vehicle data', async () => {
      const mockData = {
        make: { value: 'BMW', source: 'dvla' },
        model: { value: '3 Series', source: 'dvla' },
        year: { value: 2020, source: 'dvla' },
        runningCosts: {
          fuelEconomy: {
            combined: { value: 45.8, source: 'checkcardetails' }
          }
        },
        performance: {
          power: { value: 184, source: 'checkcardetails' }
        },
        dataSources: {
          dvla: true,
          checkCarDetails: true
        }
      };

      api.get = jest.fn().mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useEnhancedVehicleLookup());

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.vehicleData).toBe(null);

      await act(async () => {
        await result.current.lookupVehicle('AB12CDE');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(null);
      expect(result.current.vehicleData).toBeDefined();
      expect(api.get).toHaveBeenCalledWith('/api/vehicle/lookup/AB12CDE');
    });

    test('should extract clean values from source-tracked data', async () => {
      const mockData = {
        make: { value: 'BMW', source: 'dvla' },
        model: { value: '3 Series', source: 'dvla' },
        runningCosts: {
          fuelEconomy: {
            combined: { value: 45.8, source: 'checkcardetails' }
          }
        },
        performance: {
          power: { value: 184, source: 'checkcardetails' }
        }
      };

      api.get = jest.fn().mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useEnhancedVehicleLookup());

      await act(async () => {
        await result.current.lookupVehicle('AB12CDE');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.vehicleData.make).toBe('BMW');
      expect(result.current.vehicleData.model).toBe('3 Series');
      expect(result.current.vehicleData.runningCosts.fuelEconomy.combined).toBe(45.8);
      expect(result.current.vehicleData.performance.power).toBe(184);
    });

    test('should track data sources for UI display', async () => {
      const mockData = {
        make: { value: 'BMW', source: 'dvla' },
        runningCosts: {
          fuelEconomy: {
            combined: { value: 45.8, source: 'checkcardetails' }
          }
        },
        dataSources: {
          dvla: true,
          checkCarDetails: true
        }
      };

      api.get = jest.fn().mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useEnhancedVehicleLookup());

      await act(async () => {
        await result.current.lookupVehicle('AB12CDE');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.sources.make).toBe('dvla');
      expect(result.current.sources['runningCosts.fuelEconomy.combined']).toBe('checkcardetails');
      expect(result.current.dataSources.dvla).toBe(true);
      expect(result.current.dataSources.checkCarDetails).toBe(true);
    });
  });

  describe('Error handling', () => {
    test('should handle API errors', async () => {
      const errorMessage = 'Vehicle not found';
      api.get = jest.fn().mockRejectedValue({
        response: { data: { message: errorMessage } }
      });

      const { result } = renderHook(() => useEnhancedVehicleLookup());

      await act(async () => {
        await result.current.lookupVehicle('INVALID');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.vehicleData).toBe(null);
    });

    test('should handle network errors', async () => {
      api.get = jest.fn().mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useEnhancedVehicleLookup());

      await act(async () => {
        await result.current.lookupVehicle('AB12CDE');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to lookup vehicle data');
      expect(result.current.vehicleData).toBe(null);
    });

    test('should handle empty registration', async () => {
      const { result } = renderHook(() => useEnhancedVehicleLookup());

      await act(async () => {
        await result.current.lookupVehicle('');
      });

      expect(result.current.error).toBe('Registration number is required');
      expect(api.get).not.toHaveBeenCalled();
    });

    test('should handle null registration', async () => {
      const { result } = renderHook(() => useEnhancedVehicleLookup());

      await act(async () => {
        await result.current.lookupVehicle(null);
      });

      expect(result.current.error).toBe('Registration number is required');
      expect(api.get).not.toHaveBeenCalled();
    });
  });

  describe('Loading states', () => {
    test('should set loading to true during API call', async () => {
      let resolvePromise;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      api.get = jest.fn().mockReturnValue(promise);

      const { result } = renderHook(() => useEnhancedVehicleLookup());

      expect(result.current.loading).toBe(false);

      act(() => {
        result.current.lookupVehicle('AB12CDE');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      act(() => {
        resolvePromise({ data: { make: { value: 'BMW', source: 'dvla' } } });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    test('should set loading to false after successful lookup', async () => {
      api.get = jest.fn().mockResolvedValue({
        data: { make: { value: 'BMW', source: 'dvla' } }
      });

      const { result } = renderHook(() => useEnhancedVehicleLookup());

      await act(async () => {
        await result.current.lookupVehicle('AB12CDE');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    test('should set loading to false after failed lookup', async () => {
      api.get = jest.fn().mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useEnhancedVehicleLookup());

      await act(async () => {
        await result.current.lookupVehicle('AB12CDE');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Data extraction', () => {
    test('should handle nested source-tracked data', async () => {
      const mockData = {
        runningCosts: {
          fuelEconomy: {
            urban: { value: 40.5, source: 'checkcardetails' },
            extraUrban: { value: 50.2, source: 'checkcardetails' },
            combined: { value: 45.8, source: 'checkcardetails' }
          },
          co2Emissions: { value: 120, source: 'checkcardetails' }
        }
      };

      api.get = jest.fn().mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useEnhancedVehicleLookup());

      await act(async () => {
        await result.current.lookupVehicle('AB12CDE');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.vehicleData.runningCosts.fuelEconomy.urban).toBe(40.5);
      expect(result.current.vehicleData.runningCosts.fuelEconomy.extraUrban).toBe(50.2);
      expect(result.current.vehicleData.runningCosts.fuelEconomy.combined).toBe(45.8);
      expect(result.current.vehicleData.runningCosts.co2Emissions).toBe(120);
    });

    test('should handle null values in source-tracked data', async () => {
      const mockData = {
        make: { value: 'BMW', source: 'dvla' },
        model: { value: null, source: null },
        runningCosts: {
          fuelEconomy: {
            combined: { value: null, source: null }
          }
        }
      };

      api.get = jest.fn().mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useEnhancedVehicleLookup());

      await act(async () => {
        await result.current.lookupVehicle('AB12CDE');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.vehicleData.make).toBe('BMW');
      expect(result.current.vehicleData.model).toBe(null);
      expect(result.current.vehicleData.runningCosts.fuelEconomy.combined).toBe(null);
    });

    test('should handle missing nested properties', async () => {
      const mockData = {
        make: { value: 'BMW', source: 'dvla' },
        runningCosts: {}
      };

      api.get = jest.fn().mockResolvedValue({ data: mockData });

      const { result } = renderHook(() => useEnhancedVehicleLookup());

      await act(async () => {
        await result.current.lookupVehicle('AB12CDE');
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.vehicleData.make).toBe('BMW');
      expect(result.current.vehicleData.runningCosts).toEqual({});
    });
  });

  describe('Multiple lookups', () => {
    test('should handle multiple sequential lookups', async () => {
      const mockData1 = { make: { value: 'BMW', source: 'dvla' } };
      const mockData2 = { make: { value: 'Audi', source: 'dvla' } };

      api.get = jest.fn()
        .mockResolvedValueOnce({ data: mockData1 })
        .mockResolvedValueOnce({ data: mockData2 });

      const { result } = renderHook(() => useEnhancedVehicleLookup());

      await act(async () => {
        await result.current.lookupVehicle('AB12CDE');
      });

      await waitFor(() => {
        expect(result.current.vehicleData.make).toBe('BMW');
      });

      await act(async () => {
        await result.current.lookupVehicle('XY34FGH');
      });

      await waitFor(() => {
        expect(result.current.vehicleData.make).toBe('Audi');
      });

      expect(api.get).toHaveBeenCalledTimes(2);
    });

    test('should clear previous error on new lookup', async () => {
      api.get = jest.fn()
        .mockRejectedValueOnce(new Error('Error'))
        .mockResolvedValueOnce({ data: { make: { value: 'BMW', source: 'dvla' } } });

      const { result } = renderHook(() => useEnhancedVehicleLookup());

      await act(async () => {
        await result.current.lookupVehicle('INVALID');
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      await act(async () => {
        await result.current.lookupVehicle('AB12CDE');
      });

      await waitFor(() => {
        expect(result.current.error).toBe(null);
      });
    });
  });
});
