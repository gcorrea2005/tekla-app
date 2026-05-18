import { useState, useCallback } from 'react';
import teklaApi from '../api/tekla';

export function useTekla() {
  const [connected, setConnected] = useState(false);
  const [modelName, setModelName] = useState('');
  const [objects, setObjects] = useState([]);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [source, setSource] = useState('local'); // 'local' | 'remote'
  const [remoteFiles, setRemoteFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const checkStatus = useCallback(async () => {
    try {
      const { data } = await teklaApi.getStatus();
      setConnected(data.connected);
      setModelName(data.name || '');
      return data;
    } catch {
      setConnected(false);
      setModelName('');
      return { connected: false };
    }
  }, []);

  const loadObjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await teklaApi.getSelectedBeams();
      setObjects(data);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRemoteFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await teklaApi.getRemoteFiles();
      setRemoteFiles(data);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRemoteBeams = useCallback(async (fileId) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await teklaApi.getRemoteBeams(fileId);
      setObjects(data);
      setSelectedFile(fileId);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const loadComponents = useCallback(async () => {
    try {
      const { data } = await teklaApi.getComponents();
      setComponents(data);
      return data;
    } catch {
      return [];
    }
  }, []);

  const applyConnection = useCallback(async (config) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await teklaApi.applyConnection(config);
      if (data.success) {
        setResults((prev) => [...prev, { ...config, ...data }]);
      }
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const applyBatch = useCallback(async (connections) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await teklaApi.applyBatch(connections);
      setResults((prev) => [...prev, ...data.results]);
      return data;
    } catch (err) {
      setError(err.message);
      return { success: false, results: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => setResults([]), []);

  return {
    connected, modelName, objects, components,
    loading, error, results,
    source, setSource,
    remoteFiles, selectedFile,
    checkStatus, loadObjects, loadComponents,
    loadRemoteFiles, loadRemoteBeams,
    applyConnection, applyBatch, clearResults,
  };
}
