export interface MonthlyConsumption {
    _id: string;
    date: string;
    total_kwh_consumed: number;
    price: number;
    original_file: any;
    file_name: string;
    label_file: any;
    file_label_name: any;
    created_at: string;
    updated_at: string;
}

export interface ConsumptionStats {
    totalReadings: number;
    lastReadingDate: string | null;
    averageConsumption: number;
    totalSpending: number;
    averageMonthlySpending: number;
    totalConsumption: number;
    averageCost: number;
    highestConsumption: number;
    lowestConsumption: number;
    highestCost: number;
    lowestCost: number;
}

export type ImageTab = 'original' | 'labeled';

export interface ConsumptionStatsProps {
    stats: ConsumptionStats;
    currency: string;
    getCurrencySymbol: (currencyCode: string) => string;
    formatDate: (dateString: string | undefined) => string;
    formatTimestamp: (dateString: string | undefined) => string;
    isMobile: boolean;
}

export interface ReadingCardProps {
    reading: MonthlyConsumption;
    onEditClick: (id: string) => void;
    onDetailClick: (id: string) => void;
    onDeleteClick: (id: string) => void;
    actionMenuAnchor: HTMLElement | null;
    actionMenuId: string | null;
    onActionMenuOpen: (event: React.MouseEvent<HTMLElement>, id: string) => void;
    onActionMenuClose: () => void;
    getCurrencySymbol: (currencyCode: string) => string;
    currency: string;
    formatDate: (dateString: string | undefined) => string;
}

export interface ReadingDetailsProps {
    reading: MonthlyConsumption;
    activeImageTab: ImageTab;
    onImageTabChange: (tab: ImageTab) => void;
    getFileUrl: (fileId: string | undefined) => string;
    formatDate: (dateString: string | undefined) => string;
    formatTimestamp: (dateString: string | undefined) => string;
    getCurrencySymbol: (currencyCode: string) => string;
    currency: string;
    isMobile: boolean;
}

export interface EditReadingFormProps {
    reading: MonthlyConsumption;
    onEditFormChange: (field: keyof MonthlyConsumption, value: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    currency: string;
    getCurrencySymbol: (currencyCode: string) => string;
}

export interface DeleteReadingDialogProps {
    readingDate: string;
    onCancel: () => void;
    onConfirm: () => void;
} 