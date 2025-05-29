export interface ErrorLog {
  id: string;
  userId: string;
  errorCode: string;
  errorMessage: string;
  requestPath: string;
  requestMethod: string;
  requestPayload: any;
  stackTrace: string;
  errorType: string;
  createdAt: string;
  updatedAt: string;
}