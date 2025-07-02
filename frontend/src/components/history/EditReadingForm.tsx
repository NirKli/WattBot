import {Paper, Box, TextField, Button} from '@mui/material';
import {Save} from '@mui/icons-material';
import type {MonthlyConsumption} from './types';
import React from "react";

interface EditReadingFormProps {
    reading: MonthlyConsumption;
    onEditFormChange: (field: keyof MonthlyConsumption, value: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    currency: string;
    getCurrencySymbol: (currencyCode: string) => string;
}

export default function EditReadingForm({
    reading,
    onEditFormChange,
    onSubmit,
    onCancel,
    currency,
    getCurrencySymbol
}: EditReadingFormProps) {
    return (
        <Paper elevation={1} sx={{p: 2, mb: 2}}>
            <Box component="form" onSubmit={onSubmit} sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                <Box sx={{display: 'flex', gap: 2}}>
                    <TextField
                        label="Date"
                        type="date"
                        value={reading.date ? reading.date.split('T')[0] : ''}
                        onChange={e => onEditFormChange('date', e.target.value)}
                        slotProps={{
                            inputLabel: { shrink: true }
                        }}
                        required
                        fullWidth
                    />
                    <TextField
                        label="Consumption (kWh)"
                        type="number"
                        value={reading.total_kwh_consumed}
                        onChange={e => onEditFormChange('total_kwh_consumed', e.target.value)}
                        sx={{flex: 1, minWidth: 120}}
                        size="small"
                        slotProps={{
                            input: {
                                inputProps: {
                                    min: 0,
                                    step: 0.01,
                                },
                            },
                        }}
                    />
                    <TextField
                        label={`Price (${getCurrencySymbol(currency)})`}
                        type="number"
                        value={reading.price}
                        onChange={e => onEditFormChange('price', e.target.value)}
                        sx={{flex: 1, minWidth: 120}}
                        size="small"
                        slotProps={{
                            input: {
                                inputProps: {
                                    min: 0,
                                    step: 0.0001,
                                },
                            },
                        }}
                    />
                </Box>
                <Box display="flex" gap={1} ml="auto">
                    <Button onClick={onCancel} variant="outlined">Cancel</Button>
                    <Button type="submit" variant="contained" color="primary" startIcon={<Save/>}>
                        Save
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
} 