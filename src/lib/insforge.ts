import { createClient } from '@insforge/sdk';

export const insforge = createClient({
    baseUrl: 'https://hi2vts4c.ap-southeast.insforge.app',
    anonKey:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MTEwNDl9.TFsox1iaDwVobOwqECM4ulskPBVURXI82MjIOwp5evM'
});
