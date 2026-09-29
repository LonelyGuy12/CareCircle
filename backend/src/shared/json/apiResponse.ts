import { HttpStatusCode } from '@shared/constants/httpStatus';

/**
 * @module shared/json/apiResponse
 * @description Standardized successful API response class.
 */
export class ApiResponse<T = unknown> {
    public readonly success: boolean;

    constructor(
        public readonly statusCode: HttpStatusCode,
        public readonly data: T,
        public readonly message: string = 'Success',
    ) {
        this.success = statusCode < 400;
    }

    /** Serialize to a plain object for c.json(). */
    toJSON() {
        return {
            success: this.success,
            message: this.message,
            data: this.data,
        };
    }

    /** Static helper for quick success responses */
    static success<T>(data: T, message = 'Success', statusCode: HttpStatusCode = 200) {
        return new ApiResponse(statusCode, data, message);
    }
}
