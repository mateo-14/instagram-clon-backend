import express from 'express';

export interface Request extends express.Request {}

export interface Response extends express.Response {}

export interface Controller {
  create(req: Request, res: Response): void;
  add(req: Request, res: Response): void;
  get(req: Request, res: Response): void;
  getOne(req: Request, res: Response): void;
  delete(req: Request, res: Response): void;
  update(req: Request, res: Response): void;
}
