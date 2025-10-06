export interface MonthlyConsumption {
    modified_date: string;
    date: string;
    total_kwh_consumed: number;
    price: number;
    original_file: string | null;
    file_name: string;
    label_file: string | null;
    file_label_name: string | null;
}

export interface UploadPreviewProps {
    file: File | null;
    previewUrl: string | null;
}

export interface LatestReadingProps {
    reading: MonthlyConsumption | null;
    formatDate: (dateStr?: string) => string;
    getCurrencySymbol: (code: string) => string;
    currency: string;
}

export interface UploadFormProps {
    file: File | null;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onUpload: () => void;
    isUploading: boolean;
    previewUrl: string | null;
    handleRemoveFile?: () => void;
} 