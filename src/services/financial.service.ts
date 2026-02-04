import { api } from '@/lib/axios';

/**
 * Response type for notify invoices endpoint
 */
export interface NotifyInvoicesReport {
    totalFound: number;
    sent: number;
    failed: number;
}

/**
 * Financial Service
 * Handles financial operations like notifications for pending invoices
 */
export const financialService = {
    /**
     * Notifies all members with pending invoices for the current month via WhatsApp
     * @param workspaceId - The workspace ID
     * @returns Report with total found, sent, and failed notifications
     */
    notifyPendingInvoices: async (workspaceId: string): Promise<NotifyInvoicesReport> => {
        const response = await api.post(`/memberships/${workspaceId}/notify-invoices`);
        return response.data.data;
    },
};
