/**
 * Location Hook
 * Handles location permissions and real-time tracking
 */

import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import type { Coordinates, LocationState } from '../types';
import { MAPBOX_CONFIG } from '../services/config';

const INITIAL_STATE: LocationState = {
  current: null,
  heading: null,
  speed: null,
  accuracy: null,
  isLoading: true,
  error: null,
  permissionStatus: 'undetermined',
};

export function useLocation() {
  const [state, setState] = useState<LocationState>(INITIAL_STATE);

  // Request permission and get initial location
  const requestPermission = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          permissionStatus: 'denied',
          error: '位置情報の許可が必要です',
        }));
        return false;
      }

      setState((prev) => ({
        ...prev,
        permissionStatus: 'granted',
      }));

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setState((prev) => ({
        ...prev,
        isLoading: false,
        current: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        heading: location.coords.heading,
        speed: location.coords.speed,
        accuracy: location.coords.accuracy,
      }));

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '位置情報の取得に失敗しました';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  // Start watching location (for running mode)
  const startWatching = useCallback(async () => {
    if (state.permissionStatus !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return null;
    }

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 5,
      },
      (location) => {
        setState((prev) => ({
          ...prev,
          current: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
          heading: location.coords.heading,
          speed: location.coords.speed,
          accuracy: location.coords.accuracy,
        }));
      }
    );

    return subscription;
  }, [state.permissionStatus, requestPermission]);

  // Check permission on mount
  useEffect(() => {
    let mounted = true;

    const checkPermission = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();

      if (!mounted) return;

      if (status === 'granted') {
        setState((prev) => ({ ...prev, permissionStatus: 'granted' }));
        requestPermission();
      } else {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          permissionStatus: status === 'denied' ? 'denied' : 'undetermined',
        }));
      }
    };

    checkPermission();

    return () => {
      mounted = false;
    };
  }, [requestPermission]);

  // Get mock location for development
  const getMockLocation = useCallback((): Coordinates => {
    return {
      latitude: MAPBOX_CONFIG.defaultCenter.latitude,
      longitude: MAPBOX_CONFIG.defaultCenter.longitude,
    };
  }, []);

  return {
    ...state,
    requestPermission,
    startWatching,
    getMockLocation,
  };
}

export default useLocation;
