export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class BadRequest extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class UnauthorizedClient extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class PaymentRequired extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class ForbiddenRequest extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
  }
}
