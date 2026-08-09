import { useMutation } from '@tanstack/react-query';
import { scanFoodImageApi } from '../api/food.api';
import { scanBarcodeApi } from '../api/barcode.api';
import { compressImage } from '../utils/imageCompression';
import { useUIStore } from '../store/uiStore';

export const useScanner = () => {
  const addToast = useUIStore((state) => state.addToast);

  const scanImageMutation = useMutation(async (file) => {
    const compressed = await compressImage(file);
    const formData = new FormData();
    formData.append('image', compressed);
    return await scanFoodImageApi(formData);
  });

  const scanBarcodeMutation = useMutation(async (barcode) => {
    return await scanBarcodeApi(barcode);
  });

  return {
    scanImage: scanImageMutation.mutateAsync,
    isScanningImage: scanImageMutation.isLoading,
    imageResult: scanImageMutation.data,

    scanBarcode: scanBarcodeMutation.mutateAsync,
    isScanningBarcode: scanBarcodeMutation.isLoading,
    barcodeResult: scanBarcodeMutation.data
  };
};
