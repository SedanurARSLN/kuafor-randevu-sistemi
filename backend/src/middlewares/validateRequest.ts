import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validateRequest = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log('❌ VALIDATION ERROR on', req.method, req.originalUrl);
        console.log('   BODY:', JSON.stringify(req.body));
        console.log(
            '   ERRORS:',
            JSON.stringify(
                errors.array().map((err) => ({
                    field: (err as any).path,
                    message: err.msg,
                }))
            )
        );

        res.status(400).json({
            success: false,
            message: 'Doğrulama hatası',
            errors: errors.array().map((err) => ({
                field: (err as any).path,
                message: err.msg,
            })),
        });
        return;
    }

    next();
};