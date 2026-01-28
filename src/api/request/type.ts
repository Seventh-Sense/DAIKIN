import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

export interface ApiResponse<T = any> {
    status: string
    data: T
}


