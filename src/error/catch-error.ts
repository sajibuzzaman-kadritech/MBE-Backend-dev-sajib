import express from 'express';
import HandledApplicationError from './handled-application-error';
import UnhandledApplicationError from './unhandled-application-error';

function catchError(err: Error, next: express.NextFunction) {
  const fullstack = err.stack + getCurrentStack();
  console.trace(err);// tslint:disable-line
  if (err instanceof HandledApplicationError) {
    next(err);
  } else {
    next(new UnhandledApplicationError(`${err}`));
  }
}

function getCurrentStack() {
  const err = new Error();
  return err.stack;
}

export default catchError;
