import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface PaymentState {
    token: string | null;
    merchant_oid: string | null;
    status: 'idle' | 'loading' | 'success' | 'failed';
}

const initialState: PaymentState = {
    token: null,
    merchant_oid: null,
    status: 'idle',
};

export const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {
        setPaymentToken: (state, action: PayloadAction<{ token: string; merchant_oid: string }>) => {
            state.token = action.payload.token;
            state.merchant_oid = action.payload.merchant_oid;
        },
        setPaymentStatus: (state, action: PayloadAction<PaymentState['status']>) => {
            state.status = action.payload;
        }
    },
});

export const { setPaymentToken, setPaymentStatus } = paymentSlice.actions;
export default paymentSlice.reducer;
