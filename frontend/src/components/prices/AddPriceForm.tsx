import {Box, Button, FormControlLabel, Switch, TextField} from '@mui/material';
import type {ElectricityPrice} from './types';
import React from "react";

interface AddPriceFormProps {
    newPrice: Partial<ElectricityPrice>;
    onNewPriceChange: (field: keyof ElectricityPrice, value: string | number | boolean) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isEditing: boolean;
    currency: string;
    getCurrencySymbol: (currencyCode: string) => string;
}

export default function AddPriceForm({
    newPrice,
    onNewPriceChange,
    onSubmit,
    onCancel,
    isEditing,
    currency,
    getCurrencySymbol
}: AddPriceFormProps) {
    return (
        <Box component="form" onSubmit={onSubmit} sx={{mb: 4}}>
            <Box sx={{display: 'flex', gap: 2, mb: 2}}>
                <TextField
                    label="Date"
                    type="date"
                    value={newPrice.date || ''}
                    onChange={e => onNewPriceChange('date', e.target.value)}
                    slotProps={{
                        inputLabel: { shrink: true }
                    }}
                    required
                    fullWidth
                />
                <TextField
                    label={`Price (${getCurrencySymbol(currency)})`}
                    type="number"
                    value={newPrice.price || ''}
                    onChange={e => onNewPriceChange('price', e.target.value)}
                    slotProps={{
                        inputLabel: { shrink: true }
                    }}
                    required
                    fullWidth
                />
            </Box>
            <Box sx={{display: 'flex', gap: 2, alignItems: 'center'}}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={newPrice.is_default || false}
                            onChange={e => onNewPriceChange('is_default', e.target.checked)}
                        />
                    }
                    label="Default Price"
                />
                <Box sx={{flexGrow: 1}}/>
                {isEditing && (
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={onCancel}
                        sx={{mr: 1}}
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                >
                    {isEditing ? 'Update Price' : 'Add Price'}
                </Button>
            </Box>
        </Box>
    );
} 