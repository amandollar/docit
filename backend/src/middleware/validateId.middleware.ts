import { Request, Response, NextFunction } from 'express';
import { isValidObjectId } from '../utils/validators';

/**
 * Validates that req.params[paramName] is a valid MongoDB ObjectId.
 * Use before routes that use :id, :workspaceId, :userId, etc.
 */
export function validateParamId(paramName: string = 'id') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.params[paramName];
    if (!value || !isValidObjectId(value)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: `Invalid ${paramName}` },
      });
      return;
    }
    next();
  };
}
