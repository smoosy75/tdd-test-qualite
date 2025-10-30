import "express";

declare global {
  namespace Express {
    interface Request {
      user?: any; // si tu veux être strict, on mettra un vrai type après :)
    }
  }
}