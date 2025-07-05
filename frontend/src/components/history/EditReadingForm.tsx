import {Paper, Box, TextField, Button, Tooltip, Typography} from '@mui/material';
import {Save, Info} from '@mui/icons-material';
import type {MonthlyConsumption} from './types';
import React from "react";

interface EditReadingFormProps {
    reading: Partial<MonthlyConsumption>;
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
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
                    <Info color="info" sx={{fontSize: 18}} />
                    <Typography variant="body2" color="text.secondary">
                        Tip: Change the date and the price will be automatically calculated based on the electricity rate for that month.
                    </Typography>
                </Box>
                <Box sx={{display: 'flex', gap: 2}}>
                    <Tooltip 
                        title="Change the date to automatically recalculate the price based on the electricity rate for that month"
                        placement="top"
                        arrow
                    >
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
                    </Tooltip>
                    <TextField
                        label="Consumption (kWh)"
                        type="number"
                        value={reading.total_kwh_consumed || 0}
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
                    <Tooltip 
                        title="Price will be automatically calculated based on consumption and the electricity rate for the selected date"
                        placement="top"
                        arrow
                    >
                        <TextField
                            label={`Price (${getCurrencySymbol(currency)})`}
                            type="number"
                            value={reading.price || 0}
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
                    </Tooltip>
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