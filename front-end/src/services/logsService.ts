import api from './api';
import { type Log } from '../models/Log';
import { type Page } from '../models/Page';

export const getLogs = async (page: number, size: number): Promise<Page<Log>> => {
    const response = await api.get<Page<Log>>('/logs', {
        params: { page, size, sort: 'eventDate,desc' }
    });
    return response.data;
};

