export interface ElectricityPrice {
    _id: string;
    date: string;
    price: number;
    is_default: boolean;
}

export interface SortConfig {
    key: 'date' | 'price';
    direction: 'ascending' | 'descending';
} 